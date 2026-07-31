import { navigate } from '../router.js';

export function render() {
  return `
<!-- TopAppBar Navigation -->
<header class="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-md border-b border-outline-variant/10">
  <nav class="flex justify-between items-center h-16 px-margin-desktop max-w-container-max mx-auto">
    <div class="flex items-center gap-8">
      <span class="font-display-lg text-display-lg font-bold text-on-surface">Orion AI</span>
      <div class="hidden md:flex items-center gap-6">
        <a class="text-primary border-b-2 border-primary pb-1 font-medium transition-all" href="#">Features</a>
        <a class="text-on-surface-variant hover:text-primary transition-all font-medium" href="#">Pricing</a>
        <a class="text-on-surface-variant hover:text-primary transition-all font-medium" href="#">Docs</a>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div class="hidden sm:flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full border border-outline-variant/10">
        <span class="material-symbols-outlined text-[20px] text-on-surface-variant">search</span>
        <input class="bg-transparent border-none focus:ring-0 text-sm w-32 placeholder:text-outline" placeholder="Search resources..." type="text" />
      </div>
      <button class="material-symbols-outlined p-2 text-on-surface-variant hover:text-primary transition-all">notifications</button>
      <div class="flex items-center gap-3 ml-2">
        <button id="nav-login" class="text-on-surface-variant font-medium hover:text-primary transition-all">Login</button>
        <button id="nav-get-started" class="bg-primary text-on-primary px-6 py-2 rounded-full font-semibold active:opacity-80 transition-all">Get Started</button>
      </div>
    </div>
  </nav>
</header>

<main class="relative">
  <!-- Hero Background Decor -->
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] overflow-hidden -z-10 pointer-events-none">
    <div class="ethereal-glow absolute top-[-20%] left-[-10%] w-[600px] h-[600px]"></div>
    <div class="ethereal-glow absolute bottom-[20%] right-[-10%] w-[500px] h-[500px]" style="background: radial-gradient(circle, rgba(93, 230, 255, 0.1) 0%, transparent 70%);"></div>
  </div>

  <!-- Hero Section -->
  <section class="pt-48 pb-32 px-margin-desktop max-w-container-max mx-auto text-center">
    <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8">
      <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
      <span class="font-label-sm text-label-sm uppercase tracking-widest">Next-Gen Intelligence</span>
    </div>
    <h1 class="font-display-lg text-[64px] leading-[1.05] tracking-tight mb-8 max-w-4xl mx-auto">
      Computational Elegance.<br />
      <span class="text-primary">Human Intuition.</span>
    </h1>
    <p class="text-on-surface-variant font-body-lg text-body-lg max-w-2xl mx-auto mb-12">
      Orion AI bridges the gap between raw computational power and creative fluid thought. Orchestrate agents, manage infinite memory, and build the future of logic.
    </p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
      <button id="hero-get-started" class="shimmer-btn bg-primary text-on-primary font-bold px-10 py-4 rounded-xl text-lg flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
        Get Started <span class="material-symbols-outlined">arrow_forward</span>
      </button>
      <button class="glass-card hover:bg-white/5 text-on-surface font-medium px-10 py-4 rounded-xl text-lg flex items-center gap-3 transition-all border border-white/10">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">play_arrow</span> Watch Demo
      </button>
    </div>
  </section>

  <!-- Bento Grid Features -->
  <section class="py-24 px-margin-desktop max-w-container-max mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
      <div class="md:col-span-8 glass-card rounded-[2rem] p-10 flex flex-col justify-between group overflow-hidden relative">
        <div class="relative z-10">
          <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
            <span class="material-symbols-outlined text-[28px]">memory</span>
          </div>
          <h3 class="font-headline-md text-headline-md mb-4">Contextual Memory</h3>
          <p class="text-on-surface-variant max-w-md">Our neural architecture preserves deep context across sessions, allowing Orion to remember nuanced project details like a veteran collaborator.</p>
        </div>
      </div>
      <div class="md:col-span-4 glass-card rounded-[2rem] p-10 flex flex-col items-start hover:border-primary/30 transition-all">
        <div class="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
          <span class="material-symbols-outlined text-[28px]">smart_toy</span>
        </div>
        <h3 class="font-headline-md text-headline-md mb-4">Agentic Execution</h3>
        <p class="text-on-surface-variant">Autonomous agents that don't just chat—they execute. Deploy task-specific entities to handle coding, research, and design pipelines.</p>
        <div class="mt-auto pt-8 flex -space-x-3">
          <div class="w-10 h-10 rounded-full border-2 border-background bg-surface-container-high"></div>
          <div class="w-10 h-10 rounded-full border-2 border-background bg-primary"></div>
          <div class="w-10 h-10 rounded-full border-2 border-background bg-secondary"></div>
          <div class="w-10 h-10 rounded-full border-2 border-background flex items-center justify-center bg-surface-variant text-[10px] font-bold">+12</div>
        </div>
      </div>
      <div class="md:col-span-4 glass-card rounded-[2rem] p-10 flex flex-col justify-center hover:border-primary/30 transition-all">
        <div class="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-6">
          <span class="material-symbols-outlined text-[28px]">build</span>
        </div>
        <h3 class="font-headline-md text-headline-md mb-4">Infinite Tools</h3>
        <p class="text-on-surface-variant">Connect to any API, database, or local file system. Orion's tool-calling engine is built for infinite extensibility.</p>
      </div>
      <div class="md:col-span-8 glass-card rounded-[2rem] p-10 flex flex-row items-center justify-between gap-8 group overflow-hidden">
        <div class="flex-1">
          <h3 class="font-headline-md text-headline-md mb-4">Developer First Infrastructure</h3>
          <p class="text-on-surface-variant mb-6">Deploy locally or to the cloud with one command. Built with privacy and speed at the core.</p>
          <div class="flex gap-4">
            <span class="px-3 py-1 rounded bg-surface-container-highest font-code text-xs text-primary">npm install @orion/sdk</span>
            <span class="material-symbols-outlined text-outline-variant cursor-pointer">content_copy</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Capability Showcase -->
  <section class="py-32 bg-surface-container-lowest relative overflow-hidden">
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 left-0 w-full h-full" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"></div>
    </div>
    <div class="max-w-container-max mx-auto px-margin-desktop grid md:grid-cols-2 gap-20 items-center">
      <div>
        <h2 class="font-display-lg text-[40px] mb-8 leading-tight">Mastering Complexity through Visual Logic</h2>
        <div class="space-y-8">
          <div class="flex gap-6">
            <div class="flex-shrink-0 w-12 h-12 rounded-full border border-primary/40 flex items-center justify-center text-primary">01</div>
            <div>
              <h4 class="font-bold text-lg mb-1">Vectorized Semantic Mapping</h4>
              <p class="text-on-surface-variant">Navigate large datasets through intuitive visual clusters that represent conceptual relationships.</p>
            </div>
          </div>
          <div class="flex gap-6">
            <div class="flex-shrink-0 w-12 h-12 rounded-full border border-primary/40 flex items-center justify-center text-primary">02</div>
            <div>
              <h4 class="font-bold text-lg mb-1">Predictive State Modeling</h4>
              <p class="text-on-surface-variant">Forecast project outcomes with real-time simulations based on agentic behavior models.</p>
            </div>
          </div>
          <div class="flex gap-6">
            <div class="flex-shrink-0 w-12 h-12 rounded-full border border-primary/40 flex items-center justify-center text-primary">03</div>
            <div>
              <h4 class="font-bold text-lg mb-1">Zero-Latency Synthesis</h4>
              <p class="text-on-surface-variant">Instant processing speeds optimized for deep learning clusters and edge devices alike.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="relative aspect-square">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-[3rem] rotate-3 blur-2xl"></div>
        <div class="relative w-full h-full glass-card rounded-[3rem] flex items-center justify-center p-8 overflow-hidden">
          <div class="absolute inset-0 flex items-center justify-center opacity-50">
            <div class="w-64 h-64 border border-white/10 rounded-full animate-pulse"></div>
            <div class="absolute w-48 h-48 border border-white/5 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-32 px-margin-desktop text-center">
    <div class="max-w-4xl mx-auto glass-card p-16 rounded-[3rem] relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 ethereal-glow opacity-20 -mr-32 -mt-32"></div>
      <h2 class="font-display-lg text-[48px] mb-6">Ready to amplify your intelligence?</h2>
      <p class="text-on-surface-variant text-body-lg mb-10 max-w-xl mx-auto">Join the elite cohort of engineers and creators already building with Orion AI.</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button id="cta-create-account" class="bg-on-surface text-background font-bold px-12 py-4 rounded-xl hover:opacity-90 transition-all">Create Account</button>
        <button class="border border-white/10 px-12 py-4 rounded-xl hover:bg-white/5 transition-all">Talk to Sales</button>
      </div>
    </div>
  </section>
</main>

<!-- Footer -->
<footer class="w-full py-gutter bg-background border-t border-outline-variant/10">
  <div class="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-container-max mx-auto gap-8">
    <div class="flex flex-col items-center md:items-start gap-4">
      <span class="font-display-lg text-display-lg-mobile text-on-surface font-bold">Orion AI</span>
      <p class="font-label-sm text-label-sm text-on-surface-variant tracking-wider">© 2024 Orion AI. Engineered for Intelligence.</p>
    </div>
    <div class="flex gap-8">
      <a class="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors underline uppercase tracking-widest" href="#">Privacy</a>
      <a class="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors underline uppercase tracking-widest" href="#">Terms</a>
      <a class="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors underline uppercase tracking-widest" href="#">API</a>
      <a class="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors underline uppercase tracking-widest" href="#">Status</a>
    </div>
    <div class="flex gap-4">
      <button class="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all">
        <span class="material-symbols-outlined text-[20px]">public</span>
      </button>
      <button class="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all">
        <span class="material-symbols-outlined text-[20px]">terminal</span>
      </button>
    </div>
  </div>
</footer>
  `;
}

export function init() {
  document.getElementById('nav-login')?.addEventListener('click', () => navigate('#/login'));
  document.getElementById('nav-get-started')?.addEventListener('click', () => navigate('#/signup'));
  document.getElementById('hero-get-started')?.addEventListener('click', () => navigate('#/signup'));
  document.getElementById('cta-create-account')?.addEventListener('click', () => navigate('#/signup'));

  // Parallax effect for glows
  const handleMouseMove = (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    const glows = document.querySelectorAll('.ethereal-glow');
    glows.forEach((glow, idx) => {
      const speed = (idx + 1) * 20;
      glow.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
  };
  document.addEventListener('mousemove', handleMouseMove);
  return () => document.removeEventListener('mousemove', handleMouseMove);
}
