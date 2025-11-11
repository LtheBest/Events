-- Table des entreprises
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT,
  siren TEXT,
  address TEXT,
  company_type TEXT NOT NULL CHECK(company_type IN ('club', 'pme', 'grande_entreprise')),
  plan TEXT NOT NULL DEFAULT 'decouverte' CHECK(plan IN ('decouverte', 'essentiel', 'pro', 'premium')),
  subscription_status TEXT DEFAULT 'active' CHECK(subscription_status IN ('active', 'pending', 'cancelled', 'trial')),
  logo TEXT,
  theme TEXT DEFAULT 'light' CHECK(theme IN ('light', 'dark')),
  events_created INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Table des événements
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('ponctuel', 'recurrent')),
  event_type_category TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  duration INTEGER,
  location TEXT NOT NULL,
  public_link TEXT NOT NULL UNIQUE,
  qr_code TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'completed')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Table des invitations par email
CREATE TABLE IF NOT EXISTS event_invitations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_id TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined')),
  invited_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Table des participants
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('driver', 'passenger')),
  departure_address TEXT,
  city TEXT,
  zone TEXT,
  status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'cancelled')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Table des trajets (conducteurs)
CREATE TABLE IF NOT EXISTS rides (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  participant_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  departure_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  departure_date TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  available_seats INTEGER NOT NULL,
  total_seats INTEGER NOT NULL,
  wants_compensation BOOLEAN DEFAULT 0,
  price_per_km REAL DEFAULT 0.10,
  city TEXT,
  zone TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  ride_id TEXT NOT NULL,
  passenger_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
  FOREIGN KEY (passenger_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- Table des demandes de passagers sans conducteur
CREATE TABLE IF NOT EXISTS passenger_requests (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  departure_address TEXT NOT NULL,
  city TEXT,
  zone TEXT,
  notified BOOLEAN DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'matched', 'cancelled')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  event_id TEXT,
  booking_id TEXT,
  sender_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK(sender_type IN ('company', 'participant', 'driver', 'passenger')),
  receiver_id TEXT NOT NULL,
  receiver_type TEXT NOT NULL CHECK(receiver_type IN ('company', 'participant', 'driver', 'passenger')),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Table des véhicules d'entreprise (plans Pro et Premium)
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_id TEXT NOT NULL,
  event_id TEXT,
  type TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  assigned_driver TEXT,
  status TEXT DEFAULT 'available' CHECK(status IN ('available', 'in_use', 'maintenance')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  recipient_id TEXT NOT NULL,
  recipient_type TEXT NOT NULL CHECK(recipient_type IN ('company', 'participant', 'admin')),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT 0,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_events_company_id ON events(company_id);
CREATE INDEX IF NOT EXISTS idx_events_public_link ON events(public_link);
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_rides_event_id ON rides(event_id);
CREATE INDEX IF NOT EXISTS idx_rides_city ON rides(city);
CREATE INDEX IF NOT EXISTS idx_rides_zone ON rides(zone);
CREATE INDEX IF NOT EXISTS idx_bookings_ride_id ON bookings(ride_id);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger_id ON bookings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_passenger_requests_city ON passenger_requests(city);
CREATE INDEX IF NOT EXISTS idx_messages_event_id ON messages(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
