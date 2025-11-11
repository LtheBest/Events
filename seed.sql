-- Données de test pour TEAMMOVE

-- Compte admin par défaut
INSERT OR IGNORE INTO companies (id, name, email, password, company_type, plan, subscription_status, is_active) 
VALUES 
  ('admin001', 'TEAMMOVE Admin', 'admin@teammove.com', '$2a$10$rO8LKqDvGZJ3n3vZ3YJ3Z.Zt8zN4wHvD0Qj4X5Y6Z7A8B9C0D1E2F3', 'grande_entreprise', 'premium', 'active', 1);

-- Entreprises de test
INSERT OR IGNORE INTO companies (id, name, email, password, company_type, plan, subscription_status, is_active) 
VALUES 
  ('comp001', 'Club de Sport Paris', 'contact@clubsportparis.fr', '$2a$10$rO8LKqDvGZJ3n3vZ3YJ3Z.Zt8zN4wHvD0Qj4X5Y6Z7A8B9C0D1E2F3', 'club', 'decouverte', 'active', 1),
  ('comp002', 'Tech Startup Lyon', 'hello@techstartup.fr', '$2a$10$rO8LKqDvGZJ3n3vZ3YJ3Z.Zt8zN4wHvD0Qj4X5Y6Z7A8B9C0D1E2F3', 'pme', 'essentiel', 'active', 1),
  ('comp003', 'Grande Entreprise Toulouse', 'contact@grandeentreprise.fr', '$2a$10$rO8LKqDvGZJ3n3vZ3YJ3Z.Zt8zN4wHvD0Qj4X5Y6Z7A8B9C0D1E2F3', 'grande_entreprise', 'pro', 'active', 1);

-- Événements de test
INSERT OR IGNORE INTO events (id, company_id, name, type, event_type_category, date, time, duration, location, public_link, status)
VALUES 
  ('event001', 'comp001', 'Tournoi de Football', 'ponctuel', 'Sport', '2025-12-15', '14:00', 180, 'Stade de France, 93200 Saint-Denis', 'evt-tournoi-football-2025', 'active'),
  ('event002', 'comp002', 'Séminaire Tech Annuel', 'ponctuel', 'Professionnel', '2025-12-20', '09:00', 480, 'Centre de Congrès, Lyon 69003', 'evt-seminaire-tech-lyon', 'active'),
  ('event003', 'comp003', 'Formation Mensuelle', 'recurrent', 'Formation', '2025-12-01', '10:00', 240, 'Campus Entreprise, Toulouse 31000', 'evt-formation-mensuelle', 'active');

-- Invitations par email
INSERT OR IGNORE INTO event_invitations (event_id, email, status)
VALUES 
  ('event001', 'jean.dupont@example.fr', 'pending'),
  ('event001', 'marie.martin@example.fr', 'accepted'),
  ('event002', 'paul.bernard@example.fr', 'pending');
