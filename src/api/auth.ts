import { Hono } from 'hono';
import { z } from 'zod';
import type { Env, Company } from '../types';
import { hashPassword, verifyPassword, generateToken, isValidEmail, isStrongPassword } from '../lib/auth';
import { createDbService } from '../lib/db';
import { createEmailService } from '../lib/email';

const auth = new Hono<{ Bindings: Env }>();

// Schema de validation pour l'inscription
const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  company_type: z.enum(['club', 'pme', 'grande_entreprise']),
  plan: z.enum(['decouverte', 'essentiel', 'pro', 'premium']),
  phone: z.string().optional(),
  siren: z.string().optional(),
  address: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les conditions d\'utilisation'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

// Schema de validation pour la connexion
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  rememberMe: z.boolean().optional()
});

/**
 * POST /api/auth/register - Inscription d'une nouvelle entreprise
 */
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validation des données
    const validatedData = registerSchema.parse(body);
    
    // Vérifier la force du mot de passe
    if (!isStrongPassword(validatedData.password)) {
      return c.json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre'
      }, 400);
    }
    
    const db = createDbService(c.env);
    
    // Vérifier si l'email existe déjà
    const existingCompany = await db.queryOne<Company>(
      'SELECT * FROM companies WHERE email = ?',
      [validatedData.email]
    );
    
    if (existingCompany) {
      return c.json({
        success: false,
        error: 'Un compte existe déjà avec cet email'
      }, 409);
    }
    
    // Hasher le mot de passe
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Déterminer le statut de l'abonnement
    let subscription_status = 'active';
    
    // Si plan payant sans devis (Essentiel), rediriger vers paiement
    if (validatedData.plan === 'essentiel') {
      subscription_status = 'pending';
    }
    
    // Si plan sur devis (Pro ou Premium), mettre en attente validation admin
    if (validatedData.plan === 'pro' || validatedData.plan === 'premium') {
      subscription_status = 'pending';
    }
    
    // Créer l'entreprise
    const companyId = db.generateId();
    await db.execute(
      `INSERT INTO companies (
        id, name, email, password, phone, siren, address, 
        company_type, plan, subscription_status, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyId,
        validatedData.name,
        validatedData.email,
        hashedPassword,
        validatedData.phone || null,
        validatedData.siren || null,
        validatedData.address || null,
        validatedData.company_type,
        validatedData.plan,
        subscription_status,
        validatedData.plan === 'decouverte' ? 1 : 0 // Actif seulement si plan gratuit
      ]
    );
    
    // Récupérer l'entreprise créée
    const company = await db.queryOne<Company>(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );
    
    if (!company) {
      return c.json({
        success: false,
        error: 'Erreur lors de la création du compte'
      }, 500);
    }
    
    // Envoyer l'email de bienvenue
    const emailService = createEmailService(c.env);
    await emailService.sendWelcomeEmail(company);
    
    // Si plan gratuit, connecter directement l'utilisateur
    if (validatedData.plan === 'decouverte') {
      const token = await generateToken(
        { companyId: company.id, email: company.email },
        c.env.JWT_SECRET
      );
      
      return c.json({
        success: true,
        message: 'Compte créé avec succès',
        data: {
          token,
          company: {
            id: company.id,
            name: company.name,
            email: company.email,
            company_type: company.company_type,
            plan: company.plan,
            subscription_status: company.subscription_status
          },
          redirect: '/dashboard'
        }
      });
    }
    
    // Si plan payant, retourner l'info appropriée
    if (validatedData.plan === 'essentiel') {
      return c.json({
        success: true,
        message: 'Compte créé. Veuillez procéder au paiement.',
        data: {
          company: {
            id: company.id,
            name: company.name,
            email: company.email,
            plan: company.plan
          },
          redirect: '/payment',
          requiresPayment: true
        }
      });
    }
    
    // Si plan sur devis (Pro ou Premium)
    return c.json({
      success: true,
      message: 'Votre demande a été envoyée. Notre équipe vous contactera sous peu.',
      data: {
        company: {
          id: company.id,
          name: company.name,
          email: company.email,
          plan: company.plan
        },
        redirect: '/contact-support',
        requiresApproval: true
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      }, 400);
    }
    
    console.error('Register error:', error);
    return c.json({
      success: false,
      error: 'Erreur lors de la création du compte'
    }, 500);
  }
});

/**
 * POST /api/auth/login - Connexion
 */
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validation des données
    const validatedData = loginSchema.parse(body);
    
    const db = createDbService(c.env);
    
    // Récupérer l'entreprise
    const company = await db.queryOne<Company>(
      'SELECT * FROM companies WHERE email = ?',
      [validatedData.email]
    );
    
    if (!company) {
      return c.json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      }, 401);
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(validatedData.password, company.password);
    
    if (!isPasswordValid) {
      return c.json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      }, 401);
    }
    
    // Vérifier si le compte est actif
    if (!company.is_active) {
      return c.json({
        success: false,
        error: 'Votre compte est en attente de validation. Veuillez contacter le support.'
      }, 403);
    }
    
    // Générer le token
    const token = await generateToken(
      { companyId: company.id, email: company.email },
      c.env.JWT_SECRET
    );
    
    return c.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        company: {
          id: company.id,
          name: company.name,
          email: company.email,
          company_type: company.company_type,
          plan: company.plan,
          subscription_status: company.subscription_status,
          logo: company.logo,
          theme: company.theme,
          events_created: company.events_created
        }
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      }, 400);
    }
    
    console.error('Login error:', error);
    return c.json({
      success: false,
      error: 'Erreur lors de la connexion'
    }, 500);
  }
});

/**
 * GET /api/auth/me - Récupérer les informations de l'utilisateur connecté
 */
auth.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        success: false,
        error: 'Token manquant'
      }, 401);
    }
    
    const token = authHeader.substring(7);
    const { verifyToken: verify } = await import('../lib/auth');
    const payload = await verify(token, c.env.JWT_SECRET);
    
    const db = createDbService(c.env);
    const company = await db.queryOne<Company>(
      'SELECT * FROM companies WHERE id = ? AND is_active = 1',
      [payload.companyId]
    );
    
    if (!company) {
      return c.json({
        success: false,
        error: 'Utilisateur non trouvé'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: {
        company: {
          id: company.id,
          name: company.name,
          email: company.email,
          phone: company.phone,
          siren: company.siren,
          address: company.address,
          company_type: company.company_type,
          plan: company.plan,
          subscription_status: company.subscription_status,
          logo: company.logo,
          theme: company.theme,
          events_created: company.events_created,
          created_at: company.created_at
        }
      }
    });
    
  } catch (error) {
    console.error('Get me error:', error);
    return c.json({
      success: false,
      error: 'Token invalide'
    }, 401);
  }
});

export default auth;
