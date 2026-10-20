export type TargetSiteDomain = 'yonorummyzip.com' | string;

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[] | string; // Section paragraphs, markdown, or HTML
  cover_image: string | null;
  author: string;
  category: string;
  status: 'draft' | 'published';
  ai_generated?: boolean;
  source?: 'manual' | 'ai' | 'ai-edited';
  target_site?: TargetSiteDomain; // Target site/domain identifier
  seo_title: string;
  seo_description: string;
  tags: string[];
  reading_time_minutes?: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerationRequest {
  siteName?: string;
  domain?: string;
  target_site?: string;
  topic: string;
  focusKeyword: string;
  secondaryKeywords?: string | string[];
  category?: string;
  wordCount?: number;
  apiKey?: string;
  provider?: 'groq' | 'gemini';
  model?: string;
}

export interface GeneratedBlogResponse {
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  category: string;
  content: string[];
  htmlContent?: string;
  tags: string[];
  coverImage: string;
  author: string;
  modelUsed: string;
}

export interface GenerationLog {
  id: string;
  topic: string;
  focus_keyword: string;
  provider: string;
  model: string;
  latency_ms: number;
  word_count: number;
  status: 'success' | 'failed';
  error_message?: string;
  created_at: string;
}
