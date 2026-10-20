'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
} from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const lastEmittedHtml = useRef<string>(content || '');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: false,
        heading: {
          levels: [2, 3],
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            'text-indigo-600 font-semibold underline decoration-indigo-300 underline-offset-4 hover:text-indigo-800 transition-colors cursor-pointer',
        },
      }),
      ImageExtension.configure({
        inline: true,
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full my-4 border border-slate-200 shadow-md',
        },
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class:
          'tiptap-editor-surface min-h-[280px] sm:min-h-[350px] p-3.5 sm:p-6 text-slate-900 focus:outline-none max-w-none text-sm sm:text-base leading-relaxed bg-white',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedHtml.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content !== current && content !== lastEmittedHtml.current) {
      editor.commands.setContent(content || '', { emitUpdate: false });
      lastEmittedHtml.current = content || '';
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white min-h-[350px] flex items-center justify-center text-slate-400 text-xs sm:text-sm shadow-xs">
        Loading editor...
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL (e.g. / or https://...):', previousUrl || '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div
      className="rounded-3xl border border-slate-300 bg-white overflow-hidden shadow-xs transition-all focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100"
      style={{ borderStyle: 'solid' }}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-100 border-b border-slate-300 text-slate-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border-0 outline-none ${
            editor.isActive('bold')
              ? 'bg-indigo-600 text-white font-bold shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-950'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border-0 outline-none ${
            editor.isActive('italic')
              ? 'bg-indigo-600 text-white font-bold shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-950'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border-0 outline-none ${
            editor.isActive('strike')
              ? 'bg-indigo-600 text-white font-bold shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-950'
          }`}
          title="Strike"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border-0 outline-none ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-indigo-600 text-white font-bold shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-950'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border-0 outline-none ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-indigo-600 text-white font-bold shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-950'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border-0 outline-none ${
            editor.isActive('bulletList')
              ? 'bg-indigo-600 text-white font-bold shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-950'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border-0 outline-none ${
            editor.isActive('orderedList')
              ? 'bg-indigo-600 text-white font-bold shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-950'
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border-0 outline-none ${
            editor.isActive('blockquote')
              ? 'bg-indigo-600 text-white font-bold shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-950'
          }`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border-0 outline-none ${
            editor.isActive('link')
              ? 'bg-indigo-600 text-white font-bold shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-950'
          }`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-colors cursor-pointer border-0 outline-none"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-colors cursor-pointer border-0 outline-none"
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-200 disabled:opacity-30 transition-colors cursor-pointer border-0 outline-none"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-200 disabled:opacity-30 transition-colors cursor-pointer border-0 outline-none"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
