/**
 * Client-side cryptography utilities
 * Hashes passwords before transmission to avoid sending plain text
 */

/**
 * Hash a password using SHA-256
 * This is applied client-side before sending to the server
 * The server will then apply bcrypt on top of this hash
 */
export async function hashPassword(password: string): Promise<string> {
  // Convert password string to Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Hash the password using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Validate password meets minimum requirements before hashing
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

