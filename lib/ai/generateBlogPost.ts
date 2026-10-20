import 'server-only';
import { generateBlogPost as generatePostPrimary } from './aiBlogGenerator';
import { sanitizeBrandAndDomain, sanitizeBrandArray } from './sanitizeBlogOutput';

export interface GenerateBlogPostInput {
  topic: string;
  tone?: string;
  keywords?: string[];
  wordCount?: number;
  audience?: string;
  category?: string;
  model?: string;
}

export interface GenerateBlogPostOutput {
  title: string;
  slug: string;
  metaDescription: string;
  content: string; // HTML, ready to load directly into Tiptap
  suggestedTags: string[];
}

export async function generateBlogPost(
  input: GenerateBlogPostInput
): Promise<GenerateBlogPostOutput> {
  const isGemini = input.model?.toLowerCase().includes('gemini');
  const result = await generatePostPrimary({
    topic: input.topic,
    focusKeyword: input.keywords?.[0] || input.topic,
    secondaryKeywords: input.keywords?.slice(1) || [],
    wordCount: input.wordCount || 1200,
    category: input.category || 'Yono Games Guides',
    model: input.model,
    provider: isGemini ? 'gemini' : 'groq',
  });

  const rawHtmlContent =
    result.htmlContent ||
    (Array.isArray(result.content) ? result.content.join('\n\n') : String(result.content || ''));

  return {
    title: sanitizeBrandAndDomain(result.title),
    slug: sanitizeBrandAndDomain(result.slug),
    metaDescription: sanitizeBrandAndDomain(result.seoDescription || result.excerpt || ''),
    content: sanitizeBrandAndDomain(rawHtmlContent),
    suggestedTags: sanitizeBrandArray(result.tags || []),
  };
}
