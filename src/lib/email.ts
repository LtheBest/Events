import sgMail from '@sendgrid/mail';
import type { Env, Event, Company, Participant } from '../types';

/**
 * Service d'envoi d'emails via SendGrid
 */
export class EmailService {
  private senderEmail: string;
  
  constructor(private apiKey: string, senderEmail: string) {
    sgMail.setApiKey(apiKey);
    this.senderEmail = senderEmail;
  }

  /**
   * Envoie un email de bienvenue à une nouvelle entreprise
   */
  async sendWelcomeEmail(company: Company, temporaryPassword?: string): Promise<boolean> {
    try {
      const msg = {
        to: company.email,
        from: this.senderEmail,
        subject: '🎉 Bienvenue sur TEAMMOVE !',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🚀 Bienvenue sur TEAMMOVE</h1>
                </div>
                <div class="content">
                  <p>Bonjour <strong>${company.name}</strong>,</p>
                  
                  <p>Félicitations ! Votre compte TEAMMOVE a été créé avec succès.</p>
                  
                  <p><strong>Informations de votre compte :</strong></p>
                  <ul>
                    <li>Email : ${company.email}</li>
                    <li>Type d'organisme : ${this.formatCompanyType(company.company_type)}</li>
                    <li>Plan : ${this.formatPlan(company.plan)}</li>
                  </ul>
                  
                  ${temporaryPassword ? `
                    <p style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 5px;">
                      <strong>⚠️ Mot de passe temporaire :</strong> ${temporaryPassword}<br>
                      <em>Pensez à le changer lors de votre première connexion.</em>
                    </p>
                  ` : ''}
                  
                  <p>Vous pouvez maintenant :</p>
                  <ul>
                    <li>✅ Créer vos événements</li>
                    <li>✅ Inviter des participants</li>
                    <li>✅ Gérer le covoiturage</li>
                    <li>✅ Suivre vos statistiques</li>
                  </ul>
                  
                  <center>
                    <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" class="button">
                      Se connecter maintenant
                    </a>
                  </center>
                  
                  <p>Besoin d'aide ? Notre équipe est là pour vous accompagner.</p>
                  
                  <p>À très bientôt,<br><strong>L'équipe TEAMMOVE</strong></p>
                </div>
                <div class="footer">
                  <p>© 2025 TEAMMOVE - Plateforme de gestion d'événements et covoiturage</p>
                </div>
              </div>
            </body>
          </html>
        `
      };
      
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Envoie un email d'invitation à un événement
   */
  async sendEventInvitation(
    recipientEmail: string,
    event: Event,
    company: Company,
    publicUrl: string
  ): Promise<boolean> {
    try {
      const msg = {
        to: recipientEmail,
        from: this.senderEmail,
        subject: `🎉 Invitation : ${event.name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .event-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .event-info { margin: 10px 0; }
                .event-info strong { color: #667eea; }
                .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📅 Vous êtes invité(e) !</h1>
                </div>
                <div class="content">
                  <p><strong>${company.name}</strong> vous invite à participer à un événement :</p>
                  
                  <div class="event-card">
                    <h2 style="color: #667eea; margin-top: 0;">${event.name}</h2>
                    
                    <div class="event-info">
                      <strong>📍 Lieu :</strong> ${event.location}
                    </div>
                    
                    <div class="event-info">
                      <strong>📅 Date :</strong> ${this.formatDate(event.date)}
                    </div>
                    
                    <div class="event-info">
                      <strong>🕐 Heure :</strong> ${event.time}
                    </div>
                    
                    ${event.event_type_category ? `
                      <div class="event-info">
                        <strong>🎯 Type :</strong> ${event.event_type_category}
                      </div>
                    ` : ''}
                  </div>
                  
                  <p>Rejoignez l'événement et organisez votre covoiturage :</p>
                  
                  <center>
                    <a href="${publicUrl}" class="button">
                      Rejoindre l'événement
                    </a>
                  </center>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    En rejoignant cet événement, vous pourrez :<br>
                    • Proposer un trajet en tant que conducteur<br>
                    • Réserver une place en tant que passager<br>
                    • Communiquer avec les autres participants
                  </p>
                </div>
                <div class="footer">
                  <p>© 2025 TEAMMOVE - Plateforme de gestion d'événements et covoiturage</p>
                </div>
              </div>
            </body>
          </html>
        `
      };
      
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending event invitation:', error);
      return false;
    }
  }

  /**
   * Envoie une notification de nouvelle réservation au conducteur
   */
  async sendBookingNotificationToDriver(
    driver: Participant,
    passenger: Participant,
    ride: any,
    bookingId: string,
    acceptUrl: string,
    rejectUrl: string,
    replyUrl: string
  ): Promise<boolean> {
    try {
      const msg = {
        to: driver.email,
        from: this.senderEmail,
        subject: '🚗 Nouvelle demande de réservation',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .booking-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .buttons { display: flex; gap: 10px; justify-content: center; margin: 20px 0; }
                .button { display: inline-block; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
                .accept { background: #28a745; color: white; }
                .reject { background: #dc3545; color: white; }
                .reply { background: #007bff; color: white; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🚗 Nouvelle demande de réservation</h1>
                </div>
                <div class="content">
                  <p>Bonjour <strong>${driver.first_name}</strong>,</p>
                  
                  <p>Vous avez reçu une nouvelle demande de réservation pour votre trajet :</p>
                  
                  <div class="booking-card">
                    <h3>👤 Passager : ${passenger.first_name} ${passenger.last_name}</h3>
                    <p><strong>📍 Adresse de départ :</strong> ${passenger.departure_address}</p>
                    <p><strong>📧 Email :</strong> ${passenger.email}</p>
                    
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                    
                    <h3>🚗 Votre trajet</h3>
                    <p><strong>Départ :</strong> ${ride.departure_address}</p>
                    <p><strong>Destination :</strong> ${ride.destination_address}</p>
                    <p><strong>Date :</strong> ${this.formatDate(ride.departure_date)} à ${ride.departure_time}</p>
                    <p><strong>Places disponibles :</strong> ${ride.available_seats}/${ride.total_seats}</p>
                  </div>
                  
                  <p>Que souhaitez-vous faire ?</p>
                  
                  <div class="buttons">
                    <a href="${acceptUrl}" class="button accept">✅ Accepter</a>
                    <a href="${rejectUrl}" class="button reject">❌ Refuser</a>
                  </div>
                  
                  <center style="margin-top: 10px;">
                    <a href="${replyUrl}" class="button reply">💬 Envoyer un message</a>
                  </center>
                </div>
              </div>
            </body>
          </html>
        `
      };
      
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending booking notification:', error);
      return false;
    }
  }

  /**
   * Envoie une confirmation de réservation au passager
   */
  async sendBookingConfirmationToPassenger(
    passenger: Participant,
    driver: Participant,
    ride: any,
    status: 'confirmed' | 'rejected'
  ): Promise<boolean> {
    try {
      const msg = {
        to: passenger.email,
        from: this.senderEmail,
        subject: status === 'confirmed' 
          ? '✅ Réservation confirmée' 
          : '❌ Réservation refusée',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: ${status === 'confirmed' ? '#28a745' : '#dc3545'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .ride-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${status === 'confirmed' ? '✅ Réservation confirmée' : '❌ Réservation refusée'}</h1>
                </div>
                <div class="content">
                  <p>Bonjour <strong>${passenger.first_name}</strong>,</p>
                  
                  ${status === 'confirmed' ? `
                    <p>Bonne nouvelle ! Votre réservation a été acceptée par le conducteur.</p>
                    
                    <div class="ride-card">
                      <h3>🚗 Détails du trajet</h3>
                      <p><strong>Conducteur :</strong> ${driver.first_name} ${driver.last_name}</p>
                      <p><strong>Email :</strong> ${driver.email}</p>
                      <p><strong>Départ :</strong> ${ride.departure_address}</p>
                      <p><strong>Destination :</strong> ${ride.destination_address}</p>
                      <p><strong>Date :</strong> ${this.formatDate(ride.departure_date)} à ${ride.departure_time}</p>
                    </div>
                    
                    <p>Pensez à contacter votre conducteur pour convenir des derniers détails.</p>
                  ` : `
                    <p>Malheureusement, votre demande de réservation n'a pas été acceptée.</p>
                    <p>Nous vous invitons à rechercher un autre trajet disponible.</p>
                  `}
                </div>
              </div>
            </body>
          </html>
        `
      };
      
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      return false;
    }
  }

  /**
   * Envoie un rappel d'événement 24h avant
   */
  async sendEventReminder(
    participants: Participant[],
    event: Event,
    company: Company
  ): Promise<boolean> {
    try {
      const emails = participants.map(p => ({
        to: p.email,
        from: this.senderEmail,
        subject: `📅 Rappel : ${event.name} demain !`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>⏰ Rappel d'événement</h1>
                </div>
                <div class="content">
                  <p>Bonjour <strong>${p.first_name}</strong>,</p>
                  
                  <p>Rappel : l'événement <strong>${event.name}</strong> organisé par ${company.name} a lieu demain !</p>
                  
                  <p><strong>📍 Lieu :</strong> ${event.location}</p>
                  <p><strong>📅 Date :</strong> ${this.formatDate(event.date)}</p>
                  <p><strong>🕐 Heure :</strong> ${event.time}</p>
                  
                  <p>N'oubliez pas de vérifier votre trajet de covoiturage !</p>
                  
                  <p>À demain,<br><strong>L'équipe TEAMMOVE</strong></p>
                </div>
              </div>
            </body>
          </html>
        `
      }));
      
      await sgMail.send(emails);
      return true;
    } catch (error) {
      console.error('Error sending event reminders:', error);
      return false;
    }
  }

  /**
   * Envoie un message entre participants
   */
  async sendMessageNotification(
    recipientEmail: string,
    senderName: string,
    message: string,
    replyUrl: string
  ): Promise<boolean> {
    try {
      const msg = {
        to: recipientEmail,
        from: this.senderEmail,
        subject: `💬 Nouveau message de ${senderName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>💬 Nouveau message</h1>
                </div>
                <div class="content">
                  <p>Vous avez reçu un nouveau message de <strong>${senderName}</strong> :</p>
                  
                  <div class="message-box">
                    <p>${message}</p>
                  </div>
                  
                  <center>
                    <a href="${replyUrl}" class="button">Répondre</a>
                  </center>
                </div>
              </div>
            </body>
          </html>
        `
      };
      
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending message notification:', error);
      return false;
    }
  }

  // Helpers de formatage
  private formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  private formatCompanyType(type: string): string {
    const types: Record<string, string> = {
      'club': 'Clubs & Associations',
      'pme': 'PME',
      'grande_entreprise': 'Grande Entreprise'
    };
    return types[type] || type;
  }

  private formatPlan(plan: string): string {
    const plans: Record<string, string> = {
      'decouverte': 'Découverte (Gratuit)',
      'essentiel': 'Essentiel',
      'pro': 'Pro',
      'premium': 'Premium'
    };
    return plans[plan] || plan;
  }
}

export function createEmailService(env: Env): EmailService {
  return new EmailService(env.SENDGRID_API_KEY, env.SENDER_EMAIL);
}
