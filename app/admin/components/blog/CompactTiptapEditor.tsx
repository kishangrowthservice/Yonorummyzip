'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import { useEffect, useRef } from 'react';
import { Bold, Italic, List, Link as LinkIcon, X } from 'lucide-react';

interface CompactTiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

/**
 * Normalizes legacy markdown into semantic HTML for TipTap if content isn't HTML yet.
 */
function normalizeInitialContent(str: string): string {
  if (!str) return '';
  // If already contains HTML block/inline tags, return untouched
  if (/<(?:p|ul|ol|li|strong|em|a|br|span)\b/i.test(str)) {
    return str;
  }
  // Otherwise normalize legacy markdown to semantic HTML for TipTap
  const formatted = str
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[bonus:\s*([^\]]+)\]/gi, '<strong>$1</strong>');

  const lines = formatted.split('\n');
  const blocks: string[] = [];
  let inUl = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inUl) {
        blocks.push('<ul>');
        inUl = true;
      }
      blocks.push(`<li>${line.slice(2).trim()}</li>`);
    } else {
      if (inUl) {
        blocks.push('</ul>');
        inUl = false;
      }
      blocks.push(`<p>${line}</p>`);
    }
  }
  if (inUl) blocks.push('</ul>');

  return blocks.length > 0 ? blocks.join('') : str;
}

/**
 * CompactTiptapEditor — A lightweight WYSIWYG editor for short descriptions,
 * excerpts, and highlights. Supports bold, italic, bullet lists, and links.
 * Outputs clean semantic HTML. Replaces the old manual markdown toolbar.
 */
export function CompactTiptapEditor({
  content,
  onChange,
  placeholder = 'Write a short description...',
  minHeight = '100px',
  disabled = false,
}: CompactTiptapEditorProps) {
  const initialHtml = normalizeInitialContent(content);
  const lastEmittedHtml = useRef<string>(initialHtml || '');

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        link: false,
        heading: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        blockquote: false,
        strike: false,
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-cyan-600 underline underline-offset-2 font-semibold hover:text-cyan-500',
        },
      }),
    ],
    content: initialHtml || '',
    editorProps: {
      attributes: {
        class: `compact-editor-surface focus:outline-none text-slate-900 text-sm leading-relaxed bg-transparent w-full`,
        style: `min-height: ${minHeight}; padding: 0.75rem;`,
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Treat empty paragraph as empty string
      const isEmpty = html === '<p></p>' || html === '' || !html;
      const final = isEmpty ? '' : html;
      lastEmittedHtml.current = final;
      onChange(final);
    },
  });

  // Sync external content changes (e.g., app switch or AI fill)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const normalizedCurrent = current === '<p></p>' ? '' : current;
    const incomingNormalized = normalizeInitialContent(content);
    if (incomingNormalized !== normalizedCurrent && incomingNormalized !== lastEmittedHtml.current) {
      editor.commands.setContent(incomingNormalized || '', { emitUpdate: false });
      lastEmittedHtml.current = incomingNormalized || '';
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) {
    return (
      <div
        className="rounded-2xl border border-slate-200 bg-white animate-pulse"
        style={{ minHeight }}
      />
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL (e.g. / or https://...):', previousUrl || '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const clearContent = () => {
    editor.commands.clearContent(true);
    onChange('');
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all ${
        disabled
          ? 'border-slate-200 bg-slate-50 opacity-60'
          : 'border-slate-300 bg-white focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100'
      }`}
    >
      {/* Mini Toolbar */}
      {!disabled && (
        <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer border-0 outline-none ${
              editor.isActive('bold')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer border-0 outline-none ${
              editor.isActive('italic')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-300 mx-0.5" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer border-0 outline-none ${
              editor.isActive('bulletList')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={setLink}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer border-0 outline-none ${
              editor.isActive('link')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
            title="Insert Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          <span className="flex-1" />

          <button
            type="button"
            onClick={clearContent}
            className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer border-0 outline-none"
            title="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor Surface */}
      <EditorContent editor={editor} />
    </div>
  );
}
