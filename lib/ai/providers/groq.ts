import Groq from 'groq-sdk';
import { buildBlogPostPrompt, blogPostResponseSchema } from '../prompts/blogPost';
import { normalizeContentToHtml, htmlToMarkdown } from '../contentFormatter';
import { getValidGroqModel } from '../models';
import { slugify, optimizeSeoSlug, selectRandomCoverImage } from '../aiBlogGeneratorHelpers';
import { sanitizeBrandAndDomain, sanitizeBrandArray } from '../sanitizeBlogOutput';
import type { GenerationRequest, GeneratedBlogResponse } from '@/lib/blog-types';
import { SITE_CONFIG } from '@/lib/blog-config';
import { sanitizeAiErrorMessage, extractKeywordsList } from '../safeError';

let groqInstance: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqInstance) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }
    groqInstance = new Groq({ apiKey: apiKey.trim().replace(/^["']|["']$/g, '') });
  }
  return groqInstance;
}

/** Retry on transient Groq errors (429 rate-limit, 502/503 server errors). */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  const RETRIABLE = [429, 502, 503];
  const BACKOFF_MS = [1000, 3000];
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number }).status;
      if (!status || !RETRIABLE.includes(status) || attempt === maxRetries) {
        throw err;
      }
      await new Promise((res) => setTimeout(res, BACKOFF_MS[attempt] ?? 3000));
    }
  }
  throw lastError;
}

export async function generateBlogPostWithGroq(
  req: GenerationRequest
): Promise<GeneratedBlogResponse> {
  const groq = getGroqClient();
  const keywords = extractKeywordsList(req.focusKeyword, req.secondaryKeywords);

  const prompt = buildBlogPostPrompt({
    topic: req.topic,
    keywords,
    wordCount: req.wordCount ?? 1200,
    category: req.category ?? 'Yono Games Guides',
    tone: 'Authoritative, Engaging & Conversational',
    audience: 'Indian online gamers, Teen Patti & Rummy players seeking verified Yono apps and payout tips',
  });

  const model = getValidGroqModel(req.model);

  try {
    const completion = await withRetry(() =>
      groq.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a premier senior gaming writer. Always output strictly valid JSON matching the schema, with clean semantic HTML inside the content property.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.65,
        max_tokens: 8192,
        response_format: { type: 'json_object' },
      })
    );

    const rawOutput = completion.choices[0]?.message?.content || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(rawOutput);
    } catch {
      // Fallback cleanup if model wrapped in markdown fences
      const cleanJson = rawOutput.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    const htmlContent = normalizeContentToHtml(parsed.content || '');
    const markdownParagraphs = htmlToMarkdown(htmlContent);
    const slug = optimizeSeoSlug(parsed.title || req.topic, req.focusKeyword);
    const cleanHtml = sanitizeBrandAndDomain(htmlContent);
    const cleanMarkdown = markdownParagraphs.map(sanitizeBrandAndDomain);
    const cleanTitle = sanitizeBrandAndDomain(parsed.title || req.topic);
    const cleanSlug = sanitizeBrandAndDomain(slug);
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
  } catch (err) {
    console.error('[Groq] Generation failed:', err);
    throw new Error(sanitizeAiErrorMessage(err));
  }
}
