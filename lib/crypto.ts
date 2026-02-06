/**
 * Custom encryption/decryption algorithm
 * No external libraries, pure JavaScript implementation
 * Consistent and reversible XOR-based cipher
 */

const SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key-change-in-production';

/**
 * Convert string to byte array
 */
function stringToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes.push(code & 0xFF);
    if (code > 255) {
      bytes.push((code >> 8) & 0xFF);
    }
  }
  return bytes;
}

/**
 * Generate expanded key stream from secret
 */
function generateKeyStream(length: number, salt: number): number[] {
  const keyBytes = stringToBytes(SECRET);
  const keyStream: number[] = [];
  
  let state = salt;
  
  for (let i = 0; i < length; i++) {
    // Mix key byte with state
    const keyByte = keyBytes[i % keyBytes.length];
    state = ((state * 1103515245 + 12345) ^ keyByte) & 0x7FFFFFFF;
    keyStream.push((state >> 16) & 0xFF);
  }
  
  return keyStream;
}

/**
 * XOR bytes with key stream
 */
function xorBytes(data: number[], keyStream: number[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    result.push(data[i] ^ keyStream[i]);
  }
  return result;
}

/**
 * Permute bytes (reversible shuffling)
 */
function permute(data: number[], salt: number, reverse: boolean): number[] {
  const result = new Array(data.length);
  const len = data.length;
  
  // Generate permutation indices based on salt
  const indices: number[] = [];
  for (let i = 0; i < len; i++) {
    indices.push(i);
  }
  
  // Shuffle indices deterministically using salt
  let seed = salt;
  for (let i = len - 1; i > 0; i--) {
    seed = (seed * 48271) % 2147483647;
    const j = seed % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  // Apply or reverse permutation
  if (reverse) {
    for (let i = 0; i < len; i++) {
      result[indices[i]] = data[i];
    }
  } else {
    for (let i = 0; i < len; i++) {
      result[i] = data[indices[i]];
    }
  }
  
  return result;
}

/**
 * Convert bytes to base64
 */
function toBase64(bytes: number[]): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  
  for (let i = 0; i < bytes.length; i += 3) {
    const byte1 = bytes[i];
    const byte2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const byte3 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    
    const encoded1 = byte1 >> 2;
    const encoded2 = ((byte1 & 3) << 4) | (byte2 >> 4);
    const encoded3 = ((byte2 & 15) << 2) | (byte3 >> 6);
    const encoded4 = byte3 & 63;
    
    result += chars[encoded1] + chars[encoded2];
    result += i + 1 < bytes.length ? chars[encoded3] : '=';
    result += i + 2 < bytes.length ? chars[encoded4] : '=';
  }
  
  return result;
}

/**
 * Convert base64 to bytes
 */
function fromBase64(base64: string): number[] {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup: { [key: string]: number } = {};
  for (let i = 0; i < chars.length; i++) {
    lookup[chars[i]] = i;
  }
  
  base64 = base64.replace(/=/g, '');
  const bytes: number[] = [];
  
  for (let i = 0; i < base64.length; i += 4) {
    const encoded1 = lookup[base64[i]] || 0;
    const encoded2 = lookup[base64[i + 1]] || 0;
    const encoded3 = lookup[base64[i + 2]] || 0;
    const encoded4 = lookup[base64[i + 3]] || 0;
    
    bytes.push((encoded1 << 2) | (encoded2 >> 4));
    if (i + 2 < base64.length) {
      bytes.push(((encoded2 & 15) << 4) | (encoded3 >> 2));
    }
    if (i + 3 < base64.length) {
      bytes.push(((encoded3 & 3) << 6) | encoded4);
    }
  }
  
  return bytes;
}

/**
 * Encrypt plaintext string
 */
export function encrypt(plaintext: string): string {
  // Generate random salt (fixed for consistency, but changes per encryption)
  const salt = Math.floor(Math.random() * 0xFFFFFF);
  
  // Convert to bytes
  const encoder = new TextEncoder();
  const dataBytes = Array.from(encoder.encode(plaintext));
  
  // Generate key stream
  const keyStream = generateKeyStream(dataBytes.length, salt);
  
  // Step 1: XOR with key stream
  let encrypted = xorBytes(dataBytes, keyStream);
  
  // Step 2: Permute bytes
  encrypted = permute(encrypted, salt, false);
  
  // Step 3: XOR again (double encryption)
  const keyStream2 = generateKeyStream(encrypted.length, salt ^ 0xAAAAAAAA);
  encrypted = xorBytes(encrypted, keyStream2);
  
  // Prepend salt (3 bytes)
  const result = [
    (salt >> 16) & 0xFF,
    (salt >> 8) & 0xFF,
    salt & 0xFF,
    ...encrypted
  ];
  
  return toBase64(result);
}

/**
 * Decrypt ciphertext string
 */
export function decrypt(ciphertext: string): string {
  // Decode from base64
  const combined = fromBase64(ciphertext);
  
  // Extract salt
  const salt = (combined[0] << 16) | (combined[1] << 8) | combined[2];
  let encrypted = combined.slice(3);
  
  // Reverse Step 3: XOR again
  const keyStream2 = generateKeyStream(encrypted.length, salt ^ 0xAAAAAAAA);
  encrypted = xorBytes(encrypted, keyStream2);
  
  // Reverse Step 2: Unpermute bytes
  encrypted = permute(encrypted, salt, true);
  
  // Reverse Step 1: XOR with key stream
  const keyStream = generateKeyStream(encrypted.length, salt);
  const decrypted = xorBytes(encrypted, keyStream);
  
  // Convert back to string
  const decoder = new TextDecoder();
  return decoder.decode(new Uint8Array(decrypted));
}

/**
 * Generate a hash of the input (useful for verification)
 */
export function hash(input: string): string {
  const bytes = stringToBytes(input);
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  
  for (let i = 0; i < bytes.length; i++) {
    h1 = Math.imul(h1 ^ bytes[i], 2654435761);
    h2 = Math.imul(h2 ^ bytes[i], 1597334677);
  }
  
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}