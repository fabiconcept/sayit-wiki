import { NextRequest, NextResponse } from 'next/server';
import { decrypt, encrypt } from '../crypto';

export interface ValidatedUserIdResult {
    userId: string;
    encryptedUserId: string;
    isValid: boolean;
    wasRegenerated: boolean;
}

/**
 * Validates the encrypted userId from the request header
 * If invalid or tampered, generates a new userId
 */
export function validateAndExtractUserId(request: NextRequest): ValidatedUserIdResult {
    const encryptedUserId = request.headers.get('X-User-Id');
    
    if (!encryptedUserId) {
        // No userId provided, generate new one
        const newUserId = generateNewUserId();
        const newEncryptedUserId = encrypt(newUserId);
        
        return {
            userId: newUserId,
            encryptedUserId: newEncryptedUserId,
            isValid: false,
            wasRegenerated: true,
        };
    }
    
    try {
        // Try to decrypt the userId
        const decryptedUserId = decrypt(encryptedUserId);
        
        // Validate the format: should be "user-{timestamp}-{random}"
        if (!isValidUserIdFormat(decryptedUserId)) {
            // Invalid format, generate new userId
            const newUserId = generateNewUserId();
            const newEncryptedUserId = encrypt(newUserId);
            
            console.warn('Invalid userId format detected, regenerating:', {
                old: decryptedUserId.substring(0, 20) + '...',
                new: newUserId.substring(0, 20) + '...',
            });
            
            return {
                userId: newUserId,
                encryptedUserId: newEncryptedUserId,
                isValid: false,
                wasRegenerated: true,
            };
        }
        
        // Valid userId
        return {
            userId: decryptedUserId,
            encryptedUserId,
            isValid: true,
            wasRegenerated: false,
        };
    } catch (error) {
        // Decryption failed (tampered or corrupted), generate new userId
        const newUserId = generateNewUserId();
        const newEncryptedUserId = encrypt(newUserId);
        
        console.warn('Failed to decrypt userId, regenerating:', error);
        
        return {
            userId: newUserId,
            encryptedUserId: newEncryptedUserId,
            isValid: false,
            wasRegenerated: true,
        };
    }
}

/**
 * Generates a new userId with format: user-{timestamp}-{random}
 */
function generateNewUserId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    return `user-${timestamp}-${random}${random2}`;
}

/**
 * Validates userId format
 */
function isValidUserIdFormat(userId: string): boolean {
    if (!userId || typeof userId !== 'string') {
        return false;
    }
    
    // Should match pattern: user-{alphanumeric}-{alphanumeric}
    const pattern = /^user-[a-z0-9]+-[a-z0-9]+$/;
    return pattern.test(userId);
}

/**
 * Middleware to validate userId and add it to the request
 * Returns error response if userId is required but missing
 */
export function requireValidUserId(request: NextRequest, required: boolean = true): {
    userId: string;
    encryptedUserId: string;
    response?: NextResponse;
} {
    const result = validateAndExtractUserId(request);
    
    if (required && !result.userId) {
        return {
            userId: '',
            encryptedUserId: '',
            response: NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Missing or invalid user ID',
                    },
                },
                { status: 401 }
            ),
        };
    }
    
    return {
        userId: result.userId,
        encryptedUserId: result.encryptedUserId,
    };
}

/**
 * Creates a response with a new userId header if it was regenerated
 */
export function addUserIdHeader(response: NextResponse, encryptedUserId: string): NextResponse {
    response.headers.set('X-New-User-Id', encryptedUserId);
    return response;
}
