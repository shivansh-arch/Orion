export function renderMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);

  // Code blocks (fenced)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const fileName = lang || 'code';
    return `<div class="rounded-xl overflow-hidden border border-white/10 bg-black/40 font-code text-sm my-4">
      <div class="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <span class="text-on-surface-variant text-xs">${fileName}</span>
        <button class="copy-code-btn material-symbols-outlined text-sm text-on-surface-variant hover:text-white cursor-pointer" onclick="navigator.clipboard.writeText(this.closest('.rounded-xl').querySelector('code').textContent)">content_copy</button>
      </div>
      <pre class="p-4 text-secondary/80 overflow-x-auto"><code>${code}</code></pre>
    </div>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Unordered lists
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Paragraphs - wrap remaining text blocks
  html = html.replace(/^(?!<[a-z])((?!<\/?(h[1-6]|ul|ol|li|pre|div|blockquote|table|thead|tbody|tr|th|td)[ >]).+)$/gm, '<p>$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');

  return html;
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
  return text.replace(/[&<>]/g, c => map[c]);
}
