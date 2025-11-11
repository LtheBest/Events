import { Hono } from 'hono';
import { z } from 'zod';
import type { Env, Event } from '../types';
import { requireAuth } from '../lib/auth';
import { createDbService } from '../lib/db';
import { generatePublicLink, generateQRCode } from '../lib/qrcode';
import { createEmailService } from '../lib/email';

const events = new Hono<{ Bindings: Env }>();

// Schema de validation pour la création d'événement
const createEventSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  type: z.enum(['ponctuel', 'recurrent']),
  event_type_category: z.string().optional(),
  date: z.string(),
  time: z.string(),
  duration: z.number().optional(),
  location: z.string().min(5, 'L\'adresse doit être complète'),
  invited_emails: z.array(z.string().email()).optional()
});

/**
 * GET /api/events - Récupérer tous les événements de l'entreprise
 */
events.get('/', async (c) => {
  try {
    const company = await requireAuth(c);
    
    if (!company) {
      return c.json({ success: false, error: 'Non autorisé' }, 401);
    }
    
    const db = createDbService(c.env);
    
    const eventsList = await db.query<Event>(
      `SELECT * FROM events 
       WHERE company_id = ? 
       ORDER BY date DESC, time DESC`,
      [company.id]
    );
    
    // Compter les participants pour chaque événement
    const eventsWithStats = await Promise.all(
      eventsList.map(async (event) => {
        const stats = await db.queryOne<{ total: number, drivers: number, passengers: number }>(
          `SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN role = 'driver' THEN 1 ELSE 0 END) as drivers,
            SUM(CASE WHEN role = 'passenger' THEN 1 ELSE 0 END) as passengers
           FROM participants 
           WHERE event_id = ? AND status = 'confirmed'`,
          [event.id]
        );
        
        return {
          ...event,
          stats: stats || { total: 0, drivers: 0, passengers: 0 }
        };
      })
    );
    
    return c.json({
      success: true,
      data: { events: eventsWithStats }
    });
    
  } catch (error) {
    console.error('Get events error:', error);
    return c.json({
      success: false,
      error: 'Erreur lors de la récupération des événements'
    }, 500);
  }
});

/**
 * POST /api/events - Créer un nouvel événement
 */
events.post('/', async (c) => {
  try {
    const company = await requireAuth(c);
    
    if (!company) {
      return c.json({ success: false, error: 'Non autorisé' }, 401);
    }
    
    const body = await c.req.json();
    const validatedData = createEventSchema.parse(body);
    
    const db = createDbService(c.env);
    
    // Vérifier les limites du plan
    const { PLAN_LIMITS } = await import('../types');
    const planLimits = PLAN_LIMITS[company.plan as keyof typeof PLAN_LIMITS];
    
    if (company.events_created >= planLimits.eventsPerYear) {
      return c.json({
        success: false,
        error: `Limite d'événements atteinte pour votre plan (${planLimits.eventsPerYear}/an)`
      }, 403);
    }
    
    // Générer le lien public et le QR code
    const publicLink = generatePublicLink(validatedData.name);
    const publicUrl = `${c.env.APP_URL}/join/${publicLink}`;
    const qrCode = await generateQRCode(publicUrl);
    
    // Créer l'événement
    const eventId = db.generateId();
    await db.execute(
      `INSERT INTO events (
        id, company_id, name, type, event_type_category, 
        date, time, duration, location, public_link, qr_code, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId,
        company.id,
        validatedData.name,
        validatedData.type,
        validatedData.event_type_category || null,
        validatedData.date,
        validatedData.time,
        validatedData.duration || null,
        validatedData.location,
        publicLink,
        qrCode,
        'active'
      ]
    );
    
    // Mettre à jour le compteur d'événements
    await db.execute(
      'UPDATE companies SET events_created = events_created + 1 WHERE id = ?',
      [company.id]
    );
    
    // Récupérer l'événement créé
    const event = await db.queryOne<Event>(
      'SELECT * FROM events WHERE id = ?',
      [eventId]
    );
    
    // Envoyer les invitations par email
    if (validatedData.invited_emails && validatedData.invited_emails.length > 0) {
      const emailService = createEmailService(c.env);
      
      // Enregistrer les invitations
      for (const email of validatedData.invited_emails) {
        await db.execute(
          'INSERT INTO event_invitations (event_id, email, status) VALUES (?, ?, ?)',
          [eventId, email, 'pending']
        );
        
        // Envoyer l'email
        if (event) {
          await emailService.sendEventInvitation(email, event, company, publicUrl);
        }
      }
    }
    
    return c.json({
      success: true,
      message: 'Événement créé avec succès',
      data: {
        event: {
          ...event,
          public_url: publicUrl,
          invitations_sent: validatedData.invited_emails?.length || 0
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
    
    console.error('Create event error:', error);
    return c.json({
      success: false,
      error: 'Erreur lors de la création de l\'événement'
    }, 500);
  }
});

/**
 * GET /api/events/:id - Récupérer un événement spécifique
 */
events.get('/:id', async (c) => {
  try {
    const company = await requireAuth(c);
    
    if (!company) {
      return c.json({ success: false, error: 'Non autorisé' }, 401);
    }
    
    const eventId = c.req.param('id');
    const db = createDbService(c.env);
    
    const event = await db.queryOne<Event>(
      'SELECT * FROM events WHERE id = ? AND company_id = ?',
      [eventId, company.id]
    );
    
    if (!event) {
      return c.json({
        success: false,
        error: 'Événement non trouvé'
      }, 404);
    }
    
    // Récupérer les participants
    const participants = await db.query(
      `SELECT p.*, 
        CASE WHEN p.role = 'driver' THEN (
          SELECT COUNT(*) FROM rides WHERE participant_id = p.id
        ) ELSE 0 END as rides_count
       FROM participants p
       WHERE p.event_id = ? AND p.status = 'confirmed'`,
      [eventId]
    );
    
    return c.json({
      success: true,
      data: {
        event: {
          ...event,
          public_url: `${c.env.APP_URL}/join/${event.public_link}`,
          participants
        }
      }
    });
    
  } catch (error) {
    console.error('Get event error:', error);
    return c.json({
      success: false,
      error: 'Erreur lors de la récupération de l\'événement'
    }, 500);
  }
});

/**
 * PUT /api/events/:id - Mettre à jour un événement
 */
events.put('/:id', async (c) => {
  try {
    const company = await requireAuth(c);
    
    if (!company) {
      return c.json({ success: false, error: 'Non autorisé' }, 401);
    }
    
    const eventId = c.req.param('id');
    const body = await c.req.json();
    const validatedData = createEventSchema.partial().parse(body);
    
    const db = createDbService(c.env);
    
    // Vérifier que l'événement appartient à l'entreprise
    const event = await db.queryOne<Event>(
      'SELECT * FROM events WHERE id = ? AND company_id = ?',
      [eventId, company.id]
    );
    
    if (!event) {
      return c.json({
        success: false,
        error: 'Événement non trouvé'
      }, 404);
    }
    
    // Construire la requête UPDATE
    const updates: string[] = [];
    const params: any[] = [];
    
    if (validatedData.name !== undefined) {
      updates.push('name = ?');
      params.push(validatedData.name);
    }
    if (validatedData.type !== undefined) {
      updates.push('type = ?');
      params.push(validatedData.type);
    }
    if (validatedData.event_type_category !== undefined) {
      updates.push('event_type_category = ?');
      params.push(validatedData.event_type_category);
    }
    if (validatedData.date !== undefined) {
      updates.push('date = ?');
      params.push(validatedData.date);
    }
    if (validatedData.time !== undefined) {
      updates.push('time = ?');
      params.push(validatedData.time);
    }
    if (validatedData.duration !== undefined) {
      updates.push('duration = ?');
      params.push(validatedData.duration);
    }
    if (validatedData.location !== undefined) {
      updates.push('location = ?');
      params.push(validatedData.location);
    }
    
    updates.push('updated_at = datetime(\'now\')');
    params.push(eventId);
    
    await db.execute(
      `UPDATE events SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    const updatedEvent = await db.queryOne<Event>(
      'SELECT * FROM events WHERE id = ?',
      [eventId]
    );
    
    return c.json({
      success: true,
      message: 'Événement mis à jour avec succès',
      data: { event: updatedEvent }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      }, 400);
    }
    
    console.error('Update event error:', error);
    return c.json({
      success: false,
      error: 'Erreur lors de la mise à jour de l\'événement'
    }, 500);
  }
});

/**
 * DELETE /api/events/:id - Supprimer un événement
 */
events.delete('/:id', async (c) => {
  try {
    const company = await requireAuth(c);
    
    if (!company) {
      return c.json({ success: false, error: 'Non autorisé' }, 401);
    }
    
    const eventId = c.req.param('id');
    const db = createDbService(c.env);
    
    // Vérifier que l'événement appartient à l'entreprise
    const event = await db.queryOne<Event>(
      'SELECT * FROM events WHERE id = ? AND company_id = ?',
      [eventId, company.id]
    );
    
    if (!event) {
      return c.json({
        success: false,
        error: 'Événement non trouvé'
      }, 404);
    }
    
    // Supprimer l'événement (cascade supprime aussi participants, rides, etc.)
    await db.execute('DELETE FROM events WHERE id = ?', [eventId]);
    
    // Décrémenter le compteur
    await db.execute(
      'UPDATE companies SET events_created = events_created - 1 WHERE id = ?',
      [company.id]
    );
    
    return c.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
    
  } catch (error) {
    console.error('Delete event error:', error);
    return c.json({
      success: false,
      error: 'Erreur lors de la suppression de l\'événement'
    }, 500);
    }
});

/**
 * GET /api/events/:id/stats - Statistiques d'un événement
 */
events.get('/:id/stats', async (c) => {
  try {
    const company = await requireAuth(c);
    
    if (!company) {
      return c.json({ success: false, error: 'Non autorisé' }, 401);
    }
    
    const eventId = c.req.param('id');
    const db = createDbService(c.env);
    
    // Vérifier que l'événement appartient à l'entreprise
    const event = await db.queryOne<Event>(
      'SELECT * FROM events WHERE id = ? AND company_id = ?',
      [eventId, company.id]
    );
    
    if (!event) {
      return c.json({ success: false, error: 'Événement non trouvé' }, 404);
    }
    
    // Statistiques des participants
    const participantStats = await db.queryOne(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'driver' THEN 1 ELSE 0 END) as drivers,
        SUM(CASE WHEN role = 'passenger' THEN 1 ELSE 0 END) as passengers
       FROM participants 
       WHERE event_id = ? AND status = 'confirmed'`,
      [eventId]
    );
    
    // Statistiques des trajets
    const rideStats = await db.queryOne(
      `SELECT 
        COUNT(*) as total_rides,
        SUM(total_seats) as total_seats,
        SUM(available_seats) as available_seats
       FROM rides 
       WHERE event_id = ? AND status = 'active'`,
      [eventId]
    );
    
    // Statistiques des réservations
    const bookingStats = await db.queryOne(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       WHERE r.event_id = ?`,
      [eventId]
    );
    
    return c.json({
      success: true,
      data: {
        participants: participantStats || { total: 0, drivers: 0, passengers: 0 },
        rides: rideStats || { total_rides: 0, total_seats: 0, available_seats: 0 },
        bookings: bookingStats || { total: 0, confirmed: 0, pending: 0 }
      }
    });
    
  } catch (error) {
    console.error('Get event stats error:', error);
    return c.json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    }, 500);
  }
});

export default events;
