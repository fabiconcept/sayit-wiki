import { encrypt, decrypt } from './crypto';

const USER_ID_KEY = 'sayit-user-id';

/**
 * Generate a unique user ID
 * Format: timestamp-random-hash
 */
function generateUserId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    return `user-${timestamp}-${random}${random2}`;
}

/**
 * Get or create encrypted user ID from localStorage
 * This function is idempotent - it will return the same ID for the same browser
 */
export function getUserId(): string {
    if (typeof window === 'undefined') {
        return '';
    }

    try {
        const stored = localStorage.getItem(USER_ID_KEY);
        
        if (stored) {
            try {
                const decrypted = decrypt(stored);
                if (decrypted && decrypted.startsWith('user-')) {
                    return decrypted;
                }
            } catch (error) {
                console.warn('Failed to decrypt stored user ID, generating new one');
            }
        }

        const newUserId = generateUserId();
        const encrypted = encrypt(newUserId);
        localStorage.setItem(USER_ID_KEY, encrypted);
        
        return newUserId;
    } catch (error) {
        console.error('Error managing user ID:', error);
        return generateUserId();
    }
}

/**
 * Get encrypted user ID for API requests
 */
export function getEncryptedUserId(): string {
    if (typeof window === 'undefined') {
        return '';
    }

    try {
        const stored = localStorage.getItem(USER_ID_KEY);
        if (stored) {
            return stored;
        }

        const userId = getUserId();
        return encrypt(userId);
    } catch (error) {
        console.error('Error getting encrypted user ID:', error);
        return '';
    }
}

/**
 * Clear user ID (for testing or privacy purposes)
 */
export function clearUserId(): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.removeItem(USER_ID_KEY);
    } catch (error) {
        console.error('Error clearing user ID:', error);
    }
}

/**
 * Check if user has a stored ID
 */
export function hasUserId(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        return localStorage.getItem(USER_ID_KEY) !== null;
    } catch (error) {
        return false;
    }
}
