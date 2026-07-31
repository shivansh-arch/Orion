import * as api from '../api.js';
import { getUserEmail, logout } from '../auth.js';
import { navigate } from '../router.js';
import { renderMarkdown } from '../utils/markdown.js';

let currentConversationId = null;
let conversations = [];
let isLoading = false;

export function render() {
  const email = getUserEmail();
  return (
    '<div class="flex h-screen w-full relative overflow-hidden">' +
    // Left Sidebar
    '<aside class="fixed h-screen w-[280px] left-0 top-0 bg-surface-container-lowest/80 backdrop-blur-xl border-r border-outline-variant/10 shadow-sm flex flex-col py-margin-desktop z-40 hidden lg:flex">' +
      '<div class="px-8 mb-8">' +
        '<div class="flex items-center gap-3 mb-1">' +
          '<span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: \'FILL\' 1;">dataset</span>' +
          '<h1 class="font-display-lg text-[24px] font-semibold tracking-tighter text-primary">Orion AI</h1>' +
        '</div>' +
        '<p class="text-on-surface-variant font-label-sm uppercase tracking-[0.2em] opacity-60">Computational Elegance</p>' +
      '</div>' +
      '<div class="px-6 mb-4">' +
        '<button id="new-chat-btn" class="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/20">' +
          '<span class="material-symbols-outlined text-xl">add_circle</span> New Chat' +
        '</button>' +
      '</div>' +
      '<div id="conversation-list" class="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-1 mb-4"></div>' +
      '<nav class="px-4 space-y-1 border-t border-outline-variant/10 pt-4">' +
        '<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold border-r-2 border-primary bg-white/5 transition-colors duration-200 cursor-pointer" data-nav="chat">' +
          '<span class="material-symbols-outlined" style="font-variation-settings: \'FILL\' 1;">dashboard</span><span>Dashboard</span>' +
        '</a>' +
        '<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 cursor-pointer" data-nav="agents">' +
          '<span class="material-symbols-outlined">smart_toy</span><span>Agents</span>' +
        '</a>' +
        '<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 cursor-pointer" data-nav="agents">' +
          '<span class="material-symbols-outlined">memory</span><span>Memory</span>' +
        '</a>' +
        '<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 cursor-pointer" data-nav="agents">' +
          '<span class="material-symbols-outlined">build</span><span>Tools</span>' +
        '</a>' +
        '<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 cursor-pointer" data-nav="settings">' +
          '<span class="material-symbols-outlined">settings</span><span>Settings</span>' +
        '</a>' +
      '</nav>' +
      '<div class="mt-auto px-4 pt-4 flex flex-col gap-1 border-t border-outline-variant/10">' +
        '<div class="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium">' +
          '<span class="material-symbols-outlined">account_circle</span>' +
          '<span class="text-sm truncate">' + _escapeHtml(email) + '</span>' +
        '</div>' +
        '<a id="logout-btn" class="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 cursor-pointer">' +
          '<span class="material-symbols-outlined">logout</span><span>Logout</span>' +
        '</a>' +
      '</div>' +
    '</aside>' +

    // Center Panel
    '<main class="flex-1 ml-0 lg:ml-[280px] mr-0 xl:mr-[340px] flex flex-col relative bg-surface-dim">' +
      '<header class="h-16 flex items-center justify-between px-8 bg-surface/70 backdrop-blur-md border-b border-outline-variant/10 z-30">' +
        '<div class="flex items-center gap-4">' +
          '<div class="flex items-center gap-2">' +
            '<span id="status-dot" class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>' +
            '<span class="font-medium text-on-surface/80">Orion AI Agent</span>' +
          '</div>' +
          '<div class="h-4 w-[1px] bg-outline-variant/30"></div>' +
          '<span id="conversation-title" class="text-on-surface-variant font-label-sm">New Conversation</span>' +
        '</div>' +
        '<div class="flex items-center gap-4">' +
          '<button id="mobile-menu-btn" class="lg:hidden material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-all">menu</button>' +
        '</div>' +
      '</header>' +

      '<div id="chat-messages" class="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 space-y-12">' +
        '<div id="welcome-state" class="flex flex-col items-center justify-center h-full text-center">' +
          '<span class="material-symbols-outlined text-primary text-6xl mb-6" style="font-variation-settings: \'FILL\' 1;">auto_awesome</span>' +
          '<h2 class="font-display-lg text-display-lg-mobile text-on-surface mb-3">How can I help you?</h2>' +
          '<p class="text-on-surface-variant font-body-lg max-w-md">Ask me anything — from research questions to writing Python scripts. I\'ll route your request to the best specialist agent.</p>' +
        '</div>' +
      '</div>' +

      '<div class="p-4 lg:p-8">' +
        '<div class="max-w-4xl mx-auto relative group">' +
          '<div class="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>' +
          '<div class="relative glass-panel rounded-2xl flex items-end p-4 gap-4 shadow-2xl">' +
            '<textarea id="chat-input" class="flex-1 bg-transparent border-none focus:ring-0 text-on-surface font-body-lg resize-none py-2 placeholder:text-on-surface-variant/40 custom-scrollbar" placeholder="Command Orion AI..." rows="1"></textarea>' +
            '<div class="flex items-center gap-2">' +
              '<button id="send-btn" class="bg-primary text-on-primary p-2 px-3 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50" type="button">' +
                '<span class="material-symbols-outlined text-sm">send</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div class="mt-3 flex justify-center gap-6">' +
            '<span class="text-on-surface-variant/40 text-[10px] uppercase tracking-widest flex items-center gap-2">' +
              '<span class="material-symbols-outlined text-[12px]">keyboard_command_key</span> Enter to send' +
            '</span>' +
            '<span class="text-on-surface-variant/40 text-[10px] uppercase tracking-widest flex items-center gap-2">' +
              '<span class="material-symbols-outlined text-[12px]">search</span> Search Web Enabled' +
            '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</main>' +

    // Right Sidebar
    '<aside class="fixed h-screen w-[340px] right-0 top-0 glass-panel border-l border-outline-variant/10 flex flex-col z-40 hidden xl:flex">' +
      '<div class="h-16 flex items-center justify-between px-6 border-b border-outline-variant/10">' +
        '<h2 class="font-headline-md text-sm uppercase tracking-widest text-on-surface-variant font-bold">Reasoning & Execution</h2>' +
      '</div>' +
      '<div id="reasoning-panel" class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">' +
        '<div class="flex items-center justify-center h-full text-on-surface-variant/40 text-sm">' +
          '<p>Send a message to see agent reasoning</p>' +
        '</div>' +
      '</div>' +
      '<div class="p-6 bg-surface-container-low border-t border-outline-variant/10">' +
        '<div class="flex items-center justify-between mb-4">' +
          '<span class="text-xs text-on-surface-variant">Agent Status</span>' +
          '<span id="agent-status" class="text-xs text-secondary font-bold">READY</span>' +
        '</div>' +
        '<div class="w-full h-1 bg-outline-variant/20 rounded-full overflow-hidden">' +
          '<div id="agent-progress" class="w-0 h-full bg-primary shadow-[0_0_8px_rgba(192,193,255,0.5)] transition-all duration-500"></div>' +
        '</div>' +
      '</div>' +
    '</aside>' +
    '</div>' +

    // Mobile Navigation
    '<nav class="lg:hidden fixed bottom-0 left-0 w-full glass-panel border-t border-outline-variant/10 h-16 flex items-center justify-around px-4 z-50">' +
      '<button class="text-primary flex flex-col items-center gap-1" data-nav="chat">' +
        '<span class="material-symbols-outlined" style="font-variation-settings: \'FILL\' 1;">dashboard</span>' +
        '<span class="text-[10px] font-bold">Dash</span>' +
      '</button>' +
      '<button class="text-on-surface-variant flex flex-col items-center gap-1" data-nav="agents">' +
        '<span class="material-symbols-outlined">smart_toy</span>' +
        '<span class="text-[10px]">Agents</span>' +
      '</button>' +
      '<button id="mobile-new-chat" class="w-12 h-12 -mt-10 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center border-4 border-background">' +
        '<span class="material-symbols-outlined">add</span>' +
      '</button>' +
      '<button class="text-on-surface-variant flex flex-col items-center gap-1" data-nav="agents">' +
        '<span class="material-symbols-outlined">memory</span>' +
        '<span class="text-[10px]">Memory</span>' +
      '</button>' +
      '<button class="text-on-surface-variant flex flex-col items-center gap-1" data-nav="settings">' +
        '<span class="material-symbols-outlined">settings</span>' +
        '<span class="text-[10px]">Settings</span>' +
      '</button>' +
    '</nav>'
  );
}

function _escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

export function init() {
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const newChatBtn = document.getElementById('new-chat-btn');
  const mobileNewChat = document.getElementById('mobile-new-chat');
  const conversationList = document.getElementById('conversation-list');
  const conversationTitle = document.getElementById('conversation-title');
  const reasoningPanel = document.getElementById('reasoning-panel');
  const agentStatus = document.getElementById('agent-status');
  const agentProgress = document.getElementById('agent-progress');

  currentConversationId = null;
  conversations = [];
  isLoading = false;

  loadConversations();

  // Navigation
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigate('#/' + el.dataset.nav));
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  // New Chat
  function startNewChat() {
    currentConversationId = null;
    chatMessages.innerHTML =
      '<div id="welcome-state" class="flex flex-col items-center justify-center h-full text-center">' +
        '<span class="material-symbols-outlined text-primary text-6xl mb-6" style="font-variation-settings: \'FILL\' 1;">auto_awesome</span>' +
        '<h2 class="font-display-lg text-display-lg-mobile text-on-surface mb-3">How can I help you?</h2>' +
        '<p class="text-on-surface-variant font-body-lg max-w-md">Ask me anything — from research questions to writing Python scripts. I\'ll route your request to the best specialist agent.</p>' +
      '</div>';
    conversationTitle.textContent = 'New Conversation';
    resetReasoningPanel();
    highlightActiveConversation(null);
    chatInput.focus();
  }

  newChatBtn?.addEventListener('click', startNewChat);
  mobileNewChat?.addEventListener('click', startNewChat);

  // Send message
  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || isLoading) return;

    const welcome = document.getElementById('welcome-state');
    if (welcome) welcome.remove();

    appendMessage('user', message);
    chatInput.value = '';
    autoResizeTextarea();

    isLoading = true;
    sendBtn.disabled = true;
    agentStatus.textContent = 'PROCESSING';
    agentStatus.className = 'text-xs text-primary font-bold animate-pulse';
    agentProgress.style.width = '30%';
    const loadingId = appendLoading();

    try {
      const data = await api.sendMessage(message, currentConversationId);
      document.getElementById(loadingId)?.remove();

      if (data.error) {
        appendMessage('assistant', 'Error: ' + data.error);
      } else {
        const responseObj = data.response || data;
        const answer = responseObj.answer || responseObj.response ||
          (typeof responseObj === 'string' ? responseObj : JSON.stringify(responseObj));
        appendMessage('assistant', answer);
        updateReasoningPanel(responseObj);

        if (data.conversationId && data.conversationId !== currentConversationId) {
          currentConversationId = data.conversationId;
          conversationTitle.textContent = message.slice(0, 40);
          loadConversations();
        }
      }
    } catch (err) {
      document.getElementById(loadingId)?.remove();
      appendMessage('assistant', 'Error: ' + err.message);
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      agentStatus.textContent = 'READY';
      agentStatus.className = 'text-xs text-secondary font-bold';
      agentProgress.style.width = '100%';
      setTimeout(() => { agentProgress.style.width = '0%'; }, 1000);
    }
  }

  sendBtn?.addEventListener('click', sendMessage);
  chatInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  function autoResizeTextarea() {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
  }
  chatInput?.addEventListener('input', autoResizeTextarea);

  // ---- Helpers ----

  function appendMessage(role, content) {
    const isUser = role === 'user';
    const avatar = isUser
      ? '<span class="material-symbols-outlined text-on-surface-variant">person</span>'
      : '<span class="material-symbols-outlined text-primary" style="font-variation-settings: \'FILL\' 1;">auto_awesome</span>';
    const avatarClass = isUser
      ? 'bg-surface-container-high border border-white/5'
      : 'bg-primary/10 border border-primary/20 ai-glow';
    const nameClass = isUser ? 'text-on-surface-variant' : 'text-primary font-semibold';
    const name = isUser ? 'You' : 'Orion AI';
    const body = isUser ? _escapeHtml(content) : renderMarkdown(content);

    const el = document.createElement('div');
    el.className = 'flex gap-6 max-w-4xl mx-auto items-start';
    el.innerHTML =
      '<div class="w-10 h-10 rounded-lg ' + avatarClass + ' flex-shrink-0 flex items-center justify-center overflow-hidden">' + avatar + '</div>' +
      '<div class="flex-1 space-y-2 min-w-0">' +
        '<div class="font-label-sm uppercase tracking-wider ' + nameClass + '">' + name + '</div>' +
        '<div class="font-body-lg text-on-surface/90 leading-relaxed chat-markdown">' + body + '</div>' +
      '</div>';
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendLoading() {
    const id = 'loading-' + Date.now();
    const el = document.createElement('div');
    el.id = id;
    el.className = 'flex gap-6 max-w-4xl mx-auto items-start';
    el.innerHTML =
      '<div class="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 ai-glow flex-shrink-0 flex items-center justify-center">' +
        '<span class="material-symbols-outlined text-primary animate-spin">progress_activity</span>' +
      '</div>' +
      '<div class="flex-1 space-y-2">' +
        '<div class="text-primary font-label-sm uppercase tracking-wider font-semibold">Orion AI</div>' +
        '<div class="flex items-center gap-1 text-on-surface-variant">' +
          '<span class="loading-dot w-2 h-2 rounded-full bg-primary/60"></span>' +
          '<span class="loading-dot w-2 h-2 rounded-full bg-primary/60"></span>' +
          '<span class="loading-dot w-2 h-2 rounded-full bg-primary/60"></span>' +
          '<span class="ml-2 text-sm">Agent is thinking...</span>' +
        '</div>' +
      '</div>';
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
  }

  async function loadConversations() {
    try {
      conversations = await api.getConversations();
      renderConversationList();
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }

  function renderConversationList() {
    if (!conversations || conversations.length === 0) {
      conversationList.innerHTML = '<p class="text-on-surface-variant/40 text-xs text-center py-4">No conversations yet</p>';
      return;
    }
    conversationList.innerHTML = '';
    conversations.forEach(c => {
      const item = document.createElement('div');
      item.className = 'conversation-item flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors group ' +
        (c._id === currentConversationId ? 'bg-white/5 text-on-surface' : 'text-on-surface-variant');
      item.dataset.id = c._id;
      item.innerHTML =
        '<span class="material-symbols-outlined text-sm flex-shrink-0">chat_bubble</span>' +
        '<span class="text-sm truncate flex-1">' + _escapeHtml(c.title || 'Untitled') + '</span>' +
        '<button class="delete-conv-btn opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all p-0.5" data-id="' + c._id + '">' +
          '<span class="material-symbols-outlined text-sm">close</span>' +
        '</button>';
      item.addEventListener('click', e => {
        if (e.target.closest('.delete-conv-btn')) return;
        loadConversation(item.dataset.id);
      });
      item.querySelector('.delete-conv-btn').addEventListener('click', async e => {
        e.stopPropagation();
        try {
          await api.deleteConversation(c._id);
          if (currentConversationId === c._id) startNewChat();
          loadConversations();
        } catch (err) { console.error('Delete failed:', err); }
      });
      conversationList.appendChild(item);
    });
  }

  function highlightActiveConversation(id) {
    conversationList.querySelectorAll('.conversation-item').forEach(el => {
      if (el.dataset.id === id) {
        el.classList.add('bg-white/5', 'text-on-surface');
        el.classList.remove('text-on-surface-variant');
      } else {
        el.classList.remove('bg-white/5', 'text-on-surface');
        el.classList.add('text-on-surface-variant');
      }
    });
  }

  async function loadConversation(id) {
    try {
      currentConversationId = id;
      highlightActiveConversation(id);
      const messages = await api.getMessages(id);
      chatMessages.innerHTML = '';
      const conv = conversations.find(c => c._id === id);
      conversationTitle.textContent = conv?.title || 'Conversation';
      messages.forEach(msg => appendMessage(msg.role, msg.content));
      resetReasoningPanel();
      chatInput.focus();
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  }

  function updateReasoningPanel(responseObj) {
    const activity = responseObj.activity || [];
    const toolsUsed = responseObj.tools_used || [];
    const iterations = responseObj.iterations || 0;

    let stepsHtml = '';
    activity.forEach(step => {
      const isToolStep = step.toLowerCase().includes('called') || step.toLowerCase().includes('tool');
      const dotColor = isToolStep ? 'bg-secondary' : 'bg-primary';
      const ringColor = isToolStep ? 'ring-secondary/20' : 'ring-primary/20';
      stepsHtml +=
        '<div class="relative pl-10">' +
          '<div class="absolute left-1.5 top-1.5 w-3 h-3 rounded-full ' + dotColor + ' border-4 border-background ring-2 ' + ringColor + '"></div>' +
          '<div class="text-sm font-semibold mb-1">' + _escapeHtml(step) + '</div>' +
        '</div>';
    });

    const toolsHtml = toolsUsed
      .map(t => '<span class="px-2 py-1 rounded bg-black/30 border border-white/5 text-[10px] text-on-surface-variant">' + _escapeHtml(t) + '</span>')
      .join('');

    let html =
      '<section>' +
        '<h3 class="text-xs text-on-surface-variant/50 uppercase font-bold tracking-tighter mb-4">Compute Metrics</h3>' +
        '<div class="grid grid-cols-2 gap-3">' +
          '<div class="p-3 rounded-xl bg-surface-container-high border border-white/5">' +
            '<div class="text-[10px] text-on-surface-variant uppercase mb-1">Iterations</div>' +
            '<div class="text-lg font-code font-bold text-primary">' + iterations + '</div>' +
          '</div>' +
          '<div class="p-3 rounded-xl bg-surface-container-high border border-white/5">' +
            '<div class="text-[10px] text-on-surface-variant uppercase mb-1">Tools</div>' +
            '<div class="text-lg font-code font-bold text-secondary">' + toolsUsed.length + '</div>' +
          '</div>' +
        '</div>' +
      '</section>';

    if (stepsHtml) {
      html +=
        '<section>' +
          '<h3 class="text-xs text-on-surface-variant/50 uppercase font-bold tracking-tighter mb-4">Execution Steps</h3>' +
          '<div class="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant/20">' +
            stepsHtml +
          '</div>' +
        '</section>';
    }

    if (toolsHtml) {
      html +=
        '<section>' +
          '<div class="p-4 rounded-2xl bg-primary/5 border border-primary/10">' +
            '<div class="flex items-center gap-2 mb-3">' +
              '<span class="material-symbols-outlined text-primary text-lg">psychology</span>' +
              '<h3 class="text-xs font-bold text-primary uppercase tracking-tight">Tools Used</h3>' +
            '</div>' +
            '<div class="flex flex-wrap gap-2">' + toolsHtml + '</div>' +
          '</div>' +
        '</section>';
    }

    reasoningPanel.innerHTML = html;
  }

  function resetReasoningPanel() {
    reasoningPanel.innerHTML =
      '<div class="flex items-center justify-center h-full text-on-surface-variant/40 text-sm">' +
        '<p>Send a message to see agent reasoning</p>' +
      '</div>';
    agentProgress.style.width = '0%';
  }
}
