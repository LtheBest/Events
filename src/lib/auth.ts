import bcrypt from 'bcryptjs';
import type { Company, Env } from '../types';

/**
 * Utilitaires d'authentification
 */

/**
 * Hash un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Vérifie un mot de passe
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Génère un token JWT simple (pour Cloudflare Workers)
 */
export async function generateToken(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
  
  const data = `${encodedHeader}.${encodedPayload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${data}.${encodedSignature}`;
}

/**
 * Vérifie et décode un token JWT
 */
export async function verifyToken(token: string, secret: string): Promise<any> {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    
    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new Error('Invalid token format');
    }
    
    // Vérifier la signature
    const data = `${encodedHeader}.${encodedPayload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signature = Uint8Array.from(atob(encodedSignature), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
    
    if (!isValid) {
      throw new Error('Invalid signature');
    }
    
    // Décoder le payload
    const payload = JSON.parse(atob(encodedPayload));
    
    // Vérifier l'expiration
    if (payload.exp && payload.exp < Date.now()) {
      throw new Error('Token expired');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Token verification failed');
  }
}

/**
 * Extrait le token du header Authorization
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware d'authentification
 */
export async function requireAuth(c: any): Promise<Company | null> {
  const authHeader = c.req.header('Authorization');
  const token = extractToken(authHeader);
  
  if (!token) {
    return null;
  }
  
  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    
    // Récupérer l'entreprise depuis la DB
    const company = await c.env.DB.prepare(
      'SELECT * FROM companies WHERE id = ? AND is_active = 1'
    ).bind(payload.companyId).first();
    
    return company as Company | null;
  } catch (error) {
    return null;
  }
}

/**
 * Valide le format d'un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide la force d'un mot de passe
 */
export function isStrongPassword(password: string): boolean {
  // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
}
