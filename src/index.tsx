import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/cloudflare-workers';
import type { Env } from './types';

// Import des routes API
import auth from './api/auth';
import events from './api/events';

const app = new Hono<{ Bindings: Env }>();

// Middleware global
app.use('*', logger());
app.use('/api/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Routes API
app.route('/api/auth', auth);
app.route('/api/events', events);

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'TEAMMOVE API'
  });
});

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

// Route pour rejoindre un événement (page publique)
app.get('/join/:link', (c) => {
  const link = c.req.param('link');
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rejoindre l'événement - TEAMMOVE</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
        <div id="root"></div>
        <script>
          window.EVENT_LINK = "${link}";
          window.API_URL = "${c.env.APP_URL || ''}/api";
        </script>
        <script type="module" src="/static/join-event.js"></script>
    </body>
    </html>
  `);
});

// Page principale (site vitrine + dashboards)
app.get('*', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TEAMMOVE - Gestion d'événements et covoiturage</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        </style>
    </head>
    <body class="bg-gray-50">
        <div id="root"></div>
        <script>
          window.API_URL = "${c.env.APP_URL || ''}/api";
        </script>
        <script type="module" src="/static/app.js"></script>
    </body>
    </html>
  `);
});

export default app;
