function isEnabled(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return defaultValue;
}

async function checkOllama(baseUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);

  try {
    const endpoint = `${String(baseUrl || '').replace(/\/$/, '')}/api/tags`;
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
    });
    if (!response.ok) return false;
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const providerOrder = String(
      process.env.AI_PROVIDER_ORDER || 'openrouter,gemini,groq,ollama,hf,openai'
    )
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const ollamaEnabled = isEnabled(process.env.OLLAMA_ENABLED, true);
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

    const providers = {
      openrouter: {
        configured:
          Boolean(process.env.OPENROUTER_API_KEY) &&
          isEnabled(process.env.OPENROUTER_FREE_AVAILABLE, true),
        model:
          process.env.OPENROUTER_FREE_MODEL ||
          process.env.OPENROUTER_MODEL ||
          'google/gemma-2-9b-it:free',
      },
      gemini: {
        configured: Boolean(process.env.GEMINI_API_KEY),
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      },
      groq: {
        configured: Boolean(process.env.GROQ_API_KEY),
        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      },
      ollama: {
        configured: ollamaEnabled,
        model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
        baseUrl: ollamaBaseUrl,
        reachable: ollamaEnabled ? await checkOllama(ollamaBaseUrl) : false,
      },
      hf: {
        configured: Boolean(process.env.HF_TOKEN),
        model: process.env.HF_MODEL || 'deepseek-ai/DeepSeek-V3-0324:novita',
      },
      openai: {
        configured: Boolean(process.env.OPENAI_API_KEY),
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      },
    };

    const activeCount = Object.values(providers).filter((p) => p.configured).length;

    return res.status(200).json({
      providerOrder,
      activeCount,
      providers,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to load AI provider status',
      details: err?.message || 'Unknown error',
    });
  }
}
