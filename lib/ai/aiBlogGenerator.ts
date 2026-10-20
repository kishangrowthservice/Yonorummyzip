import type { GenerationRequest, GeneratedBlogResponse } from '@/lib/blog-types';
import { SITE_CONFIG } from '@/lib/blog-config';
import { generateBlogPostWithGroq } from './providers/groq';
import { normalizeContentToHtml, htmlToMarkdown } from './contentFormatter';
import { buildBlogPostPrompt } from './prompts/blogPost';
import { sanitizeAiErrorMessage, extractKeywordsList } from './safeError';
import { slugify, optimizeSeoSlug, selectRandomCoverImage } from './aiBlogGeneratorHelpers';
import { sanitizeBrandAndDomain, sanitizeBrandArray } from './sanitizeBlogOutput';

export {
  slugify,
  optimizeSeoSlug,
  selectRandomCoverImage,
  CURATED_COVER_IMAGES,
} from './aiBlogGeneratorHelpers';

export { AVAILABLE_MODELS, getValidModel, DEFAULT_MODEL_ID } from './models';
export type { AIModelOption } from './models';

export async function generateBlogPost(req: GenerationRequest): Promise<GeneratedBlogResponse> {
  const groqKey = req.apiKey?.startsWith('gsk_') ? req.apiKey : process.env.GROQ_API_KEY;
  const geminiKey =
    req.apiKey && !req.apiKey.startsWith('gsk_') ? req.apiKey : process.env.GEMINI_API_KEY;

  const isGeminiRequested = req.provider === 'gemini' || req.model?.toLowerCase().includes('gemini');

  if (isGeminiRequested && geminiKey) {
    try {
      return await generateWithGemini(req, geminiKey, req.model);
    } catch (geminiErr) {
      console.warn('[AI Generator] Gemini failed, falling back to Groq:', geminiErr);
      if (groqKey) {
        return await generateBlogPostWithGroq({ ...req, model: 'openai/gpt-oss-120b', provider: 'groq' });
      }
      throw geminiErr;
    }
  }

  if (groqKey) {
    try {
      return await generateBlogPostWithGroq(req);
    } catch (groqErr) {
      console.warn('[AI Generator] Groq failed, falling back to Gemini:', groqErr);
      if (geminiKey) {
        return await generateWithGemini(req, geminiKey, 'gemini-3.8-flash');
      }
      throw groqErr;
    }
  }

  if (geminiKey) {
    return await generateWithGemini(req, geminiKey, req.model || 'gemini-3.8-flash');
  }

  throw new Error('AI service configuration missing. Please configure GROQ_API_KEY or GEMINI_API_KEY in server environment.');
}

async function generateWithGemini(
  req: GenerationRequest,
  apiKey: string,
  preferredModel?: string
): Promise<GeneratedBlogResponse> {
  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  const model = preferredModel && preferredModel.includes('gemini') ? preferredModel : 'gemini-3.8-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;

  const keywords = extractKeywordsList(req.focusKeyword, req.secondaryKeywords);
  const prompt = buildBlogPostPrompt({
    topic: req.topic,
    keywords,
    wordCount: req.wordCount ?? 1200,
    category: req.category ?? 'Yono Games Guides',
    tone: 'Authoritative, Engaging & Conversational',
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const parsed = JSON.parse(rawText);

  const htmlContent = normalizeContentToHtml(parsed.content || '');
  const markdownParagraphs = htmlToMarkdown(htmlContent);
  const rawSlug = optimizeSeoSlug(parsed.title || req.topic, req.focusKeyword);
  const cleanHtml = sanitizeBrandAndDomain(htmlContent);
  const cleanMarkdown = markdownParagraphs.map(sanitizeBrandAndDomain);
  const cleanTitle = sanitizeBrandAndDomain(parsed.title || req.topic);
  const cleanSlug = sanitizeBrandAndDomain(rawSlug);
  const cleanDesc = sanitizeBrandAndDomain(parsed.metaDescription || '');

  return {
    title: cleanTitle,
    slug: cleanSlug,
    seoTitle: cleanTitle,
    seoDescription: cleanDesc,
    excerpt: cleanDesc,
    category: req.category || 'Yono Games Guides',
    content: cleanMarkdown,
    htmlContent: cleanHtml,
    tags: sanitizeBrandArray(parsed.suggestedTags || ['Yono Games', 'Rummy', 'Teen Patti']),
    coverImage: selectRandomCoverImage(),
    author: `${SITE_CONFIG.name} Desk`,
    modelUsed: model,
  };
}
