'use client';

import React, { useMemo } from 'react';
import { ListOrdered } from 'lucide-react';
import { slugifyHeading, containsMarkdown, createSlugger } from './ArticleContentRenderer';

interface TableOfContentsProps {
  content: string[] | string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadingsFromHtml(html: string): TocItem[] {
  const items: TocItem[] = [];
  const regex = /<(h[23])\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  const getSlug = createSlugger();

  while ((m = regex.exec(html)) !== null) {
    const tag = m[1].toLowerCase();
    const attrs = m[2];
    const inner = m[3];
    const text = inner.replace(/<[^>]+>/g, '').trim();
    if (!text) continue;

    const idMatch = attrs.match(/\bid=['"]([^'"]*)['"]/i);
    const id = idMatch ? idMatch[1] : getSlug(text);
    const level = tag === 'h2' ? 2 : 3;

    items.push({ id, text, level });
  }

  return items;
}

function extractHeadingsFromMarkdown(text: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = text.split('\n');
  const getSlug = createSlugger();

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      const heading = trimmed.replace(/^##\s+/, '').trim();
      if (heading) {
        items.push({ id: getSlug(heading), text: heading, level: 2 });
      }
    } else if (trimmed.startsWith('### ')) {
      const heading = trimmed.replace(/^###\s+/, '').trim();
      if (heading) {
        items.push({ id: getSlug(heading), text: heading, level: 3 });
      }
    }
  }

  return items;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const items: TocItem[] = useMemo(() => {
    if (!content) return [];

    if (Array.isArray(content)) {
      return extractHeadingsFromMarkdown(content.join('\n\n'));
    }

    const rawString = String(content);
    if (containsMarkdown(rawString)) {
      return extractHeadingsFromMarkdown(rawString);
    }

    return extractHeadingsFromHtml(rawString);
  }, [content]);

  if (items.length < 2) return null;

  return (
    <nav className="p-5 rounded-2xl bg-white  border border-slate-200  shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2 text-cyan-500  font-bold text-xs uppercase tracking-wider mb-3">
        <ListOrdered className="w-4 h-4" />
        <span>Table of Contents</span>
      </div>
      <ul className="space-y-2 text-xs sm:text-sm">
        {items.map((item, idx) => (
          <li key={idx} className={item.level === 3 ? 'pl-3.5' : ''}>
            <a
              href={`#${item.id}`}
              className="text-slate-600  hover:text-cyan-500  transition-colors block py-0.5 line-clamp-1"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TableOfContents;
