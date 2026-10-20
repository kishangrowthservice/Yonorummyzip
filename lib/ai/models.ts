export interface AIModelOption {
  id: string;
  name: string;
  provider: string;
  badge: string;
  description: string;
  contextWindow: string;
  speed: string;
  isDefault?: boolean;
}

export const AVAILABLE_MODELS: AIModelOption[] = [
  {
    id: 'openai/gpt-oss-120b',
    name: 'OpenAI GPT-OSS 120B',
    provider: 'OpenAI / Groq',
    badge: 'Recommended • Flagship',
    description: 'Deep analytical substance, varied human editorial cadence, elite gaming SEO strategy',
    contextWindow: '131k',
    speed: '~6s',
    isDefault: true,
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'OpenAI GPT-OSS 20B',
    provider: 'OpenAI / Groq',
    badge: 'Ultra-Fast',
    description: 'Sub-3s generation speed, punchy conversion structure, agile gaming guides',
    contextWindow: '131k',
    speed: '~2.5s',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Google Gemini 3.8 Flash',
    provider: 'Google',
    badge: 'Agentic Reasoning',
    description: '1M+ context reasoning, elite multi-angle analysis, strict structural compliance',
    contextWindow: '1M+',
    speed: '~6s',
  },
];

export const DEFAULT_MODEL_ID = 'openai/gpt-oss-120b';

export function getValidModel(modelId?: string): string {
  if (!modelId) return DEFAULT_MODEL_ID;
  const match = AVAILABLE_MODELS.find((m) => m.id === modelId);
  return match ? match.id : DEFAULT_MODEL_ID;
}

export function getValidGroqModel(modelId?: string): string {
  if (modelId === 'openai/gpt-oss-20b') return 'openai/gpt-oss-20b';
  return 'openai/gpt-oss-120b';
}

