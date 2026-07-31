import { isAuthenticated } from './auth.js';

let currentCleanup = null;

const routes = {
  '': { load: () => import('./pages/landing.js'), protected: false },
  '#/': { load: () => import('./pages/landing.js'), protected: false },
  '#/login': { load: () => import('./pages/auth.js'), protected: false, mode: 'login' },
  '#/signup': { load: () => import('./pages/auth.js'), protected: false, mode: 'signup' },
  '#/chat': { load: () => import('./pages/chat.js'), protected: true },
  '#/settings': { load: () => import('./pages/settings.js'), protected: true },
  '#/agents': { load: () => import('./pages/agents.js'), protected: true },
};

export function navigate(hash) {
  window.location.hash = hash;
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

async function handleRoute() {
  const hash = window.location.hash || '';
  const route = routes[hash] || routes[''];

  if (route.protected && !isAuthenticated()) {
    window.location.hash = '#/login';
    return;
  }

  if ((hash === '#/login' || hash === '#/signup') && isAuthenticated()) {
    window.location.hash = '#/chat';
    return;
  }

  // Cleanup previous page
  if (currentCleanup && typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  const app = document.getElementById('app');
  const mod = await route.load();
  app.innerHTML = mod.render(route.mode);
  if (mod.init) {
    currentCleanup = mod.init(route.mode);
  }
}
