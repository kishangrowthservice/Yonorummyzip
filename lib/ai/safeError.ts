/**
 * Safe Error Sanitization
 *
 * Ensures that no sensitive information (API keys, query parameters,
 * internal server URLs, credentials, tokens, or raw stack traces)
 * is ever revealed to users or client-side responses.
 */

export function sanitizeAiErrorMessage(err: unknown): string {
  if (!err) {
    return 'An unexpected error occurred during article generation.';
  }

  const rawMsg = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number })?.status;

  // Rate limiting / Quota errors
  if (status === 429 || /rate[- ]?limit|quota|too many requests|resource_exhausted/i.test(rawMsg)) {
    return 'The AI service is currently busy or rate-limited. Please wait a few seconds and try again.';
  }

  // Model not found / unavailable
  if (status === 404 || /model_not_found|does not exist|not found|no longer available/i.test(rawMsg)) {
    return 'The selected AI model is currently unavailable. Please select another model.';
  }

  // Authentication / Authorization issues
  if (status === 401 || status === 403 || /unauthorized|forbidden|api[- ]?key|invalid_api_key/i.test(rawMsg)) {
    return 'Authentication error with AI provider. Please verify your credentials or contact administrator.';
  }

  // Server overloaded / 503 / 502
  if (status === 502 || status === 503 || status === 504 || /unavailable|overloaded|high demand/i.test(rawMsg)) {
    return 'The AI service is currently experiencing high demand. Please try again in a few moments.';
  }

  // Timeouts
  if (/timeout|abort|timed? ?out/i.test(rawMsg)) {
    return 'Generation request timed out. Please try generating with a shorter word count or another topic.';
  }

  // Formatting / JSON parse
  if (/json|syntaxerror|parse/i.test(rawMsg)) {
    return 'Failed to format the generated article properly. Please try regenerating.';
  }

  // Generic fallback: scrub any potential tokens, keys, URLs
  const scrubbed = rawMsg
    .replace(/gsk_[a-zA-Z0-9_-]+/gi, '[REDACTED]')
    .replace(/AIza[a-zA-Z0-9_-]+/gi, '[REDACTED]')
    .replace(/key=[a-zA-Z0-9_-]+/gi, 'key=[REDACTED]')
    .replace(/https?:\/\/[^\s"'<>)]+/gi, '[API endpoint]');

  // If scrubbed still contains stack traces or JSON braces, use clean message
  if (scrubbed.includes('{') || scrubbed.includes('at ') || scrubbed.length > 150) {
    return 'Failed to generate article draft. Please try again with a different prompt or model.';
  }

  return scrubbed;
}

/**
 * Safely extracts a deduplicated list of keywords from focusKeyword and secondaryKeywords,
 * gracefully supporting string, string[], comma-separated strings, or undefined.
 */
export function extractKeywordsList(
  focusKeyword?: string | null,
  secondaryKeywords?: string | string[] | null
): string[] {
  const list: string[] = [];

  if (focusKeyword && typeof focusKeyword === 'string' && focusKeyword.trim()) {
    list.push(focusKeyword.trim());
  }

  if (Array.isArray(secondaryKeywords)) {
    for (const item of secondaryKeywords) {
      if (typeof item === 'string') {
        for (const sub of item.split(',')) {
          const trimmed = sub.trim();
          if (trimmed && !list.includes(trimmed)) {
            list.push(trimmed);
          }
        }
      }
    }
  } else if (typeof secondaryKeywords === 'string') {
    for (const sub of secondaryKeywords.split(',')) {
      const trimmed = sub.trim();
      if (trimmed && !list.includes(trimmed)) {
        list.push(trimmed);
      }
    }
  }

  return list;
}
