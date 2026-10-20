/**
 * Yono Games AI Blog Generator Prompt
 * 
 * Adapted for All Yono Games 99 (allyonogames99.com).
 * Produces structured, high-conversion articles with clean semantic HTML.
 */

export interface BlogPostPromptArgs {
  topic: string;
  keywords: string[];
  wordCount: number;
  category: string;
  tone?: string;
  audience?: string;
}

export function buildBlogPostPrompt(args: BlogPostPromptArgs): string {
  const {
    topic,
    keywords,
    wordCount,
    category,
    tone = 'Authoritative, Conversational & Engaging',
    audience = 'Indian online gamers, Teen Patti & Rummy players, APK downloaders looking for trusted real money gaming apps',
  } = args;

  const primaryKeyword = keywords[0] || topic;
  const keywordList = keywords.length > 0 ? keywords.join(', ') : topic;
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'All Yono Games 99';
  const siteDomain = process.env.SITE_DOMAIN || 'allyonogames99.com';

  return `You are a veteran gaming analyst and lead editor for ${siteName} (${siteDomain}), India's leading portal for all official Yono apps, Rummy, Teen Patti, and real-cash gaming guides.

Write a complete, deeply informative, and punchy article on:
"${topic}"

### BRAND KNOWLEDGE BASE (${siteName})
- **Identity**: ${siteName} (${siteDomain}) is India's most trusted portal for downloading official Yono sister apps (Yono Rummy, Yono 777, Yono Arcade, Yono VIP, 101z, etc.).
- **Core USPs**:
  1. **100% Verified APKs** — Clean, virus-free, official download links directly from game publishers.
  2. **₹1,500 Welcome Bonus** — Generous sign-up rewards, daily login bonuses, and VIP rebate perks.
  3. **2-Minute Fast UPI Withdrawals** — Automated PhonePe, Google Pay, Paytm, and IMPS bank cashouts.
  4. **Lowest Minimum Withdrawal** — Cash out starting at just ₹100 with zero deduction.
  5. **50+ All Yono Sister Apps** — Comprehensive library comparing bonus rates, ratings, and gameplay modes.
- **Key Products**: Teen Patti, Point Rummy, Pool Rummy, Dragon vs Tiger, Mines, Crash, 7 Up 7 Down, and High-RTP Slots.

### WRITING RULES
1. **Pacing & Cadence**: Short punchy sentences alongside concrete analytical tips. Write with genuine gaming experience.
2. **Actionable Depth**: Give real player advice (e.g. bankroll management, card discard sequence, table limits, withdrawal verification tips).
3. **No Fluff / No AI Cliches**: Never use words like "in today's fast-paced digital world", "delve into", "game-changer", "in conclusion", "furthermore", "look no further".
4. **Natural Internal Links**: Include 2-3 natural HTML links from:
   - <a href='/'>Download Official Yono Games APK</a>
   - <a href='/'>Explore All Yono Sister Apps</a>
   - <a href='/'>Claim Yono Signup Bonus</a>
5. **Strict Brand & Domain Security**: The portal name is exclusively "${siteName}" and domain is "${siteDomain}". NEVER use or mention any legacy, unauthorized, or third-party competitor domain. Any links must strictly use relative "/" root URLs or "https://${siteDomain}".

### HTML OUTPUT RULES
The "content" field must be semantic, valid HTML:
- Intro: 1-2 punchy <p> paragraphs.
- Body: 3-5 <h2> sections with <p> paragraphs between them.
- Sub-points: <h3> for specific game tricks or step-by-step methods.
- Lists: At least one <ul> or <ol> list for steps or features.
- Table: Exactly one comparison or bonus table (<table><thead><tr><th>...</th></tr></thead><tbody><tr><td>...</td></tr></tbody></table>).
- Blockquote: Exactly one <blockquote><p>...</p></blockquote> with a contrarian gaming tip.
- FAQ: 3-4 <h3> questions ending with '?', each followed by a concise 2-sentence <p> answer.
- Close: Final strong <p> with a concrete recommendation.

### OUTPUT JSON FORMAT
Return RAW JSON only (no markdown fences, no explanatory text):
{
  "title": "High-CTR title under 65 chars with primary keyword near front",
  "metaDescription": "140-160 chars with primary keyword, concrete incentive to click",
  "content": "<p>...</p><h2>...</h2><p>...</p><table>...</table><blockquote><p>...</p></blockquote><h3>FAQ?</h3><p>...</p>",
  "suggestedTags": ["Yono Games", "Rummy", "Teen Patti", "APK Download"]
}`;
}

export const blogPostResponseSchema = {
  name: 'blog_post',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      metaDescription: { type: 'string' },
      content: { type: 'string' },
      suggestedTags: { type: 'array', items: { type: 'string' } },
    },
    required: ['title', 'metaDescription', 'content', 'suggestedTags'],
    additionalProperties: false,
  },
} as const;
