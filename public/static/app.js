// TEAMMOVE - Application Frontend
// Version simplifiée avec Vanilla JS + React-like patterns

const API_URL = window.API_URL || '/api';

// === ROUTER SIMPLE ===
class Router {
  constructor() {
    this.routes = {};
    this.currentPath = window.location.pathname;
    
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname);
    });
  }
  
  register(path, component) {
    this.routes[path] = component;
  }
  
  navigate(path) {
    this.currentPath = path;
    window.history.pushState({}, '', path);
    this.render();
  }
  
  render() {
    const root = document.getElementById('root');
    const component = this.routes[this.currentPath] || this.routes['/404'] || this.routes['/'];
    
    if (component) {
      root.innerHTML = component();
    }
  }
}

const router = new Router();

// === ÉTAT GLOBAL ===
const state = {
  user: null,
  token: localStorage.getItem('teammove_token'),
  events: [],
  loading: false
};

// === HELPERS ===
async function apiCall(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Une erreur est survenue');
  }
  
  return data;
}

function setAuth(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('teammove_token', token);
  localStorage.setItem('teammove_user', JSON.stringify(user));
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('teammove_token');
  localStorage.removeItem('teammove_user');
  router.navigate('/');
}

async function checkAuth() {
  if (!state.token) return false;
  
  try {
    const response = await apiCall('/auth/me');
    if (response.success) {
      state.user = response.data.company;
      return true;
    }
  } catch (error) {
    logout();
  }
  return false;
}

// === COMPOSANTS ===

// Page d'accueil (vitrine)
function HomePage() {
  return `
    <div class="min-h-screen">
      <!-- Header -->
      <header class="gradient-bg text-white py-6 px-4 shadow-lg">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <div class="flex items-center gap-3">
            <i class="fas fa-calendar-check text-3xl"></i>
            <h1 class="text-3xl font-bold">TEAMMOVE</h1>
          </div>
          <div class="flex gap-4">
            <button onclick="router.navigate('/login')" class="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              Se connecter
            </button>
            <button onclick="router.navigate('/register')" class="bg-purple-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-900 transition">
              S'inscrire
            </button>
          </div>
        </div>
      </header>
      
      <!-- Hero Section -->
      <section class="gradient-bg text-white py-20 px-4">
        <div class="max-w-7xl mx-auto text-center">
          <h2 class="text-5xl font-bold mb-6">
            Organisez vos événements<br>et gérez le covoiturage facilement
          </h2>
          <p class="text-xl mb-8 opacity-90">
            La plateforme tout-en-un pour les entreprises, clubs et associations
          </p>
          <button onclick="router.navigate('/register')" class="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition shadow-lg">
            Commencer gratuitement <i class="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </section>
      
      <!-- Fonctionnalités -->
      <section class="py-20 px-4 bg-white">
        <div class="max-w-7xl mx-auto">
          <h3 class="text-4xl font-bold text-center mb-16 text-gray-800">
            Tout ce dont vous avez besoin
          </h3>
          
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-xl shadow-lg">
              <div class="text-purple-600 text-4xl mb-4">
                <i class="fas fa-calendar-alt"></i>
              </div>
              <h4 class="text-2xl font-bold mb-3 text-gray-800">Gestion d'événements</h4>
              <p class="text-gray-600">
                Créez et gérez vos événements ponctuels ou récurrents en quelques clics.
                Invitez des participants par email.
              </p>
            </div>
            
            <div class="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-xl shadow-lg">
              <div class="text-blue-600 text-4xl mb-4">
                <i class="fas fa-car"></i>
              </div>
              <h4 class="text-2xl font-bold mb-3 text-gray-800">Covoiturage intelligent</h4>
              <p class="text-gray-600">
                Matching automatique conducteurs/passagers par zone géographique.
                Gestion des réservations simplifiée.
              </p>
            </div>
            
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl shadow-lg">
              <div class="text-green-600 text-4xl mb-4">
                <i class="fas fa-chart-line"></i>
              </div>
              <h4 class="text-2xl font-bold mb-3 text-gray-800">Statistiques avancées</h4>
              <p class="text-gray-600">
                Suivez vos KPIs en temps réel : participants, trajets, places disponibles.
                Exportez vos rapports.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Plans tarifaires -->
      <section class="py-20 px-4 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <h3 class="text-4xl font-bold text-center mb-16 text-gray-800">
            Choisissez votre plan
          </h3>
          
          <div class="grid md:grid-cols-4 gap-6">
            <!-- Plan Découverte -->
            <div class="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
              <h4 class="text-2xl font-bold mb-3 text-gray-800">Découverte</h4>
              <div class="text-4xl font-bold mb-6 text-purple-600">
                Gratuit
              </div>
              <ul class="space-y-3 mb-8 text-gray-600">
                <li><i class="fas fa-check text-green-500 mr-2"></i> 2 événements/an</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> 20 participants max</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> Gestion simple</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> Reporting basique</li>
              </ul>
              <button onclick="router.navigate('/register')" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                Commencer
              </button>
            </div>
            
            <!-- Plan Essentiel -->
            <div class="bg-white p-8 rounded-xl shadow-lg border-2 border-purple-500 relative">
              <div class="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                Populaire
              </div>
              <h4 class="text-2xl font-bold mb-3 text-gray-800">Essentiel</h4>
              <div class="text-4xl font-bold mb-2 text-purple-600">
                25,99€
              </div>
              <p class="text-gray-500 mb-6">/mois ou 300€/an</p>
              <ul class="space-y-3 mb-8 text-gray-600">
                <li><i class="fas fa-check text-green-500 mr-2"></i> 10 événements/an</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> 500 participants max</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> Reporting avancé</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> Notifications auto</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> Messagerie diffusion</li>
              </ul>
              <button onclick="router.navigate('/register')" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                Choisir
              </button>
            </div>
            
            <!-- Plan Pro -->
            <div class="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
              <h4 class="text-2xl font-bold mb-3 text-gray-800">Pro</h4>
              <div class="text-4xl font-bold mb-6 text-purple-600">
                Sur devis
              </div>
              <ul class="space-y-3 mb-8 text-gray-600">
                <li><i class="fas fa-check text-green-500 mr-2"></i> Événements illimités</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> 5000 participants</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> CRM intégré</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> Stats avancées</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> Logo personnalisé</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> Véhicules entreprise</li>
              </ul>
              <button onclick="router.navigate('/register')" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                Demander un devis
              </button>
            </div>
            
            <!-- Plan Premium -->
            <div class="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
              <h4 class="text-2xl font-bold mb-3 text-gray-800">Premium</h4>
              <div class="text-4xl font-bold mb-6 text-purple-600">
                Sur devis
              </div>
              <ul class="space-y-3 mb-8 text-gray-600">
                <li><i class="fas fa-check text-green-500 mr-2"></i> Événements illimités</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> 10000+ participants</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> Tout du plan Pro</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> Marque blanche</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> Support dédié 24/7</li>
                <li><i class="fas fa-check text-green-500 mr-2"></i> Intégrations custom</li>
              </ul>
              <button onclick="router.navigate('/register')" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                Demander un devis
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Footer -->
      <footer class="bg-gray-800 text-white py-12 px-4">
        <div class="max-w-7xl mx-auto text-center">
          <div class="flex items-center justify-center gap-3 mb-4">
            <i class="fas fa-calendar-check text-2xl"></i>
            <h3 class="text-2xl font-bold">TEAMMOVE</h3>
          </div>
          <p class="text-gray-400 mb-6">
            Plateforme de gestion d'événements et covoiturage pour les entreprises
          </p>
          <p class="text-gray-500 text-sm">
            © 2025 TEAMMOVE. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  `;
}

// Page de connexion
function LoginPage() {
  setTimeout(() => {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember').checked;
        
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Connexion...';
        
        try {
          const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, rememberMe })
          });
          
          if (response.success) {
            setAuth(response.data.token, response.data.company);
            router.navigate('/dashboard');
          }
        } catch (error) {
          alert(error.message);
          btn.disabled = false;
          btn.innerHTML = 'Se connecter';
        }
      });
    }
  }, 0);
  
  return `
    <div class="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <i class="fas fa-sign-in-alt text-2xl text-purple-600"></i>
          </div>
          <h2 class="text-3xl font-bold text-gray-800">Connexion</h2>
          <p class="text-gray-600 mt-2">Accédez à votre dashboard TEAMMOVE</p>
        </div>
        
        <form id="login-form" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-envelope mr-2 text-purple-600"></i> Email
            </label>
            <input 
              type="email" 
              id="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="votre@email.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-lock mr-2 text-purple-600"></i> Mot de passe
            </label>
            <input 
              type="password" 
              id="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="remember"
              class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label for="remember" class="ml-2 text-sm text-gray-700">
              Se souvenir de moi
            </label>
          </div>
          
          <button 
            type="submit"
            class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
          >
            Se connecter
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Pas encore de compte ?
            <button onclick="router.navigate('/register')" class="text-purple-600 font-semibold hover:underline ml-1">
              S'inscrire
            </button>
          </p>
          <button onclick="router.navigate('/')" class="text-gray-500 hover:text-gray-700 mt-4 text-sm">
            <i class="fas fa-arrow-left mr-1"></i> Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  `;
}

// Page d'inscription
function RegisterPage() {
  setTimeout(() => {
    const form = document.getElementById('register-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
          confirmPassword: document.getElementById('confirm-password').value,
          company_type: document.getElementById('company-type').value,
          plan: document.getElementById('plan').value,
          phone: document.getElementById('phone').value || undefined,
          siren: document.getElementById('siren').value || undefined,
          address: document.getElementById('address').value || undefined,
          acceptTerms: document.getElementById('terms').checked
        };
        
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Inscription...';
        
        try {
          const response = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(formData)
          });
          
          if (response.success) {
            alert(response.message);
            
            if (response.data.token) {
              setAuth(response.data.token, response.data.company);
              router.navigate('/dashboard');
            } else if (response.data.requiresPayment) {
              router.navigate('/payment');
            } else if (response.data.requiresApproval) {
              router.navigate('/');
            }
          }
        } catch (error) {
          alert(error.message);
          btn.disabled = false;
          btn.innerHTML = 'Créer un compte';
        }
      });
    }
  }, 0);
  
  return `
    <div class="min-h-screen gradient-bg py-12 px-4">
      <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <i class="fas fa-user-plus text-2xl text-purple-600"></i>
          </div>
          <h2 class="text-3xl font-bold text-gray-800">Créer un compte</h2>
          <p class="text-gray-600 mt-2">Rejoignez TEAMMOVE dès aujourd'hui</p>
        </div>
        
        <form id="register-form" class="space-y-6">
          <!-- Type d'organisme -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-building mr-2 text-purple-600"></i> Type d'organisme *
            </label>
            <select 
              id="company-type"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Sélectionnez...</option>
              <option value="club">Clubs & Associations</option>
              <option value="pme">PME</option>
              <option value="grande_entreprise">Grande Entreprise</option>
            </select>
          </div>
          
          <!-- Plan -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-crown mr-2 text-purple-600"></i> Plan d'abonnement *
            </label>
            <select 
              id="plan"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Sélectionnez...</option>
              <option value="decouverte">Découverte (Gratuit)</option>
              <option value="essentiel">Essentiel (25,99€/mois)</option>
              <option value="pro">Pro (Sur devis)</option>
              <option value="premium">Premium (Sur devis)</option>
            </select>
          </div>
          
          <!-- Nom -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-briefcase mr-2 text-purple-600"></i> Nom de l'organisme *
            </label>
            <input 
              type="text" 
              id="name"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Mon Entreprise"
            />
          </div>
          
          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-envelope mr-2 text-purple-600"></i> Email professionnel *
            </label>
            <input 
              type="email" 
              id="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="contact@monentreprise.fr"
            />
          </div>
          
          <!-- Téléphone (optionnel) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-phone mr-2 text-purple-600"></i> Téléphone (optionnel)
            </label>
            <input 
              type="tel" 
              id="phone"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="+33 1 23 45 67 89"
            />
          </div>
          
          <!-- SIREN (optionnel) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-id-card mr-2 text-purple-600"></i> Numéro SIREN (optionnel)
            </label>
            <input 
              type="text" 
              id="siren"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="123 456 789"
            />
          </div>
          
          <!-- Adresse (optionnel) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-map-marker-alt mr-2 text-purple-600"></i> Adresse (optionnel)
            </label>
            <input 
              type="text" 
              id="address"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="123 Rue de la République, 75001 Paris"
            />
          </div>
          
          <!-- Mot de passe -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-lock mr-2 text-purple-600"></i> Mot de passe *
            </label>
            <input 
              type="password" 
              id="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <p class="text-xs text-gray-500 mt-1">
              8 caractères min., 1 majuscule, 1 minuscule, 1 chiffre
            </p>
          </div>
          
          <!-- Confirmer mot de passe -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-lock mr-2 text-purple-600"></i> Confirmer le mot de passe *
            </label>
            <input 
              type="password" 
              id="confirm-password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          
          <!-- Conditions -->
          <div class="flex items-start">
            <input 
              type="checkbox" 
              id="terms"
              required
              class="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label for="terms" class="ml-2 text-sm text-gray-700">
              J'accepte les <a href="#" class="text-purple-600 hover:underline">conditions d'utilisation</a> 
              et la <a href="#" class="text-purple-600 hover:underline">politique de confidentialité</a> *
            </label>
          </div>
          
          <button 
            type="submit"
            class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
          >
            Créer un compte
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Déjà un compte ?
            <button onclick="router.navigate('/login')" class="text-purple-600 font-semibold hover:underline ml-1">
              Se connecter
            </button>
          </p>
          <button onclick="router.navigate('/')" class="text-gray-500 hover:text-gray-700 mt-4 text-sm">
            <i class="fas fa-arrow-left mr-1"></i> Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  `;
}

// Dashboard (version simplifiée)
function DashboardPage() {
  if (!state.token) {
    router.navigate('/login');
    return '';
  }
  
  // Charger les données
  if (!state.user) {
    checkAuth().then(isAuth => {
      if (isAuth) {
        router.render();
      } else {
        router.navigate('/login');
      }
    });
    
    return `
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
          <p class="text-gray-600">Chargement...</p>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div class="flex items-center gap-4">
            <i class="fas fa-calendar-check text-2xl text-purple-600"></i>
            <div>
              <h1 class="text-xl font-bold text-gray-800">${state.user.name}</h1>
              <p class="text-sm text-gray-500">Plan ${state.user.plan}</p>
            </div>
          </div>
          <button 
            onclick="logout(); router.navigate('/')"
            class="text-gray-600 hover:text-red-600 transition"
          >
            <i class="fas fa-sign-out-alt mr-2"></i> Déconnexion
          </button>
        </div>
      </header>
      
      <!-- Content -->
      <main class="max-w-7xl mx-auto px-4 py-8">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">
            Bienvenue sur votre Dashboard !
          </h2>
          <p class="text-gray-600">
            Gérez vos événements et le covoiturage en toute simplicité.
          </p>
        </div>
        
        <!-- Stats -->
        <div class="grid md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white p-6 rounded-xl shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <i class="fas fa-calendar-alt text-xl text-purple-600"></i>
              </div>
              <span class="text-3xl font-bold text-purple-600">${state.user.events_created || 0}</span>
            </div>
            <h3 class="text-gray-700 font-semibold">Événements créés</h3>
          </div>
          
          <div class="bg-white p-6 rounded-xl shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="fas fa-users text-xl text-blue-600"></i>
              </div>
              <span class="text-3xl font-bold text-blue-600">0</span>
            </div>
            <h3 class="text-gray-700 font-semibold">Participants</h3>
          </div>
          
          <div class="bg-white p-6 rounded-xl shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i class="fas fa-car text-xl text-green-600"></i>
              </div>
              <span class="text-3xl font-bold text-green-600">0</span>
            </div>
            <h3 class="text-gray-700 font-semibold">Trajets actifs</h3>
          </div>
        </div>
        
        <!-- Actions rapides -->
        <div class="bg-white rounded-xl shadow p-8">
          <h3 class="text-2xl font-bold text-gray-800 mb-6">Actions rapides</h3>
          
          <div class="grid md:grid-cols-2 gap-4">
            <button class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-xl hover:shadow-lg transition text-left">
              <i class="fas fa-plus-circle text-3xl mb-3"></i>
              <h4 class="text-xl font-semibold mb-2">Créer un événement</h4>
              <p class="text-purple-100 text-sm">
                Organisez un nouvel événement et invitez vos participants
              </p>
            </button>
            
            <button class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-xl hover:shadow-lg transition text-left">
              <i class="fas fa-list text-3xl mb-3"></i>
              <h4 class="text-xl font-semibold mb-2">Mes événements</h4>
              <p class="text-blue-100 text-sm">
                Consultez et gérez tous vos événements
              </p>
            </button>
          </div>
        </div>
        
        <!-- Guide de démarrage -->
        <div class="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200">
          <h3 class="text-2xl font-bold text-gray-800 mb-4">
            <i class="fas fa-rocket text-purple-600 mr-2"></i>
            Guide de démarrage
          </h3>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 class="font-semibold text-gray-800">Créez votre premier événement</h4>
                <p class="text-gray-600 text-sm">Définissez le nom, la date, l'heure et le lieu</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 class="font-semibold text-gray-800">Invitez des participants</h4>
                <p class="text-gray-600 text-sm">Envoyez des invitations par email ou partagez le lien</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 class="font-semibold text-gray-800">Gérez le covoiturage</h4>
                <p class="text-gray-600 text-sm">Les conducteurs créent des trajets, les passagers réservent</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

// === INITIALISATION ===
router.register('/', HomePage);
router.register('/login', LoginPage);
router.register('/register', RegisterPage);
router.register('/dashboard', DashboardPage);
router.register('/404', () => `
  <div class="min-h-screen flex items-center justify-center gradient-bg">
    <div class="text-center text-white">
      <h1 class="text-9xl font-bold mb-4">404</h1>
      <p class="text-2xl mb-8">Page non trouvée</p>
      <button onclick="router.navigate('/')" class="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
        Retour à l'accueil
      </button>
    </div>
  </div>
`);

// Démarrer l'application
document.addEventListener('DOMContentLoaded', () => {
  // Restaurer l'utilisateur depuis localStorage
  const storedUser = localStorage.getItem('teammove_user');
  if (storedUser) {
    try {
      state.user = JSON.parse(storedUser);
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
  }
  
  router.render();
});
