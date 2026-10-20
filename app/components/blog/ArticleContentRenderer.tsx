'use client';

import React, { useMemo } from 'react';
import YonoCtaBox from './YonoCtaBox';

interface ArticleContentRendererProps {
  content: string[] | string;
  className?: string;
  showMidCta?: boolean;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z0-9#]+;/gi, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Creates an instance-bound slug generator that guarantees unique anchor IDs
 * in source DOM order for duplicate headings.
 */
export function createSlugger() {
  const seen = new Map<string, number>();
  return (text: string): string => {
    const base = slugifyHeading(text) || 'section';
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    if (count === 0) return base;
    return `${base}-${count + 1}`;
  };
}

/**
 * Checks if content contains markdown formatting structures
 */
export function containsMarkdown(str: string): boolean {
  if (!str) return false;
  if (/(?:^|\n)#{1,6}\s+/.test(str)) return true;
  if (/\|(?:\s*:?-+:?\s*\|)+/.test(str)) return true;
  if (/(?:^|\n)>\s+/.test(str)) return true;
  if (/(?:^|\n)(?:[-*+•]|\d+\.)\s+/.test(str) && !/<\/?(?:ul|ol|li)\b/i.test(str)) return true;
  return false;
}

/**
 * Formats inline markdown (bold, italic, links, code) within text
 */
function formatInlineMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/**
 * Converts legacy markdown table syntax to semantic HTML table.
 */
function markdownTableToHtml(tableBlock: string): string {
  const lines = tableBlock.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return tableBlock;

  const parseRow = (rowStr: string) =>
    rowStr
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((cell) => cell.trim());

  const headers = parseRow(lines[0]);
  const rows = lines.slice(lines[1]?.includes('---') ? 2 : 1).map(parseRow);

  const thead = `<thead><tr class="bg-slate-50 border-b border-slate-200">${headers
    .map(
      (h) =>
        `<th class="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">${formatInlineMarkdown(h)}</th>`
    )
    .join('')}</tr></thead>`;

  const tbody = `<tbody>${rows
    .map(
      (r) =>
        `<tr class="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">${r
          .map(
            (c, i) =>
              `<td class="px-4 py-3 ${
                i === 0 ? 'font-bold text-slate-900' : 'text-slate-600'
              }">${formatInlineMarkdown(c)}</td>`
          )
          .join('')}</tr>`
    )
    .join('')}</tbody>`;

  return `<table class="w-full text-left text-xs text-slate-800 border-collapse">${thead}${tbody}</table>`;
}

/**
 * Normalizes legacy markdown string/array into rich semantic HTML.
 */
function markdownToSemanticHtml(rawContent: string[] | string): string {
  const text = Array.isArray(rawContent) ? rawContent.join('\n\n') : String(rawContent || '');
  if (!text) return '';

  const blocks = text.split(/\n\n+/).filter(Boolean);
  const htmlBlocks: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Table
    if (trimmed.startsWith('|') && /\|(?:\s*:?-+:?\s*\|)+/.test(trimmed)) {
      htmlBlocks.push(markdownTableToHtml(trimmed));
      continue;
    }

    // Heading 2
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      const heading = trimmed.replace(/^##\s+/, '').trim();
      htmlBlocks.push(`<h2>${heading}</h2>`);
      continue;
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      const heading = trimmed.replace(/^###\s+/, '').trim();
      htmlBlocks.push(`<h3>${heading}</h3>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      const quote = trimmed.replace(/^>\s*/, '').trim();
      htmlBlocks.push(`<blockquote><p>${formatInlineMarkdown(quote)}</p></blockquote>`);
      continue;
    }

    // Unordered List
    if (/^[-*+•]\s+/.test(trimmed)) {
      const items = trimmed
        .split('\n')
        .filter(Boolean)
        .map((line) => line.replace(/^[-*+•]\s+/, '').trim());
      htmlBlocks.push(`<ul>${items.map((i) => `<li>${formatInlineMarkdown(i)}</li>`).join('')}</ul>`);
      continue;
    }

    // Ordered List
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = trimmed
        .split('\n')
        .filter(Boolean)
        .map((line) => line.replace(/^\d+\.\s+/, '').trim());
      htmlBlocks.push(`<ol>${items.map((i) => `<li>${formatInlineMarkdown(i)}</li>`).join('')}</ol>`);
      continue;
    }

    // Paragraph (convert inline markdown and format internal newlines as <br />)
    const formattedParagraph = formatInlineMarkdown(trimmed).replace(/\n/g, '<br />');
    htmlBlocks.push(`<p>${formattedParagraph}</p>`);
  }

  return htmlBlocks.join('\n');
}

/**
 * Strips script tags, javascript: hrefs, and inline event handlers to prevent XSS.
 */
function sanitizeDangerousHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/href\s*=\s*['"]javascript:[^'"]*['"]/gi, 'href="#"');
}

/**
 * Injects heading IDs into HTML and wraps tables in responsive containers.
 */
function processHtmlContent(rawHtml: string): string {
  if (!rawHtml) return '';

  let processed = sanitizeDangerousHtml(rawHtml);
  const getSlug = createSlugger();

  // 1. Ensure all <h2> and <h3> have clean unique anchor IDs in source DOM order
  processed = processed.replace(
    /<(h[23])(\b[^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, innerText) => {
      const plainText = innerText.replace(/<[^>]+>/g, '').trim();
      const existingId = attrs.match(/\bid=['"]([^'"]*)['"]/i);
      const targetId = existingId ? existingId[1] : getSlug(plainText);
      const cleanAttrs = attrs.replace(/\bid=['"][^'"]*['"]/gi, '').trim();
      return `<${tag} id="${targetId}" ${cleanAttrs} class="scroll-mt-24">${innerText}</${tag}>`;
    }
  );

  // 2. Wrap standalone <table> elements in responsive wrapper (prevent double-wrapping)
  processed = processed.replace(
    /<table\b[\s\S]*?<\/table>/gi,
    (tableMatch) => {
      return `<div class="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div class="overflow-x-auto">${tableMatch}</div></div>`;
    }
  );
  // Clean up any double-wrapping if the source already had an overflow container
  processed = processed.replace(
    /<div class="overflow-x-auto">\s*<div class="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">\s*<div class="overflow-x-auto">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi,
    '<div class="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div class="overflow-x-auto">$1</div></div>'
  );

  // 3. Ensure images have responsive styling
  processed = processed.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    if (/class=['"][^'"]*['"]/i.test(attrs)) {
      return match.replace(
        /class=['"]([^'"]*)['"]/i,
        'class="$1 rounded-2xl max-w-full h-auto my-6 border border-slate-200 shadow-md block mx-auto"'
      );
    }
    return `<img ${attrs} class="rounded-2xl max-w-full h-auto my-6 border border-slate-200 shadow-md block mx-auto" loading="lazy" />`;
  });

  return processed;
}

export default function ArticleContentRenderer({
  content,
  className = '',
  showMidCta = true,
}: ArticleContentRendererProps) {
  // 1. Determine HTML representation
  const finalHtml = useMemo(() => {
    // Array format is always legacy markdown
    if (Array.isArray(content)) {
      const converted = markdownToSemanticHtml(content);
      return processHtmlContent(converted);
    }

    const rawString = String(content || '');
    if (!rawString) return '';

    // If it contains markdown headings, tables or lists, parse markdown first
    if (containsMarkdown(rawString)) {
      const converted = markdownToSemanticHtml(rawString);
      return processHtmlContent(converted);
    }

    // Otherwise treat as HTML from TipTap WYSIWYG
    return processHtmlContent(rawString);
  }, [content]);

  // 2. Safely inject mid-article CTA at paragraph boundary without breaking HTML tree
  const { firstHalf, secondHalf, hasMidCta } = useMemo(() => {
    if (!showMidCta || !finalHtml) {
      return { firstHalf: finalHtml, secondHalf: '', hasMidCta: false };
    }

    // Find all closing paragraph tags </p>
    const pIndices: number[] = [];
    const pRegex = /<\/p>/gi;
    let match: RegExpExecArray | null;
    while ((match = pRegex.exec(finalHtml)) !== null) {
      pIndices.push(match.index + match[0].length);
    }

    // Only inject mid-CTA if there are at least 4 paragraphs
    if (pIndices.length < 4) {
      return { firstHalf: finalHtml, secondHalf: '', hasMidCta: false };
    }

    // Split at middle paragraph boundary
    const splitPoint = pIndices[Math.floor(pIndices.length / 2) - 1];
    const firstHalfHtml = finalHtml.slice(0, splitPoint);
    const secondHalfHtml = finalHtml.slice(splitPoint);

    return {
      firstHalf: firstHalfHtml,
      secondHalf: secondHalfHtml,
      hasMidCta: Boolean(secondHalfHtml),
    };
  }, [finalHtml, showMidCta]);

  return (
    <div className={`article-content max-w-none text-slate-700 leading-relaxed ${className}`}>
      <div dangerouslySetInnerHTML={{ __html: firstHalf }} />

      {hasMidCta && (
        <>
          <YonoCtaBox className="my-8" />
          <div dangerouslySetInnerHTML={{ __html: secondHalf }} />
        </>
      )}
    </div>
  );
}

