import { getUserEmail, logout } from '../auth.js';
import { navigate } from '../router.js';

export function render() {
  const email = getUserEmail();
  return `
<div class="flex h-screen overflow-hidden">
  <!-- Sidebar -->
  <aside class="fixed h-screen w-[280px] left-0 top-0 bg-surface-container-lowest/80 backdrop-blur-xl border-r border-outline-variant/10 shadow-sm flex flex-col py-margin-desktop z-40 hidden lg:flex">
    <div class="px-8 mb-12">
      <div class="font-display-lg text-display-lg font-semibold tracking-tighter text-primary">Orion AI</div>
      <div class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-1 opacity-60">Computational Elegance</div>
    </div>
    <nav class="flex-1 px-4 space-y-1">
      <a class="flex items-center gap-4 px-4 py-3 text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 rounded-lg group cursor-pointer" data-nav="chat">
        <span class="material-symbols-outlined group-hover:text-primary">dashboard</span><span>Dashboard</span>
      </a>
      <a class="flex items-center gap-4 px-4 py-3 text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 rounded-lg group cursor-pointer" data-nav="agents">
        <span class="material-symbols-outlined group-hover:text-primary">smart_toy</span><span>Agents</span>
      </a>
      <a class="flex items-center gap-4 px-4 py-3 text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 rounded-lg group cursor-pointer" data-nav="agents">
        <span class="material-symbols-outlined group-hover:text-primary">memory</span><span>Memory</span>
      </a>
      <a class="flex items-center gap-4 px-4 py-3 text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 rounded-lg group cursor-pointer" data-nav="agents">
        <span class="material-symbols-outlined group-hover:text-primary">build</span><span>Tools</span>
      </a>
      <a class="flex items-center gap-4 px-4 py-3 text-primary font-bold border-r-2 border-primary bg-white/5 rounded-lg group cursor-pointer" data-nav="settings">
        <span class="material-symbols-outlined">settings</span><span>Settings</span>
      </a>
    </nav>
    <div class="mt-auto px-4 space-y-1 border-t border-outline-variant/10 pt-6">
      <div class="flex items-center gap-4 px-4 py-3 text-on-surface-variant font-medium">
        <span class="material-symbols-outlined">account_circle</span><span class="truncate text-sm">${email}</span>
      </div>
      <a id="settings-logout" class="flex items-center gap-4 px-4 py-3 text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 rounded-lg cursor-pointer">
        <span class="material-symbols-outlined">logout</span><span>Logout</span>
      </a>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 ml-0 lg:ml-[280px] overflow-y-auto px-margin-desktop py-margin-desktop bg-transparent scroll-smooth custom-scrollbar">
    <div class="max-w-4xl mx-auto space-y-12 pb-32">
      <header class="space-y-2">
        <h1 class="font-display-lg text-display-lg text-on-surface">Configuration</h1>
        <p class="text-on-surface-variant font-body-lg">Refine your interface and computational parameters.</p>
      </header>

      <!-- Profile Section -->
      <section class="glass-panel p-8 rounded-xl space-y-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-6">
            <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-surface-container flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl text-primary">account_circle</span>
            </div>
            <div>
              <h3 class="font-headline-md text-headline-md text-on-surface">${email.split('@')[0]}</h3>
              <p class="text-on-surface-variant font-body-md">${email}</p>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2 col-span-2">
            <label class="text-label-sm uppercase tracking-wider text-on-surface-variant opacity-60">Email System Address</label>
            <input class="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary/50 focus:ring-0 rounded-lg px-4 py-3 text-on-surface outline-none transition-all font-body-md" type="email" value="${email}" readonly />
          </div>
        </div>
      </section>

      <!-- Appearance Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-primary">palette</span>
          <h2 class="font-headline-md text-headline-md">Appearance</h2>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <button class="glass-card p-6 rounded-xl flex flex-col gap-4 border-primary ring-1 ring-primary">
            <div class="w-full aspect-video bg-background rounded-lg border border-outline-variant/30 overflow-hidden relative">
              <div class="absolute top-2 left-2 w-1/2 h-2 bg-primary/20 rounded-full"></div>
              <div class="absolute top-6 left-2 w-1/3 h-1.5 bg-on-surface-variant/20 rounded-full"></div>
              <div class="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-primary/40"></div>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-medium text-primary">Deep Obsidian</span>
              <span class="material-symbols-outlined text-primary text-[20px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
            </div>
          </button>
          <button class="glass-card p-6 rounded-xl flex flex-col gap-4">
            <div class="w-full aspect-video bg-neutral-100 rounded-lg border border-outline-variant/30"></div>
            <span class="font-medium text-on-surface-variant">Titanium Light</span>
          </button>
          <button class="glass-card p-6 rounded-xl flex flex-col gap-4">
            <div class="w-full aspect-video bg-gradient-to-br from-background to-primary/20 rounded-lg border border-outline-variant/30"></div>
            <span class="font-medium text-on-surface-variant">Nebula Dynamic</span>
          </button>
        </div>
      </section>

      <!-- Notifications Section -->
      <section class="glass-panel p-8 rounded-xl space-y-6">
        <div class="flex items-center gap-3 mb-2">
          <span class="material-symbols-outlined text-primary">notifications_active</span>
          <h2 class="font-headline-md text-headline-md">Notifications</h2>
        </div>
        <div class="space-y-4">
          <div class="flex items-center justify-between py-4 border-b border-outline-variant/10">
            <div><p class="font-medium text-on-surface">Agent Activity Alerts</p><p class="text-body-md text-on-surface-variant opacity-70">Receive notifications when an agent completes a task.</p></div>
            <input checked class="custom-switch" type="checkbox" />
          </div>
          <div class="flex items-center justify-between py-4 border-b border-outline-variant/10">
            <div><p class="font-medium text-on-surface">Compute Usage Reports</p><p class="text-body-md text-on-surface-variant opacity-70">Weekly summaries of usage across projects.</p></div>
            <input checked class="custom-switch" type="checkbox" />
          </div>
          <div class="flex items-center justify-between py-4">
            <div><p class="font-medium text-on-surface">Security & API Logs</p><p class="text-body-md text-on-surface-variant opacity-70">Immediate notification for new API key creation or IP changes.</p></div>
            <input class="custom-switch" type="checkbox" />
          </div>
        </div>
      </section>

      <!-- Keyboard Shortcuts -->
      <section class="space-y-6">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-primary">keyboard</span>
          <h2 class="font-headline-md text-headline-md">Keyboard Shortcuts</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-card p-4 rounded-xl flex flex-col justify-between h-32">
            <p class="text-label-sm text-on-surface-variant opacity-70">Command Bar</p>
            <div class="flex gap-1">
              <kbd class="px-2 py-1 bg-surface-container-high border border-outline-variant/30 rounded font-code text-xs">⌘</kbd>
              <kbd class="px-2 py-1 bg-surface-container-high border border-outline-variant/30 rounded font-code text-xs">K</kbd>
            </div>
          </div>
          <div class="glass-card p-4 rounded-xl flex flex-col justify-between h-32">
            <p class="text-label-sm text-on-surface-variant opacity-70">New Agent</p>
            <div class="flex gap-1">
              <kbd class="px-2 py-1 bg-surface-container-high border border-outline-variant/30 rounded font-code text-xs">⌘</kbd>
              <kbd class="px-2 py-1 bg-surface-container-high border border-outline-variant/30 rounded font-code text-xs">N</kbd>
            </div>
          </div>
          <div class="glass-card p-4 rounded-xl flex flex-col justify-between h-32">
            <p class="text-label-sm text-on-surface-variant opacity-70">Focus Sidebar</p>
            <div class="flex gap-1">
              <kbd class="px-2 py-1 bg-surface-container-high border border-outline-variant/30 rounded font-code text-xs">⌘</kbd>
              <kbd class="px-2 py-1 bg-surface-container-high border border-outline-variant/30 rounded font-code text-xs">\</kbd>
            </div>
          </div>
          <div class="glass-card p-4 rounded-xl flex flex-col justify-between h-32">
            <p class="text-label-sm text-on-surface-variant opacity-70">Global Search</p>
            <div class="flex gap-1">
              <kbd class="px-2 py-1 bg-surface-container-high border border-outline-variant/30 rounded font-code text-xs">/</kbd>
            </div>
          </div>
        </div>
      </section>

      <!-- Danger Zone -->
      <section class="border-t border-outline-variant/20 pt-12">
        <div class="glass-panel p-8 rounded-xl border-error/30 bg-error-container/5 space-y-6">
          <div>
            <h3 class="font-headline-md text-headline-md text-error">Danger Zone</h3>
            <p class="text-on-surface-variant font-body-md mt-1">Irreversible administrative actions.</p>
          </div>
          <div class="flex items-center justify-between">
            <div><p class="font-medium text-on-surface">Log Out</p><p class="text-body-md text-on-surface-variant opacity-70">Sign out of your Orion account.</p></div>
            <button id="danger-logout" class="px-6 py-2 border border-outline-variant/30 hover:border-error hover:text-error rounded-lg font-medium transition-all">Sign Out</button>
          </div>
        </div>
      </section>

      <footer class="w-full py-gutter flex flex-col md:flex-row justify-between items-center border-t border-outline-variant/10 text-on-surface-variant font-label-sm text-label-sm">
        <p>© 2024 Orion AI. Engineered for Intelligence.</p>
        <div class="flex gap-6 mt-4 md:mt-0">
          <a class="hover:text-primary transition-colors" href="#">Privacy</a>
          <a class="hover:text-primary transition-colors" href="#">Terms</a>
          <a class="hover:text-primary transition-colors" href="#">Status</a>
        </div>
      </footer>
    </div>
  </main>
</div>
  `;
}

export function init() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigate('#/' + el.dataset.nav));
  });
  document.getElementById('settings-logout')?.addEventListener('click', logout);
  document.getElementById('danger-logout')?.addEventListener('click', logout);
}
