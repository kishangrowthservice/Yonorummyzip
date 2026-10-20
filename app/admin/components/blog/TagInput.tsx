'use client';

import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  tags = [],
  onChange,
  placeholder = 'Add tags (press Enter)...',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (rawTag: string) => {
    const trimmed = rawTag.trim().replace(/^,+|,+$/g, '');
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-1.5">
      <div
        className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-white border border-slate-300 min-h-[46px] focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 shadow-xs transition-all"
        style={{ borderStyle: 'solid' }}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 border border-indigo-300 text-indigo-900"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-rose-600 transition-colors cursor-pointer rounded-full p-0.5 border-0 outline-none"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(inputValue)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none px-2 py-1"
        />
      </div>
      <p className="text-[11px] text-slate-600 font-medium">
        Separate tags with commas or press Enter.
      </p>
    </div>
  );
}
