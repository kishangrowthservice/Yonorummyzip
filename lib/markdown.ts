/**
 * Lightweight, safe parser for App Descriptions
 * Handles rich HTML (from TipTap WYSIWYG) and legacy Markdown (**bold**, *italic*, bullet lists).
 */

export function isHtmlContent(text: string): boolean {
  return /<(p|ul|ol|li|strong|em|b|i|a|br|span|div|h[1-6])(\s[^>]*)?>/i.test(text);
}

export function formatMarkdown(text?: string | null): string {
  if (!text) return '';

  // If already formatted HTML from TipTap WYSIWYG, return safely without escaping tags
  if (isHtmlContent(text)) {
    // Strip any unexpected script tags for safety
    return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  // Legacy Markdown processing:
  // 1. Sanitize raw HTML tags to prevent XSS
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Bold: **text**
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong style="color: #ffffff; font-weight: 700;">$1</strong>'
  );

  // 3. Italic: *text*
  html = html.replace(/\*(.*?)\*/g, '<em style="color: #e2e8f0;">$1</em>');

  // 4. Bonus/Gift Tag: [bonus: ₹51] or 🎁 ...
  html = html.replace(
    /\[bonus:\s*([^\]]+)\]/gi,
    '<span class="badge bg-warning text-dark px-2 py-1 mx-1 fw-bold">$1</span>'
  );

  // 5. Line-by-line processing for lists and paragraphs
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    // Check for bullet list item (- item or * item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        processedLines.push(
          '<ul style="list-style: none; padding-left: 0; margin: 14px 0;">'
        );
        inList = true;
      }
      const itemContent = trimmed.substring(2);
      processedLines.push(
        `<li style="display: flex; align-items: flex-start; margin-bottom: 8px;">
          <i class="fas fa-check-circle text-info" style="margin-top: 5px; margin-right: 9px; font-size: 13px; flex-shrink: 0;"></i>
          <span>${itemContent}</span>
        </li>`
      );
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (trimmed.length > 0) {
        processedLines.push(
          `<p style="margin-bottom: 12px; line-height: 1.75;">${trimmed}</p>`
        );
      }
    }
  }

  if (inList) {
    processedLines.push('</ul>');
  }

  return processedLines.join('\n');
}

/**
 * Strips all markdown syntax and HTML tags so the description can be cleanly displayed on
 * compact listing cards and SEO meta tags without raw symbols or markup.
 */
export function stripMarkdown(text?: string | null): string {
  if (!text) return '';

  let clean = text
    // Strip HTML tags
    .replace(/<[^>]*>/g, ' ')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Strip markdown formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[bonus:\s*([^\]]+)\]/gi, '$1')
    .replace(/^[-*]\s+/gm, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();

  return clean;
}
