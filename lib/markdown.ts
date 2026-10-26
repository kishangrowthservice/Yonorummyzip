/**
 * Comprehensive, safe parser for App Descriptions
 * Handles rich HTML (from TipTap WYSIWYG) and Markdown (headings, bold, lists, tables, callouts, links).
 */

export function isHtmlContent(text: string): boolean {
  return /<(p|ul|ol|li|strong|em|b|i|a|br|span|div|h[1-6])(\s[^>]*)?>/i.test(text);
}

function formatInline(str: string, isInsideButton = false): string {
  if (!str) return '';
  return str
    // 1. Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, txt, url) => {
      const isDownloadBtn =
        txt.toLowerCase().includes('download') ||
        txt.toLowerCase().includes('here') ||
        txt.toLowerCase().includes('apk');
      const cleanTxt = txt.replace(/\*\*(.*?)\*\*/g, '$1');
      if (isDownloadBtn) {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2.5 my-2 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20 active:scale-95 transition-all text-decoration-none"><i class="fas fa-download"></i> <span>${cleanTxt}</span></a>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 font-semibold transition-colors">${formatInline(txt)}</a>`;
    })
    // 2. Bold: **text** - Dark slate for light theme readability
    .replace(
      /\*\*(.*?)\*\*/g,
      isInsideButton
        ? '<strong class="font-bold text-white">$1</strong>'
        : '<strong class="font-bold text-slate-900">$1</strong>'
    )
    // 3. Italic: *text*
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>')
    // 4. Bonus/Gift Tag: [bonus: ₹51] or 🎁 ...
    .replace(
      /\[bonus:\s*([^\]]+)\]/gi,
      '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">$1</span>'
    );
}

export function formatMarkdown(text?: string | null): string {
  if (!text) return '';

  // If already formatted HTML from TipTap WYSIWYG, return safely without script tags
  if (isHtmlContent(text)) {
    return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  const lines = text.split(/\r?\n/);
  const out: string[] = [];

  let inUl = false;
  let inOl = false;
  let inTable = false;
  let tableRows: string[] = [];

  function closeLists() {
    if (inUl) {
      out.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      out.push('</ol>');
      inOl = false;
    }
  }

  function flushTable() {
    if (!inTable) return;
    if (tableRows.length > 0) {
      let tableHtml =
        '<div class="overflow-x-auto my-5 rounded-2xl border border-slate-200 shadow-sm"><table class="w-full text-left text-xs sm:text-sm text-slate-700 divide-y divide-slate-200">';
      tableRows.forEach((row, idx) => {
        const cells = row
          .split('|')
          .map((c) => c.trim())
          .filter((_c, i, arr) => i > 0 && i < arr.length - 1);
        if (idx === 0) {
          tableHtml +=
            '<thead class="bg-slate-50 text-slate-900 font-extrabold uppercase text-[11px] tracking-wider"><tr>';
          cells.forEach((c) => {
            tableHtml += `<th class="px-4 py-3">${formatInline(c)}</th>`;
          });
          tableHtml += '</tr></thead><tbody class="divide-y divide-slate-100 bg-white">';
        } else if (row.includes('---')) {
          // delimiter row, skip
        } else {
          const bg = idx % 2 === 0 ? 'bg-slate-50/40' : 'bg-white';
          tableHtml += `<tr class="${bg} hover:bg-slate-50 transition-colors">`;
          cells.forEach((c) => {
            tableHtml += `<td class="px-4 py-3">${formatInline(c)}</td>`;
          });
          tableHtml += '</tr>';
        }
      });
      tableHtml += '</tbody></table></div>';
      out.push(tableHtml);
    }
    inTable = false;
    tableRows = [];
  }

  let isFirstH1 = true;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Empty line
    if (!trimmed) {
      closeLists();
      flushTable();
      continue;
    }

    // Horizontal Rule: --- or ***
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
      closeLists();
      flushTable();
      out.push('<hr class="my-6 border-slate-200" />');
      continue;
    }

    // Markdown Table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      closeLists();
      inTable = true;
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Blockquote or Callout: > Note...
    if (trimmed.startsWith('>')) {
      closeLists();
      flushTable();
      const content = trimmed.replace(/^>\s*/, '');
      const isWarn =
        content.toLowerCase().includes('note') ||
        content.toLowerCase().includes('disclaimer') ||
        content.includes('⚠️');
      const bg = isWarn
        ? 'bg-amber-50/80 border-amber-200/90 text-amber-900'
        : 'bg-slate-50 border-slate-200 text-slate-700';
      const icon = isWarn ? '⚠️' : '💡';
      out.push(`
        <div class="my-4 p-3.5 sm:p-4 rounded-2xl border ${bg} text-xs sm:text-sm leading-relaxed flex items-start gap-3">
          <span class="text-base flex-shrink-0 mt-0.5">${icon}</span>
          <div class="space-y-1">${formatInline(content)}</div>
        </div>
      `);
      continue;
    }

    // Top Level H1 (# Title)
    if (trimmed.startsWith('# ')) {
      closeLists();
      flushTable();
      const heading = formatInline(trimmed.replace(/^#\s+/, ''));
      if (isFirstH1) {
        isFirstH1 = false;
        out.push(`
          <div class="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Verified Guide
            </span>
            <span class="text-xs text-slate-400">Updated for 2026</span>
          </div>
          <p class="text-sm font-semibold text-slate-800 mb-3">${heading}</p>
        `);
      } else {
        out.push(`
          <div class="mt-6 mb-3 pb-2 border-b border-slate-100">
            <h3 class="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">${heading}</h3>
          </div>
        `);
      }
      continue;
    }

    if (trimmed.startsWith('## ')) {
      closeLists();
      flushTable();
      const heading = formatInline(trimmed.replace(/^##\s+/, ''));
      out.push(`
        <div class="mt-7 mb-3 pt-3 border-t border-slate-100 first:border-0 first:pt-0">
          <h3 class="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <span class="w-1.5 h-4 sm:h-5 rounded-full bg-emerald-500 inline-block flex-shrink-0"></span>
            <span>${heading}</span>
          </h3>
        </div>
      `);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      closeLists();
      flushTable();
      const heading = formatInline(trimmed.replace(/^###\s+/, ''));
      out.push(`
        <div class="mt-5 mb-2">
          <h4 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
            <span class="text-emerald-500 text-xs">●</span>
            <span>${heading}</span>
          </h4>
        </div>
      `);
      continue;
    }

    // Numbered List: 1. Item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (inUl) {
        out.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        out.push(
          '<ol class="list-decimal pl-5 space-y-2.5 my-4 text-slate-700 text-xs sm:text-sm leading-relaxed">'
        );
        inOl = true;
      }
      out.push(`<li class="pl-1">${formatInline(olMatch[2])}</li>`);
      continue;
    }

    // Indented continuation of list item
    if ((inOl || inUl) && (rawLine.startsWith('   ') || rawLine.startsWith('\t'))) {
      out.push(`<div class="mt-1.5 ml-2">${formatInline(trimmed)}</div>`);
      continue;
    }

    // Bullet List: - Item or * Item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (inOl) {
        out.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        out.push(
          '<ul class="list-disc pl-5 space-y-2 my-4 text-slate-700 text-xs sm:text-sm leading-relaxed">'
        );
        inUl = true;
      }
      const itemContent = trimmed.substring(2);
      out.push(`<li class="pl-1">${formatInline(itemContent)}</li>`);
      continue;
    }

    // Regular Paragraph
    closeLists();
    flushTable();

    // Check if paragraph is a single prominent download CTA
    if (trimmed.startsWith('👉') && trimmed.includes('](')) {
      out.push(`<div class="my-4 text-center sm:text-left">${formatInline(trimmed)}</div>`);
    } else {
      out.push(
        `<p class="text-slate-600 leading-relaxed mb-3 text-xs sm:text-sm">${formatInline(
          trimmed
        )}</p>`
      );
    }
  }

  closeLists();
  flushTable();

  return out.join('\n');
}

/**
 * Strips all markdown syntax and HTML tags so the description can be cleanly displayed on
 * compact listing cards and SEO meta tags without raw symbols or markup.
 */
export function stripMarkdown(text?: string | null): string {
  if (!text) return '';

  return text
    // Strip HTML tags
    .replace(/<[^>]*>/g, ' ')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Strip markdown headings
    .replace(/^#{1,6}\s+/gm, '')
    // Strip markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Strip markdown formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[bonus:\s*([^\]]+)\]/gi, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s*/gm, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}
