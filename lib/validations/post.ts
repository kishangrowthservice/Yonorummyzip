import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  content: z.string().min(1, 'Content is required'),
  meta_description: z.string().max(350, 'Meta description is too long').optional(),
  cover_image_url: z.string().optional(),
  author: z.string().min(1, 'Author is required'),
  category: z.string().optional(),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'published']),
  source: z.enum(['manual', 'ai', 'ai-edited']),
  reading_time_minutes: z.number().optional(),
  target_site: z.string().optional(),
});

export type PostInput = z.infer<typeof postSchema>;

export interface PostRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description?: string;
  cover_image_url?: string;
  cover_image?: string;
  excerpt?: string;
  author: string;
  category?: string;
  tags: string[];
  status: 'draft' | 'published';
  source: 'manual' | 'ai' | 'ai-edited';
  reading_time_minutes?: number;
  target_site?: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PostSummary = Omit<PostRecord, 'content'>;

