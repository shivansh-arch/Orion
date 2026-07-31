import { getUserEmail, logout } from '../auth.js';
import { navigate } from '../router.js';

export function render() {
  const email = getUserEmail();
  return `
<div class="flex h-screen overflow-hidden">
  <!-- Sidebar -->
  <aside class="fixed h-screen w-[280px] left-0 top-0 bg-surface-container-lowest/80 backdrop-blur-xl border-r border-outline-variant/10 shadow-sm flex flex-col py-10 z-40 hidden lg:flex">
    <div class="px-8 mb-12">
      <h1 class="font-display-lg text-display-lg font-semibold tracking-tighter text-primary">Orion AI</h1>
      <p class="font-label-sm text-label-sm text-on-surface-variant/60 uppercase tracking-widest mt-1">Computational Elegance</p>
    </div>
    <nav class="flex-1 px-4 space-y-2">
      <a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 rounded-lg group cursor-pointer" data-nav="chat">
        <span class="material-symbols-outlined group-hover:text-primary">dashboard</span><span>Dashboard</span>
      </a>
      <a class="flex items-center gap-3 px-4 py-3 text-primary font-bold border-r-2 border-primary bg-primary/5 rounded-lg cursor-pointer" data-nav="agents">
        <span class="material-symbols-outlined">smart_toy</span><span>Agents</span>
      </a>
      <a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 rounded-lg group cursor-pointer" data-nav="agents">
        <span class="material-symbols-outlined group-hover:text-primary">memory</span><span>Memory</span>
      </a>
      <a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 rounded-lg group cursor-pointer" data-nav="agents">
        <span class="material-symbols-outlined group-hover:text-primary">build</span><span>Tools</span>
      </a>
      <a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 rounded-lg group cursor-pointer" data-nav="settings">
        <span class="material-symbols-outlined group-hover:text-primary">settings</span><span>Settings</span>
      </a>
    </nav>
    <div class="px-4 py-6 border-t border-outline-variant/10 space-y-2">
      <button id="agents-new-chat" class="w-full bg-primary text-on-primary py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all">
        <span class="material-symbols-outlined">add</span> New Chat
      </button>
      <div class="pt-4 space-y-1">
        <div class="flex items-center gap-3 px-4 py-2 text-on-surface-variant font-medium">
          <span class="material-symbols-outlined">account_circle</span><span class="truncate text-sm">${email}</span>
        </div>
        <a id="agents-logout" class="flex items-center gap-3 px-4 py-2 text-on-surface-variant font-medium hover:text-primary transition-colors cursor-pointer">
          <span class="material-symbols-outlined">logout</span><span>Logout</span>
        </a>
      </div>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 ml-0 lg:ml-[280px] relative overflow-y-auto custom-scrollbar bg-background">
    <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] -z-10 rounded-full"></div>
    <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 blur-[100px] -z-10 rounded-full"></div>
    <div class="max-w-container-max mx-auto px-margin-desktop py-12">
      <header class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 class="font-display-lg text-display-lg text-on-surface tracking-tight">System Core</h2>
          <p class="text-on-surface-variant font-body-lg mt-2 max-w-xl">Orchestrate your intelligence layer. Manage neural agents and long-term memory clusters across projects.</p>
        </div>
        <div class="glass-panel rounded-full px-4 py-2 flex items-center gap-2 border-outline-variant/20">
          <span class="w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_#5de6ff]"></span>
          <span class="font-code text-label-sm uppercase tracking-wider text-secondary">Neural Link Active</span>
        </div>
      </header>

      <div class="grid grid-cols-12 gap-8 items-start">
        <!-- Agents Column -->
        <section class="col-span-12 lg:col-span-5 space-y-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-headline-md text-headline-md flex items-center gap-3">
              <span class="material-symbols-outlined text-primary">smart_toy</span> Agents
            </h3>
          </div>
          <!-- The Researcher -->
          <div class="agent-card relative glass-panel p-6 rounded-2xl group transition-all duration-300 hover:border-primary/40 cursor-pointer overflow-hidden">
            <div class="agent-glow absolute -right-10 -top-10 w-32 h-32 bg-primary/10 blur-3xl opacity-0 transition-opacity"></div>
            <div class="flex items-start justify-between relative z-10">
              <div class="flex gap-4">
                <div class="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-colors">
                  <span class="material-symbols-outlined text-3xl text-primary" style="font-variation-settings: 'FILL' 1;">smb_share</span>
                </div>
                <div>
                  <h4 class="font-headline-md text-lg text-on-surface mb-1">The Researcher</h4>
                  <div class="flex items-center gap-2">
                    <span class="status-pulse w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span class="font-code text-xs text-secondary uppercase tracking-tighter">Available</span>
                  </div>
                </div>
              </div>
            </div>
            <p class="font-body-md text-on-surface-variant mt-4 leading-relaxed">Web search, Wikipedia lookups, and webpage analysis. Routes research queries to find accurate, real-time information.</p>
            <div class="mt-6 flex gap-2">
              <span class="px-2 py-1 rounded bg-white/5 text-[10px] font-code uppercase tracking-widest text-on-surface-variant">search</span>
              <span class="px-2 py-1 rounded bg-white/5 text-[10px] font-code uppercase tracking-widest text-on-surface-variant">fetch_webpage</span>
            </div>
          </div>
          <!-- Code Architect -->
          <div class="agent-card relative glass-panel p-6 rounded-2xl group transition-all duration-300 hover:border-primary/40 cursor-pointer overflow-hidden">
            <div class="flex items-start justify-between relative z-10">
              <div class="flex gap-4">
                <div class="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-colors">
                  <span class="material-symbols-outlined text-3xl text-primary" style="font-variation-settings: 'FILL' 1;">terminal</span>
                </div>
                <div>
                  <h4 class="font-headline-md text-lg text-on-surface mb-1">Code Architect</h4>
                  <div class="flex items-center gap-2">
                    <span class="status-pulse w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span class="font-code text-xs text-secondary uppercase tracking-tighter">Available</span>
                  </div>
                </div>
              </div>
            </div>
            <p class="font-body-md text-on-surface-variant mt-4 leading-relaxed">Python code execution, debugging, and software engineering. Runs code in a sandboxed environment and returns results.</p>
            <div class="mt-6 flex gap-2">
              <span class="px-2 py-1 rounded bg-white/5 text-[10px] font-code uppercase tracking-widest text-on-surface-variant">run_python_code</span>
            </div>
          </div>
          <!-- Orchestrator -->
          <div class="agent-card relative glass-panel p-6 rounded-2xl group transition-all duration-300 hover:border-primary/40 cursor-pointer overflow-hidden">
            <div class="flex items-start justify-between relative z-10">
              <div class="flex gap-4">
                <div class="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-colors">
                  <span class="material-symbols-outlined text-3xl text-primary" style="font-variation-settings: 'FILL' 1;">hub</span>
                </div>
                <div>
                  <h4 class="font-headline-md text-lg text-on-surface mb-1">Orchestrator</h4>
                  <div class="flex items-center gap-2">
                    <span class="status-pulse w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span class="font-code text-xs text-secondary uppercase tracking-tighter">Active</span>
                  </div>
                </div>
              </div>
            </div>
            <p class="font-body-md text-on-surface-variant mt-4 leading-relaxed">Routes incoming queries to the appropriate specialist agent. Classifies intent and manages the agent lifecycle.</p>
            <div class="mt-6 flex gap-2">
              <span class="px-2 py-1 rounded bg-white/5 text-[10px] font-code uppercase tracking-widest text-on-surface-variant">route</span>
              <span class="px-2 py-1 rounded bg-white/5 text-[10px] font-code uppercase tracking-widest text-on-surface-variant">classify</span>
            </div>
          </div>
        </section>

        <!-- Memory Column -->
        <section class="col-span-12 lg:col-span-7 space-y-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-headline-md text-headline-md flex items-center gap-3">
              <span class="material-symbols-outlined text-primary">memory</span> Neural Memory
            </h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="glass-panel p-5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
              <div class="flex justify-between items-start mb-3">
                <span class="font-code text-[10px] text-on-surface-variant uppercase tracking-widest">System</span>
              </div>
              <h5 class="font-headline-md text-base text-on-surface mb-2">Request-Scoped Memory</h5>
              <p class="font-body-md text-on-surface-variant text-sm line-clamp-2">Each conversation maintains its own memory context with automatic summarization when the message count exceeds the threshold.</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <span class="px-2 py-0.5 rounded-full border border-primary/20 text-primary text-[10px] font-medium">#Memory</span>
                <span class="px-2 py-0.5 rounded-full border border-white/10 text-on-surface-variant text-[10px]">#Context</span>
              </div>
            </div>
            <div class="glass-panel p-5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
              <div class="flex justify-between items-start mb-3">
                <span class="font-code text-[10px] text-on-surface-variant uppercase tracking-widest">System</span>
              </div>
              <h5 class="font-headline-md text-base text-on-surface mb-2">Conversation History</h5>
              <p class="font-body-md text-on-surface-variant text-sm line-clamp-2">MongoDB persists up to 20 prior messages per conversation. History is loaded and sent to the AI agent for context continuity.</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <span class="px-2 py-0.5 rounded-full border border-tertiary/20 text-tertiary text-[10px] font-medium">#Persistence</span>
                <span class="px-2 py-0.5 rounded-full border border-white/10 text-on-surface-variant text-[10px]">#MongoDB</span>
              </div>
            </div>
            <div class="md:col-span-2 glass-panel p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
              <div class="flex justify-between items-start mb-3">
                <span class="font-code text-[10px] text-on-surface-variant uppercase tracking-widest">System</span>
              </div>
              <h5 class="font-headline-md text-base text-on-surface mb-2">Automatic Summarization</h5>
              <p class="font-body-md text-on-surface-variant text-sm max-w-lg">When conversation memory exceeds the max message threshold, older messages are automatically compressed into a summary while preserving the system prompt and active reasoning chain.</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <span class="px-2 py-0.5 rounded-full border border-secondary/20 text-secondary text-[10px] font-medium">#Summarization</span>
                <span class="px-2 py-0.5 rounded-full border border-white/10 text-on-surface-variant text-[10px]">#LLM</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <footer class="w-full py-gutter px-margin-desktop border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center bg-background mt-20">
      <div class="flex flex-col md:flex-row items-center gap-6">
        <span class="font-display-lg-mobile text-display-lg-mobile text-on-surface font-semibold tracking-tighter">Orion AI</span>
        <div class="flex gap-6">
          <a class="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy</a>
          <a class="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms</a>
          <a class="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Status</a>
        </div>
      </div>
      <p class="font-label-sm text-label-sm text-on-surface-variant mt-4 md:mt-0">© 2024 Orion AI. Engineered for Intelligence.</p>
    </footer>
  </main>
</div>
  `;
}

export function init() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigate('#/' + el.dataset.nav));
  });
  document.getElementById('agents-logout')?.addEventListener('click', logout);
  document.getElementById('agents-new-chat')?.addEventListener('click', () => navigate('#/chat'));
}
