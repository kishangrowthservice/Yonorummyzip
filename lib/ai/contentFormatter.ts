/**
 * Content Formatter
 *
 * Converts between raw text, markdown blocks, and semantic HTML for Tiptap
 * and frontend ArticleContentRenderer.
 */

export function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/[\r\n]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function normalizeContentToHtml(content: string | string[]): string {
  const text = Array.isArray(content) ? content.join('\n\n') : String(content || '');
  if (!text) return '';

  // If already full HTML, clean and return
  if (/^<[a-z][\s\S]*>$/i.test(text.trim())) {
    return cleanHtml(text);
  }

  // Split lines / blocks
  const lines = text.split('\n');
  const result: string[] = [];

  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let inBlockquote = false;
  let blockquoteBuffer: string[] = [];

  const flushList = () => {
    if (inList && listType) {
      result.push(`</${listType}>`);
      inList = false;
      listType = null;
    }
  };

  const flushBlockquote = () => {
    if (inBlockquote) {
      result.push(`<blockquote><p>${blockquoteBuffer.join(' ')}</p></blockquote>`);
      inBlockquote = false;
      blockquoteBuffer = [];
    }
  };

  const flushAll = () => {
    flushList();
    flushBlockquote();
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushAll();
      continue;
    }

    // Heading ## or ###
    const h2Match = trimmed.match(/^##\s+(.*)$/);
    if (h2Match) {
      flushAll();
      result.push(`<h2>${h2Match[1]}</h2>`);
      continue;
    }

    const h3Match = trimmed.match(/^###\s+(.*)$/);
    if (h3Match) {
      flushAll();
      result.push(`<h3>${h3Match[1]}</h3>`);
      continue;
    }

    // Markdown blockquote line: > quote
    const bqMatch = trimmed.match(/^>\s*(.*)$/);
    if (bqMatch) {
      flushList();
      inBlockquote = true;
      if (bqMatch[1]) blockquoteBuffer.push(bqMatch[1]);
      continue;
    } else {
      flushBlockquote();
    }

    // Markdown bullet list line: - item, * item, + item
    const ulMatch = trimmed.match(/^[-*+•]\s+(.*)$/);
    if (ulMatch) {
      if (listType === 'ol') flushList();
      if (!inList) {
        result.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      result.push(`<li>${ulMatch[1]}</li>`);
      continue;
    }

    // Markdown ordered list line: 1. item
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (listType === 'ul') flushList();
      if (!inList) {
        result.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      result.push(`<li>${olMatch[1]}</li>`);
      continue;
    }

    flushList();

    const isHtmlBlock =
      /^<\/?(?:h[1-6]|p|ul|ol|li|blockquote|div|hr|pre|table|thead|tbody|tr|th|td|section|article)\b/i.test(
        trimmed
      ) ||
      /<\/(?:h[1-6]|p|ul|ol|li|blockquote|div|pre|table|section|article)>$/i.test(trimmed);

    if (isHtmlBlock) {
      result.push(trimmed);
    } else {
      result.push(`<p>${trimmed}</p>`);
    }
  }

  flushAll();
  return cleanHtml(result.join('\n'));
}

export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”');
}

export function hasHtmlTags(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /<\/?(?:p|h[1-6]|ul|ol|li|blockquote|table|thead|tbody|tr|th|td|strong|b|em|i|code|a|div|span|br|hr)\b/i.test(str);
}

export function htmlToMarkdown(html: string): string[] {
  if (!html || typeof html !== 'string') return [];

  // Convert links
  let text = html.replace(/<a\b[^>]*href=['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => {
    return `[${label.replace(/<[^>]+>/g, '').trim()}](${href.trim()})`;
  });

  // Convert bold
  text = text.replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, (_, inner) => {
    return `**${inner.replace(/<[^>]+>/g, '').trim()}**`;
  });

  // Convert italic
  text = text.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, (_, inner) => {
    return `*${inner.replace(/<[^>]+>/g, '').trim()}*`;
  });

  // Convert inline code
  text = text.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, inner) => {
    return `\`${inner.replace(/<[^>]+>/g, '').trim()}\``;
  });

  // Convert tables
  text = text.replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rows: string[][] = [];
    const trMatches = tableContent.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];
    for (const tr of trMatches) {
      const cells: string[] = [];
      const cellMatches = tr.match(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi) || [];
      for (const cell of cellMatches) {
        const cleanCell = cell
          .replace(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/i, '$1')
          .replace(/<[^>]+>/g, '')
          .trim();
        cells.push(cleanCell);
      }
      if (cells.length > 0) rows.push(cells);
    }

    if (rows.length === 0) return '';
    const colCount = Math.max(...rows.map((r) => r.length));
    const headerRow = rows[0].concat(Array(colCount - rows[0].length).fill(''));
    const dividerRow = Array(colCount).fill('---');
    const dataRows = rows.slice(1).map((r) => r.concat(Array(colCount - r.length).fill('')));

    const mdTable = [
      `| ${headerRow.join(' | ')} |`,
      `| ${dividerRow.join(' | ')} |`,
      ...dataRows.map((r) => `| ${r.join(' | ')} |`),
    ].join('\n');

    return `\n\n${mdTable}\n\n`;
  });

  // Convert Q&A pairs
  text = text.replace(/<h3\b[^>]*>([\s\S]*?\?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_, q, a) => {
    const cleanQ = q.replace(/<[^>]+>/g, '').replace(/^Q:\s*/i, '').trim();
    const cleanA = a.replace(/<[^>]+>/g, '').replace(/^A:\s*/i, '').trim();
    return `\n\n**Q: ${cleanQ}**\n**A:** ${cleanA}\n\n`;
  });

  // Headings
  text = text.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, (_, inner) => {
    return `\n\n## ${inner.replace(/<[^>]+>/g, '').trim()}\n\n`;
  });

  text = text.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, (_, inner) => {
    return `\n\n### ${inner.replace(/<[^>]+>/g, '').trim()}\n\n`;
  });

  // Blockquotes
  text = text.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) => {
    let cleanQuote = inner
      .replace(/<p\b[^>]*>/gi, '')
      .replace(/<\/p>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
    cleanQuote = cleanQuote.replace(/^(?:\*\*Yono Pro Tip:\*\*|Yono Pro Tip:)\s*/i, '');
    return `\n\n> **Yono Pro Tip:** ${cleanQuote}\n\n`;
  });

  // Lists
  text = text.replace(/<ul\b[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => {
    const liMatches = inner.match(/<li\b[^>]*>([\s\S]*?)<\/li>/gi) || [];
    const items = liMatches.map((li: string) => {
      const cleanLi = li.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/i, '$1').replace(/<[^>]+>/g, '').trim();
      return `- ${cleanLi}`;
    });
    return `\n\n${items.join('\n')}\n\n`;
  });

  text = text.replace(/<ol\b[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
    const liMatches = inner.match(/<li\b[^>]*>([\s\S]*?)<\/li>/gi) || [];
    const items = liMatches.map((li: string, idx: number) => {
      const cleanLi = li.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/i, '$1').replace(/<[^>]+>/g, '').trim();
      return `${idx + 1}. ${cleanLi}`;
    });
    return `\n\n${items.join('\n')}\n\n`;
  });

  // Paragraphs
  text = text.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_, inner) => {
    const trimmed = inner.replace(/<[^>]+>/g, '').trim();
    return trimmed ? `\n\n${trimmed}\n\n` : '';
  });

  text = text.replace(/<[^>]+>/g, '');
  text = decodeHtmlEntities(text);

  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
