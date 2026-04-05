const SUPPORTED_PROVIDERS = ['openrouter', 'gemini', 'groq', 'ollama', 'hf', 'openai'];
const DEFAULT_PROVIDER_ORDER = ['openrouter', 'gemini', 'groq', 'ollama'];

function clip(value, max = 600) {
  return String(value || '').slice(0, max);
}

function parseProviderOrder(raw) {
  const parsed = String(raw || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!parsed.length) {
    return DEFAULT_PROVIDER_ORDER;
  }

  const allowed = new Set(SUPPORTED_PROVIDERS);
  return parsed.filter((item) => allowed.has(item));
}

function isFlagEnabled(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return defaultValue;
}

function getProviderConfigs() {
  const openRouterEnabled = isFlagEnabled(process.env.OPENROUTER_FREE_AVAILABLE, true);
  const openRouterModel =
    process.env.OPENROUTER_FREE_MODEL ||
    process.env.OPENROUTER_MODEL ||
    'google/gemma-2-9b-it:free';

  return {
    openrouter:
      process.env.OPENROUTER_API_KEY && openRouterEnabled
        ? {
            apiKey: process.env.OPENROUTER_API_KEY,
            model: openRouterModel,
          }
        : null,
    gemini: process.env.GEMINI_API_KEY
      ? {
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        }
      : null,
    groq: process.env.GROQ_API_KEY
      ? {
          apiKey: process.env.GROQ_API_KEY,
          model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
        }
      : null,
    ollama: isFlagEnabled(process.env.OLLAMA_ENABLED, true)
      ? {
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
          model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
        }
      : null,
    hf: process.env.HF_TOKEN
      ? {
          apiKey: process.env.HF_TOKEN,
          model: process.env.HF_MODEL || 'deepseek-ai/DeepSeek-V3-0324:novita',
        }
      : null,
    openai: process.env.OPENAI_API_KEY
      ? {
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        }
      : null,
  };
}

function buildProviderError({ provider, status, code, details }) {
  const err = new Error(`${provider} provider error`);
  err.provider = provider;
  err.status = status;
  err.code = code || 'AI_PROVIDER_ERROR';
  err.details = clip(details, 600);
  return err;
}

function detectProviderErrorCode(detailsText) {
  const details = String(detailsText || '').toLowerCase();

  if (
    details.includes('depleted your monthly included credits') ||
    details.includes('purchase pre-paid credits') ||
    details.includes('insufficient_quota') ||
    details.includes('billing') ||
    details.includes('quota') ||
    details.includes('credit')
  ) {
    return 'AI_PROVIDER_QUOTA';
  }

  if (details.includes('rate limit') || details.includes('too many requests')) {
    return 'AI_PROVIDER_RATE_LIMIT';
  }

  if (details.includes('unauthorized') || details.includes('invalid api key')) {
    return 'AI_PROVIDER_AUTH';
  }

  return 'AI_PROVIDER_ERROR';
}

async function callHf({ apiKey, model, messages, temperature, maxTokens }) {
  const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature,
      messages,
      ...(maxTokens ? { max_tokens: maxTokens } : {}),
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw buildProviderError({
      provider: 'hf',
      status: response.status,
      code: detectProviderErrorCode(raw),
      details: raw,
    });
  }

  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw buildProviderError({
      provider: 'hf',
      status: 502,
      details: 'Invalid JSON response from Hugging Face provider.',
    });
  }

  return {
    provider: 'hf',
    model,
    content: String(data?.choices?.[0]?.message?.content || ''),
  };
}

async function callOpenAi({ apiKey, model, messages, temperature, maxTokens }) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature,
      messages,
      ...(maxTokens ? { max_tokens: maxTokens } : {}),
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw buildProviderError({
      provider: 'openai',
      status: response.status,
      code: detectProviderErrorCode(raw),
      details: raw,
    });
  }

  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw buildProviderError({
      provider: 'openai',
      status: 502,
      details: 'Invalid JSON response from OpenAI provider.',
    });
  }

  return {
    provider: 'openai',
    model,
    content: String(data?.choices?.[0]?.message?.content || ''),
  };
}

async function callOpenRouter({ apiKey, model, messages, temperature, maxTokens }) {
  const makeRequest = async (requestMessages) => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature,
        messages: requestMessages,
        ...(maxTokens ? { max_tokens: maxTokens } : {}),
      }),
    });

    return {
      ok: response.ok,
      status: response.status,
      raw: await response.text(),
    };
  };

  let result = await makeRequest(messages);
  if (!result.ok) {
    const details = String(result.raw || '');
    const needsCompatRetry = details.toLowerCase().includes('developer instruction is not enabled');

    if (needsCompatRetry) {
      const systemText = messages
        .filter((msg) => msg.role === 'system')
        .map((msg) => String(msg.content || '').trim())
        .filter(Boolean)
        .join('\n\n');

      const nonSystem = messages.filter((msg) => msg.role !== 'system');
      const firstUserIndex = nonSystem.findIndex((msg) => msg.role === 'user');
      const compatMessages = [...nonSystem];

      if (systemText) {
        if (firstUserIndex >= 0) {
          compatMessages[firstUserIndex] = {
            ...compatMessages[firstUserIndex],
            content: `Follow these instructions:\n${systemText}\n\n${String(compatMessages[firstUserIndex].content || '')}`,
          };
        } else {
          compatMessages.unshift({
            role: 'user',
            content: `Follow these instructions:\n${systemText}`,
          });
        }
      }

      result = await makeRequest(compatMessages);
    }

    if (!result.ok) {
      throw buildProviderError({
        provider: 'openrouter',
        status: result.status,
        code: detectProviderErrorCode(result.raw),
        details: result.raw,
      });
    }
  }

  let data = {};
  try {
    data = result.raw ? JSON.parse(result.raw) : {};
  } catch {
    throw buildProviderError({
      provider: 'openrouter',
      status: 502,
      details: 'Invalid JSON response from OpenRouter provider.',
    });
  }

  return {
    provider: 'openrouter',
    model,
    content: String(data?.choices?.[0]?.message?.content || ''),
  };
}

async function callGemini({ apiKey, model, messages, temperature, maxTokens }) {
  const geminiContents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(msg.content || '') }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: geminiContents,
      generationConfig: {
        temperature,
        ...(maxTokens ? { maxOutputTokens: maxTokens } : {}),
      },
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw buildProviderError({
      provider: 'gemini',
      status: response.status,
      code: detectProviderErrorCode(raw),
      details: raw,
    });
  }

  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw buildProviderError({
      provider: 'gemini',
      status: 502,
      details: 'Invalid JSON response from Gemini provider.',
    });
  }

  const content = data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || '').join('') || '';
  return {
    provider: 'gemini',
    model,
    content: String(content),
  };
}

async function callGroq({ apiKey, model, messages, temperature, maxTokens }) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature,
      messages,
      ...(maxTokens ? { max_tokens: maxTokens } : {}),
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw buildProviderError({
      provider: 'groq',
      status: response.status,
      code: detectProviderErrorCode(raw),
      details: raw,
    });
  }

  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw buildProviderError({
      provider: 'groq',
      status: 502,
      details: 'Invalid JSON response from Groq provider.',
    });
  }

  return {
    provider: 'groq',
    model,
    content: String(data?.choices?.[0]?.message?.content || ''),
  };
}

async function callOllama({ baseUrl, model, messages, temperature, maxTokens }) {
  const endpoint = `${String(baseUrl || '').replace(/\/$/, '')}/api/chat`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      stream: false,
      messages,
      options: {
        temperature,
        ...(maxTokens ? { num_predict: maxTokens } : {}),
      },
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw buildProviderError({
      provider: 'ollama',
      status: response.status,
      code: detectProviderErrorCode(raw),
      details: raw,
    });
  }

  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw buildProviderError({
      provider: 'ollama',
      status: 502,
      details: 'Invalid JSON response from Ollama.',
    });
  }

  return {
    provider: 'ollama',
    model,
    content: String(data?.message?.content || ''),
  };
}

async function callProvider(provider, payload, config) {
  if (provider === 'openrouter') return callOpenRouter({ ...payload, ...config });
  if (provider === 'gemini') return callGemini({ ...payload, ...config });
  if (provider === 'groq') return callGroq({ ...payload, ...config });
  if (provider === 'ollama') return callOllama({ ...payload, ...config });
  if (provider === 'hf') return callHf({ ...payload, ...config });
  if (provider === 'openai') return callOpenAi({ ...payload, ...config });

  const err = new Error(`Unsupported provider: ${provider}`);
  err.code = 'AI_PROVIDER_UNSUPPORTED';
  throw err;
}

export async function chatCompletionsWithFallback({ messages, temperature = 0.5, maxTokens }) {
  const providerOrder = parseProviderOrder(process.env.AI_PROVIDER_ORDER);
  const configs = getProviderConfigs();
  const activeProviders = providerOrder.filter((provider) => Boolean(configs[provider]));

  if (!activeProviders.length) {
    const err = new Error(
      'No AI providers configured. Add at least one of OPENROUTER_API_KEY, GEMINI_API_KEY, GROQ_API_KEY, OLLAMA_ENABLED, HF_TOKEN, OPENAI_API_KEY.'
    );
    err.code = 'AI_NO_PROVIDER';
    err.status = 500;
    throw err;
  }

  const failures = [];
  for (const provider of activeProviders) {
    try {
      return await callProvider(provider, { messages, temperature, maxTokens }, configs[provider]);
    } catch (err) {
      failures.push({
        provider,
        code: err?.code || 'AI_PROVIDER_ERROR',
        status: Number(err?.status) || 500,
        details: clip(err?.details || err?.message || 'Unknown provider error', 220),
      });
    }
  }

  const allFailedError = new Error('All configured AI providers failed.');
  allFailedError.code = 'AI_ALL_PROVIDERS_FAILED';
  allFailedError.status = failures.some((item) => item.code === 'AI_PROVIDER_QUOTA') ? 402 : 502;
  allFailedError.failures = failures;
  throw allFailedError;
}

export function toAiHttpError(err, fallbackMessage = 'AI provider request failed.') {
  if (err?.code === 'AI_NO_PROVIDER') {
    return {
      status: 500,
      error:
        'No AI provider configured. Add OPENROUTER_API_KEY, GEMINI_API_KEY, GROQ_API_KEY, or enable OLLAMA in environment variables.',
      details: String(err?.message || ''),
    };
  }

  if (err?.code === 'AI_ALL_PROVIDERS_FAILED') {
    const details = Array.isArray(err?.failures)
      ? err.failures.map((item) => `${item.provider}: ${item.details}`).join(' | ')
      : 'All configured providers failed.';

    return {
      status: Number(err?.status) || 502,
      error:
        Number(err?.status) === 402
          ? 'AI provider quota reached across configured services. Add credits or configure another provider key.'
          : 'All configured AI providers failed. Please check provider keys and models.',
      details: clip(details, 700),
    };
  }

  return {
    status: Number(err?.status) || 500,
    error: fallbackMessage,
    details: clip(err?.message || 'Unknown error', 700),
  };
}
