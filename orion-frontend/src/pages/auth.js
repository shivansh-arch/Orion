import { setToken } from '../auth.js';
import * as api from '../api.js';
import { navigate } from '../router.js';

export function render(mode) {
  const isLogin = mode !== 'signup';
  return `
<!-- Atmospheric Background Components -->
<div class="fixed inset-0 z-0 overflow-hidden pointer-events-none">
  <div class="animated-grid absolute inset-0 opacity-20"></div>
  <div class="ethereal-glow absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full"></div>
  <div class="ethereal-glow absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-40"></div>
  <div class="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-[2px]"></div>
</div>

<div class="flex flex-col min-h-screen relative">
  <!-- Navigation -->
  <header class="relative z-50 flex justify-between items-center h-20 px-margin-desktop max-w-container-max mx-auto w-full">
    <div class="flex items-center gap-2 cursor-pointer" id="auth-home-link">
      <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
      <span class="font-display-lg text-display-lg-mobile md:text-headline-md font-bold text-on-surface tracking-tighter">Orion AI</span>
    </div>
    <a class="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer" id="auth-back-home">Back to home</a>
  </header>

  <!-- Main Content Canvas -->
  <main class="flex-grow flex items-center justify-center px-margin-mobile py-gutter relative z-10">
    <div class="w-full max-w-[440px] glass-panel-deep rounded-xl p-8 md:p-10 transition-all duration-500" id="auth-card">
      <!-- Header Section -->
      <div class="text-center mb-8">
        <h1 class="font-display-lg text-display-lg-mobile text-on-surface mb-2" id="auth-title">${isLogin ? 'Welcome Back' : 'Join Orion AI'}</h1>
        <p class="font-body-md text-on-surface-variant" id="auth-subtitle">${isLogin ? 'Access the next generation of computational elegance.' : 'Start your journey into high-performance intelligence.'}</p>
      </div>

      <!-- Error Display -->
      <div id="auth-error" class="hidden mb-4 p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-sm text-center"></div>

      <!-- Social Login -->
      <div class="space-y-4 mb-8">
        <button id="google-btn" class="w-full h-12 flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-lg font-body-md text-on-surface hover:bg-white/10 active:scale-[0.98] transition-all duration-200">
          <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          <span>Continue with Google</span>
        </button>
      </div>

      <!-- Divider -->
      <div class="relative flex items-center gap-4 mb-8">
        <div class="flex-grow h-px bg-outline-variant/30"></div>
        <span class="font-label-sm text-label-sm text-outline uppercase tracking-widest">or</span>
        <div class="flex-grow h-px bg-outline-variant/30"></div>
      </div>

      <!-- Form Fields -->
      <form class="space-y-6" id="auth-form">
        <!-- Full Name (Only for Signup) -->
        <div class="${isLogin ? 'hidden' : ''} space-y-2" id="field-name">
          <label class="font-label-sm text-label-sm text-on-surface-variant ml-1">Full Name</label>
          <div class="relative group input-glow rounded-lg overflow-hidden">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">person</span>
            <input id="input-name" class="w-full bg-[#0A0A0A] border border-outline-variant/20 py-3 pl-10 pr-4 rounded-lg font-body-md text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-0 transition-all" placeholder="John Doe" type="text" />
          </div>
        </div>

        <!-- Email -->
        <div class="space-y-2">
          <label class="font-label-sm text-label-sm text-on-surface-variant ml-1">Email Address</label>
          <div class="relative group input-glow rounded-lg overflow-hidden">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">alternate_email</span>
            <input id="input-email" class="w-full bg-[#0A0A0A] border border-outline-variant/20 py-3 pl-10 pr-4 rounded-lg font-body-md text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-0 transition-all" placeholder="name@company.com" type="email" required />
          </div>
        </div>

        <!-- Password -->
        <div class="space-y-2">
          <div class="flex justify-between items-center px-1">
            <label class="font-label-sm text-label-sm text-on-surface-variant">Password</label>
            <a class="font-label-sm text-label-sm text-primary/80 hover:text-primary transition-colors ${isLogin ? '' : 'hidden'}" href="#" id="forgot-password">Forgot Password?</a>
          </div>
          <div class="relative group input-glow rounded-lg overflow-hidden">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
            <input id="input-password" class="w-full bg-[#0A0A0A] border border-outline-variant/20 py-3 pl-10 pr-12 rounded-lg font-body-md text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-0 transition-all" placeholder="••••••••" type="password" required />
            <button class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" type="button" id="toggle-password">
              <span class="material-symbols-outlined text-lg">visibility</span>
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button class="w-full h-12 bg-primary-container text-on-primary-container font-headline-md rounded-lg hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2" id="submit-btn" type="submit">
          <span id="submit-text">${isLogin ? 'Sign In' : 'Create Account'}</span>
          <span id="submit-spinner" class="hidden material-symbols-outlined animate-spin text-lg">progress_activity</span>
        </button>
      </form>

      <!-- Toggle View -->
      <div class="mt-8 text-center">
        <p class="font-body-md text-on-surface-variant">
          <span id="toggle-text">${isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
          <button class="text-primary font-medium hover:underline transition-all ml-1" id="auth-toggle">${isLogin ? 'Create Account' : 'Sign In'}</button>
        </p>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="relative z-10 w-full py-8 px-margin-desktop mt-auto border-t border-outline-variant/10">
    <div class="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      <p class="font-label-sm text-label-sm text-on-surface-variant/60">© 2024 Orion AI. Engineered for Intelligence.</p>
      <div class="flex gap-6">
        <a class="font-label-sm text-label-sm text-on-surface-variant/60 hover:text-primary transition-colors" href="#">Privacy</a>
        <a class="font-label-sm text-label-sm text-on-surface-variant/60 hover:text-primary transition-colors" href="#">Terms</a>
        <a class="font-label-sm text-label-sm text-on-surface-variant/60 hover:text-primary transition-colors" href="#">Status</a>
      </div>
    </div>
  </footer>
</div>

<!-- Scene Decoration -->
<div class="fixed top-1/4 right-1/4 animate-float opacity-30 z-0 hidden lg:block">
  <div class="w-24 h-24 border border-primary/20 rounded-2xl rotate-45 backdrop-blur-sm"></div>
</div>
<div class="fixed bottom-1/4 left-1/4 animate-float opacity-20 z-0 hidden lg:block" style="animation-delay: -5s">
  <div class="w-16 h-16 border border-secondary/20 rounded-full backdrop-blur-sm"></div>
</div>
  `;
}

export function init(mode) {
  let isLogin = mode !== 'signup';
  const authCard = document.getElementById('auth-card');
  const authToggle = document.getElementById('auth-toggle');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');
  const submitSpinner = document.getElementById('submit-spinner');
  const toggleText = document.getElementById('toggle-text');
  const fieldName = document.getElementById('field-name');
  const forgotPassword = document.getElementById('forgot-password');
  const authError = document.getElementById('auth-error');
  const form = document.getElementById('auth-form');
  const emailInput = document.getElementById('input-email');
  const passwordInput = document.getElementById('input-password');
  const nameInput = document.getElementById('input-name');
  const togglePasswordBtn = document.getElementById('toggle-password');

  function showError(msg) {
    authError.textContent = msg;
    authError.classList.remove('hidden');
    setTimeout(() => authError.classList.add('hidden'), 5000);
  }

  // Back to home
  document.getElementById('auth-back-home')?.addEventListener('click', () => navigate('#/'));
  document.getElementById('auth-home-link')?.addEventListener('click', () => navigate('#/'));

  // Google placeholder
  document.getElementById('google-btn')?.addEventListener('click', () => {
    showError('Google authentication is not yet configured.');
  });

  // Toggle password visibility
  togglePasswordBtn?.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePasswordBtn.querySelector('.material-symbols-outlined').textContent = type === 'password' ? 'visibility' : 'visibility_off';
  });

  // Toggle login/signup
  authToggle?.addEventListener('click', () => {
    authCard.style.opacity = '0';
    authCard.style.transform = 'scale(0.98)';
    setTimeout(() => {
      isLogin = !isLogin;
      if (isLogin) {
        authTitle.textContent = 'Welcome Back';
        authSubtitle.textContent = 'Access the next generation of computational elegance.';
        submitText.textContent = 'Sign In';
        toggleText.textContent = "Don't have an account?";
        authToggle.textContent = 'Create Account';
        fieldName.classList.add('hidden');
        forgotPassword.classList.remove('hidden');
        window.location.hash = '#/login';
      } else {
        authTitle.textContent = 'Join Orion AI';
        authSubtitle.textContent = 'Start your journey into high-performance intelligence.';
        submitText.textContent = 'Create Account';
        toggleText.textContent = 'Already have an account?';
        authToggle.textContent = 'Sign In';
        fieldName.classList.remove('hidden');
        forgotPassword.classList.add('hidden');
        window.location.hash = '#/signup';
      }
      authCard.style.opacity = '1';
      authCard.style.transform = 'scale(1)';
    }, 300);
  });

  // Form submission
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.classList.add('hidden');
    submitText.classList.add('hidden');
    submitSpinner.classList.remove('hidden');
    submitBtn.disabled = true;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
      if (isLogin) {
        const data = await api.login(email, password);
        if (data.error) {
          showError(data.error);
        } else if (data.token) {
          setToken(data.token);
          navigate('#/chat');
        }
      } else {
        const data = await api.signup(email, password);
        if (data.error) {
          showError(data.error);
        } else {
          // Auto-login after signup
          const loginData = await api.login(email, password);
          if (loginData.token) {
            setToken(loginData.token);
            navigate('#/chat');
          } else {
            showError(loginData.error || 'Signup succeeded but auto-login failed. Please sign in.');
          }
        }
      }
    } catch (err) {
      showError(err.message || 'An unexpected error occurred.');
    } finally {
      submitText.classList.remove('hidden');
      submitSpinner.classList.add('hidden');
      submitBtn.disabled = false;
    }
  });

  // Input focus effects
  const inputs = document.querySelectorAll('#auth-form input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => input.parentElement.classList.add('ring-2', 'ring-primary/20'));
    input.addEventListener('blur', () => input.parentElement.classList.remove('ring-2', 'ring-primary/20'));
  });
}
