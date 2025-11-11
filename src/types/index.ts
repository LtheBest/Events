// Types pour l'application TEAMMOVE

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  siren?: string;
  address?: string;
  company_type: 'club' | 'pme' | 'grande_entreprise';
  plan: 'decouverte' | 'essentiel' | 'pro' | 'premium';
  subscription_status: 'active' | 'pending' | 'cancelled' | 'trial';
  logo?: string;
  theme: 'light' | 'dark';
  events_created: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  company_id: string;
  name: string;
  type: 'ponctuel' | 'recurrent';
  event_type_category?: string;
  date: string;
  time: string;
  duration?: number;
  location: string;
  public_link: string;
  qr_code?: string;
  status: 'active' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'driver' | 'passenger';
  departure_address?: string;
  city?: string;
  zone?: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;
}

export interface Ride {
  id: string;
  participant_id: string;
  event_id: string;
  departure_address: string;
  destination_address: string;
  departure_date: string;
  departure_time: string;
  available_seats: number;
  total_seats: number;
  wants_compensation: boolean;
  price_per_km: number;
  city?: string;
  zone?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  ride_id: string;
  passenger_id: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface PassengerRequest {
  id: string;
  event_id: string;
  participant_id: string;
  departure_address: string;
  city?: string;
  zone?: string;
  notified: boolean;
  status: 'pending' | 'matched' | 'cancelled';
  created_at: string;
}

export interface Message {
  id: string;
  event_id?: string;
  booking_id?: string;
  sender_id: string;
  sender_type: 'company' | 'participant' | 'driver' | 'passenger';
  receiver_id: string;
  receiver_type: 'company' | 'participant' | 'driver' | 'passenger';
  content: string;
  read: boolean;
  created_at: string;
}

export interface Vehicle {
  id: string;
  company_id: string;
  event_id?: string;
  type: string;
  capacity: number;
  assigned_driver?: string;
  status: 'available' | 'in_use' | 'maintenance';
  created_at: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  recipient_type: 'company' | 'participant' | 'admin';
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  created_at: string;
}

export interface EventInvitation {
  id: string;
  event_id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  invited_at: string;
}

// Types pour les limites de plan
export const PLAN_LIMITS = {
  decouverte: {
    eventsPerYear: 2,
    maxParticipants: 20,
    hasVehicles: false,
    hasLogo: false,
    hasBroadcast: false,
    hasCRM: false,
    hasAdvancedStats: false
  },
  essentiel: {
    eventsPerYear: 10,
    maxParticipants: 500,
    hasVehicles: false,
    hasLogo: false,
    hasBroadcast: true,
    hasCRM: false,
    hasAdvancedStats: false
  },
  pro: {
    eventsPerYear: Infinity,
    maxParticipants: 5000,
    hasVehicles: true,
    hasLogo: true,
    hasBroadcast: true,
    hasCRM: true,
    hasAdvancedStats: true
  },
  premium: {
    eventsPerYear: Infinity,
    maxParticipants: 10000,
    hasVehicles: true,
    hasLogo: true,
    hasBroadcast: true,
    hasCRM: true,
    hasAdvancedStats: true
  }
} as const;

// Types pour les plans d'abonnement
export const PLAN_PRICING = {
  decouverte: {
    name: 'Découverte',
    price: 0,
    billing: 'gratuit'
  },
  essentiel: {
    name: 'Essentiel',
    price: 25.99,
    billing: 'mensuel',
    yearlyPrice: 300
  },
  pro: {
    name: 'Pro',
    price: null,
    billing: 'sur devis'
  },
  premium: {
    name: 'Premium',
    price: null,
    billing: 'sur devis'
  }
} as const;

// Type pour les bindings Cloudflare
export interface Env {
  DB: D1Database;
  SENDGRID_API_KEY: string;
  JWT_SECRET: string;
  APP_URL: string;
  SENDER_EMAIL: string;
}
