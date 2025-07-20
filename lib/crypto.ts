import { createCipheriv, createDecipheriv, scryptSync, randomBytes } from 'crypto';

// --- Security Configuration ---
// IMPORTANT: These values MUST be stored securely as environment variables.
// They should be 32 and 16 characters long, respectively.
const secret = process.env.ENCRYPTION_SECRET;

if (!secret || secret.length !== 32) {
  throw new Error('ENCRYPTION_SECRET must be set in environment variables and be 32 characters long.');
}

// The encryption algorithm.
const algorithm = 'aes-256-cbc';

// Generate a key from the secret.
const key = scryptSync(secret, 'salt', 32);

// --- Encryption Function ---
// Takes a plain text string and returns an IV + encrypted hex string.
export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, Buffer.from(key), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// --- Decryption Function ---
// Takes an IV + encrypted hex string and returns the original plain text.
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedData = Buffer.from(parts.join(':'), 'hex');
  const decipher = createDecipheriv(algorithm, Buffer.from(key), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decrypted.toString('utf8');
}
