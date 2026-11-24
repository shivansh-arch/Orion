import { Marked } from 'marked';
import DOMPurify from 'dompurify';

const marked = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    code({ text, lang }) {
      const label = escapeHtml(lang || 'code');
      return `<div class="code-block rounded-xl overflow-hidden border border-white/10 bg-black/40 font-code text-sm my-4">
      <div class="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <span class="text-on-surface-variant text-xs">${label}</span>
        <button type="button" class="copy-code-btn material-symbols-outlined text-sm text-on-surface-variant hover:text-white cursor-pointer">content_copy</button>
      </div>
      <pre class="p-4 text-secondary/80 overflow-x-auto"><code>${escapeHtml(text)}</code></pre>
    </div>`;
    },
    // Show raw HTML written by the model as text instead of rendering it.
    html({ text }) {
      return escapeHtml(text);
    },
  },
});

DOMPurify.addHook('afterSanitizeAttributes', node => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

export function renderMarkdown(text) {
  if (!text) return '';
  return DOMPurify.sanitize(marked.parse(text));
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(text).replace(/[&<>"']/g, c => map[c]);
}
