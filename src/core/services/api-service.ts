/**
 * Enterprise API Service v40.0
 * 
 * Production-grade API client with:
 * - Multi-provider support (OpenAI, Anthropic, Google, Cohere)
 * - Automatic retry with exponential backoff
 * - Request/Response interceptors
 * - Rate limiting and throttling
 * - Circuit breaker pattern
 * - Request caching
 * - Streaming support
 * - Comprehensive error handling
 * 
 * @module src/core/services/api-service
 */

import type {
  ContentContract,
  GenerateConfig,
  APIKeyConfig,
  AIProvider
} from '../../types';

// =============================================================================
// Types
// =============================================================================

export interface APIRequestConfig {
  provider: AIProvider;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta: {
    requestId: string;
    latency: number;
    cached: boolean;
    retryCount: number;
  };
}

export interface APIError {
  code: string;
  message: string;
  status: number;
  provider: AIProvider;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export interface StreamChunk {
  id: string;
  content: string;
  done: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

type StreamCallback = (chunk: StreamChunk) => void;
type ErrorCallback = (error: APIError) => void;

// =============================================================================
// Constants
// =============================================================================

const PROVIDER_ENDPOINTS: Record<AIProvider, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  google: 'https://generativelanguage.googleapis.com/v1beta',
  cohere: 'https://api.cohere.ai/v1',
};

const DEFAULT_TIMEOUTS: Record<AIProvider, number> = {
  openai: 60000,
  anthropic: 120000,
  google: 60000,
  cohere: 60000,
};

const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000];
const MAX_RETRIES = 5;
const RATE_LIMIT_WINDOW = 60000;

// =============================================================================
// Circuit Breaker
// =============================================================================

interface CircuitState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

class CircuitBreaker {
  private circuits: Map<AIProvider, CircuitState> = new Map();
  private readonly threshold = 5;
  private readonly resetTimeout = 30000;

  isOpen(provider: AIProvider): boolean {
    const circuit = this.circuits.get(provider);
    if (!circuit) return false;

    if (circuit.state === 'open') {
      const elapsed = Date.now() - circuit.lastFailure;
      if (elapsed > this.resetTimeout) {
        circuit.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(provider: AIProvider): void {
    const circuit = this.circuits.get(provider);
    if (circuit) {
      circuit.failures = 0;
      circuit.state = 'closed';
    }
  }

  recordFailure(provider: AIProvider): void {
    let circuit = this.circuits.get(provider);
    if (!circuit) {
      circuit = { failures: 0, lastFailure: 0, state: 'closed' };
      this.circuits.set(provider, circuit);
    }

    circuit.failures++;
    circuit.lastFailure = Date.now();

    if (circuit.failures >= this.threshold) {
      circuit.state = 'open';
      console.warn(`[CircuitBreaker] Circuit opened for ${provider}`);
    }
  }
}

// =============================================================================
// Rate Limiter
// =============================================================================

interface RateLimitState {
  tokens: number;
  lastRefill: number;
  maxTokens: number;
  refillRate: number;
}

class RateLimiter {
  private limits: Map<AIProvider, RateLimitState> = new Map();

  private readonly defaultLimits: Record<AIProvider, { max: number; rate: number }> = {
    openai: { max: 60, rate: 60 },
    anthropic: { max: 40, rate: 40 },
    google: { max: 60, rate: 60 },
    cohere: { max: 100, rate: 100 },
  };

  async acquire(provider: AIProvider): Promise<boolean> {
    let state = this.limits.get(provider);
    if (!state) {
      const config = this.defaultLimits[provider];
      state = {
        tokens: config.max,
        lastRefill: Date.now(),
        maxTokens: config.max,
        refillRate: config.rate,
      };
      this.limits.set(provider, state);
    }

    this.refillTokens(state);

    if (state.tokens > 0) {
      state.tokens--;
      return true;
    }

    const waitTime = this.calculateWaitTime(state);
    await this.sleep(waitTime);
    return this.acquire(provider);
  }

  private refillTokens(state: RateLimitState): void {
    const now = Date.now();
    const elapsed = now - state.lastRefill;
    const tokensToAdd = Math.floor(elapsed / RATE_LIMIT_WINDOW) * state.refillRate;
    
    if (tokensToAdd > 0) {
      state.tokens = Math.min(state.maxTokens, state.tokens + tokensToAdd);
      state.lastRefill = now;
    }
  }

  private calculateWaitTime(state: RateLimitState): number {
    const tokensNeeded = 1 - state.tokens;
    return Math.ceil(tokensNeeded / state.refillRate * RATE_LIMIT_WINDOW);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =============================================================================
// Request Cache
// =============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class RequestCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000;

  generateKey(config: APIRequestConfig): string {
    const keyData = {
      provider: config.provider,
      endpoint: config.endpoint,
      method: config.method,
      body: config.body,
    };
    return btoa(JSON.stringify(keyData));
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// =============================================================================
// Main API Service
// =============================================================================

export class APIService {
  private static instance: APIService | null = null;
  private apiKeys: APIKeyConfig = {};
  private circuitBreaker: CircuitBreaker;
  private rateLimiter: RateLimiter;
  private cache: RequestCache;
  private requestInterceptors: Array<(config: APIRequestConfig) => APIRequestConfig> = [];
  private responseInterceptors: Array<(response: APIResponse) => APIResponse> = [];

  private constructor() {
    this.circuitBreaker = new CircuitBreaker();
    this.rateLimiter = new RateLimiter();
    this.cache = new RequestCache();
    
    // Cleanup cache periodically
    setInterval(() => this.cache.cleanup(), 60000);
  }

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  setAPIKeys(keys: APIKeyConfig): void {
    this.apiKeys = { ...this.apiKeys, ...keys };
  }

  getAPIKey(provider: AIProvider): string | undefined {
    return this.apiKeys[provider];
  }

  addRequestInterceptor(interceptor: (config: APIRequestConfig) => APIRequestConfig): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: APIResponse) => APIResponse): void {
    this.responseInterceptors.push(interceptor);
  }

  // ---------------------------------------------------------------------------
  // Request Methods
  // ---------------------------------------------------------------------------

  async request<T>(config: APIRequestConfig): Promise<APIResponse<T>> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();
    let retryCount = 0;

    // Apply request interceptors
    let processedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      processedConfig = interceptor(processedConfig);
    }

    // Check circuit breaker
    if (this.circuitBreaker.isOpen(config.provider)) {
      return this.createErrorResponse<T>({
        code: 'CIRCUIT_OPEN',
        message: `Circuit breaker is open for ${config.provider}`,
        status: 503,
        provider: config.provider,
        retryable: false,
      }, requestId, startTime, retryCount);
    }

    // Check cache
    if (config.cache && config.method === 'GET') {
      const cacheKey = this.cache.generateKey(config);
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          meta: {
            requestId,
            latency: performance.now() - startTime,
            cached: true,
            retryCount: 0,
          },
        };
      }
    }

    // Acquire rate limit token
    await this.rateLimiter.acquire(config.provider);

    // Execute with retries
    const maxRetries = config.retries ?? MAX_RETRIES;
    let lastError: APIError | null = null;

    while (retryCount <= maxRetries) {
      try {
        const response = await this.executeRequest<T>(processedConfig);
        
        // Cache successful GET responses
        if (config.cache && config.method === 'GET' && response.success) {
          const cacheKey = this.cache.generateKey(config);
          this.cache.set(cacheKey, response.data);
        }

        this.circuitBreaker.recordSuccess(config.provider);

        let finalResponse: APIResponse<T> = {
          ...response,
          meta: {
            requestId,
            latency: performance.now() - startTime,
            cached: false,
            retryCount,
          },
        };

        // Apply response interceptors
        for (const interceptor of this.responseInterceptors) {
          finalResponse = interceptor(finalResponse) as APIResponse<T>;
        }

        return finalResponse;
      } catch (error) {
        lastError = this.normalizeError(error, config.provider);
        
        if (!lastError.retryable || retryCount >= maxRetries) {
          break;
        }

        const delay = RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)];
        await this.sleep(delay);
        retryCount++;
      }
    }

    this.circuitBreaker.recordFailure(config.provider);
    return this.createErrorResponse<T>(lastError!, requestId, startTime, retryCount);
  }

  // ---------------------------------------------------------------------------
  // Streaming
  // ---------------------------------------------------------------------------

  async stream(
    config: Omit<APIRequestConfig, 'method'>,
    onChunk: StreamCallback,
    onError?: ErrorCallback
  ): Promise<void> {
    if (this.circuitBreaker.isOpen(config.provider)) {
      onError?.({
        code: 'CIRCUIT_OPEN',
        message: `Circuit breaker is open for ${config.provider}`,
        status: 503,
        provider: config.provider,
        retryable: false,
      });
      return;
    }

    await this.rateLimiter.acquire(config.provider);

    try {
      const response = await fetch(this.buildUrl(config), {
        method: 'POST',
        headers: this.buildHeaders(config),
        body: JSON.stringify({ ...config.body, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onChunk({ id: 'done', content: '', done: true });
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onChunk({ id: 'done', content: '', done: true });
              return;
            }
            try {
              const parsed = JSON.parse(data);
              onChunk(this.parseStreamChunk(parsed, config.provider));
            } catch {
              // Skip malformed chunks
            }
          }
        }
      }

      this.circuitBreaker.recordSuccess(config.provider);
    } catch (error) {
      this.circuitBreaker.recordFailure(config.provider);
      onError?.(this.normalizeError(error, config.provider));
    }
  }

  // ---------------------------------------------------------------------------
  // Provider-Specific Methods
  // ---------------------------------------------------------------------------

  async generateContent(
    prompt: string,
    config: GenerateConfig
  ): Promise<APIResponse<ContentContract>> {
    const { provider, model, temperature, maxTokens } = config;

    const requestBody = this.buildGenerationBody(prompt, config);
    const endpoint = this.getGenerationEndpoint(provider, model);

    return this.request<ContentContract>({
      provider,
      endpoint,
      method: 'POST',
      body: requestBody,
      timeout: DEFAULT_TIMEOUTS[provider],
    });
  }

  // ---------------------------------------------------------------------------
  // Private Methods
  // ---------------------------------------------------------------------------

  private async executeRequest<T>(config: APIRequestConfig): Promise<APIResponse<T>> {
    const controller = new AbortController();
    const timeout = config.timeout || DEFAULT_TIMEOUTS[config.provider];
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.buildUrl(config), {
        method: config.method,
        headers: this.buildHeaders(config),
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.error?.message || response.statusText,
          data: errorData,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: this.parseResponse<T>(data, config.provider),
        meta: {
          requestId: '',
          latency: 0,
          cached: false,
          retryCount: 0,
        },
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private buildUrl(config: APIRequestConfig | Omit<APIRequestConfig, 'method'>): string {
    const baseUrl = PROVIDER_ENDPOINTS[config.provider];
    return `${baseUrl}${config.endpoint}`;
  }

  private buildHeaders(config: APIRequestConfig | Omit<APIRequestConfig, 'method'>): Record<string, string> {
    const apiKey = this.getAPIKey(config.provider);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    switch (config.provider) {
      case 'openai':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'anthropic':
        headers['x-api-key'] = apiKey || '';
        headers['anthropic-version'] = '2024-01-01';
        break;
      case 'google':
        headers['x-goog-api-key'] = apiKey || '';
        break;
      case 'cohere':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
    }

    return headers;
  }

  private buildGenerationBody(
    prompt: string,
    config: GenerateConfig
  ): Record<string, unknown> {
    const { provider, model, temperature, maxTokens, systemPrompt } = config;

    switch (provider) {
      case 'openai':
        return {
          model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
          temperature,
          max_tokens: maxTokens,
        };

      case 'anthropic':
        return {
          model,
          messages: [{ role: 'user', content: prompt }],
          system: systemPrompt,
          max_tokens: maxTokens,
          temperature,
        };

      case 'google':
        return {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        };

      case 'cohere':
        return {
          model,
          message: prompt,
          preamble: systemPrompt,
          temperature,
          max_tokens: maxTokens,
        };

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private getGenerationEndpoint(provider: AIProvider, model: string): string {
    switch (provider) {
      case 'openai':
        return '/chat/completions';
      case 'anthropic':
        return '/messages';
      case 'google':
        return `/models/${model}:generateContent`;
      case 'cohere':
        return '/chat';
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private parseResponse<T>(data: unknown, provider: AIProvider): T {
    // Parse response based on provider format
    switch (provider) {
      case 'openai':
        return this.parseOpenAIResponse(data) as T;
      case 'anthropic':
        return this.parseAnthropicResponse(data) as T;
      case 'google':
        return this.parseGoogleResponse(data) as T;
      case 'cohere':
        return this.parseCohereResponse(data) as T;
      default:
        return data as T;
    }
  }

  private parseOpenAIResponse(data: unknown): ContentContract {
    const typed = data as {
      choices: Array<{ message: { content: string } }>;
      usage: { prompt_tokens: number; completion_tokens: number };
    };
    return {
      content: typed.choices[0]?.message?.content || '',
      metadata: {
        model: 'gpt-4',
        promptTokens: typed.usage?.prompt_tokens || 0,
        completionTokens: typed.usage?.completion_tokens || 0,
      },
    };
  }

  private parseAnthropicResponse(data: unknown): ContentContract {
    const typed = data as {
      content: Array<{ text: string }>;
      usage: { input_tokens: number; output_tokens: number };
    };
    return {
      content: typed.content[0]?.text || '',
      metadata: {
        model: 'claude-3',
        promptTokens: typed.usage?.input_tokens || 0,
        completionTokens: typed.usage?.output_tokens || 0,
      },
    };
  }

  private parseGoogleResponse(data: unknown): ContentContract {
    const typed = data as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };
    return {
      content: typed.candidates[0]?.content?.parts[0]?.text || '',
      metadata: {
        model: 'gemini',
        promptTokens: 0,
        completionTokens: 0,
      },
    };
  }

  private parseCohereResponse(data: unknown): ContentContract {
    const typed = data as { text: string; meta?: { tokens?: { input_tokens: number; output_tokens: number } } };
    return {
      content: typed.text || '',
      metadata: {
        model: 'command',
        promptTokens: typed.meta?.tokens?.input_tokens || 0,
        completionTokens: typed.meta?.tokens?.output_tokens || 0,
      },
    };
  }

  private parseStreamChunk(data: unknown, provider: AIProvider): StreamChunk {
    switch (provider) {
      case 'openai': {
        const typed = data as { id: string; choices: Array<{ delta: { content?: string } }> };
        return {
          id: typed.id,
          content: typed.choices[0]?.delta?.content || '',
          done: false,
        };
      }
      case 'anthropic': {
        const typed = data as { type: string; delta?: { text?: string } };
        return {
          id: crypto.randomUUID(),
          content: typed.delta?.text || '',
          done: typed.type === 'message_stop',
        };
      }
      default:
        return { id: crypto.randomUUID(), content: '', done: false };
    }
  }

  private normalizeError(error: unknown, provider: AIProvider): APIError {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          code: 'TIMEOUT',
          message: 'Request timed out',
          status: 408,
          provider,
          retryable: true,
        };
      }
      return {
        code: 'NETWORK_ERROR',
        message: error.message,
        status: 0,
        provider,
        retryable: true,
      };
    }

    const typed = error as { status?: number; message?: string; data?: unknown };
    const status = typed.status || 500;
    
    return {
      code: this.getErrorCode(status),
      message: typed.message || 'Unknown error',
      status,
      provider,
      retryable: status >= 500 || status === 429,
      details: typed.data as Record<string, unknown>,
    };
  }

  private getErrorCode(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }

  private createErrorResponse<T>(
    error: APIError,
    requestId: string,
    startTime: number,
    retryCount: number
  ): APIResponse<T> {
    return {
      success: false,
      error,
      meta: {
        requestId,
        latency: performance.now() - startTime,
        cached: false,
        retryCount,
      },
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =============================================================================
// Exports
// =============================================================================

export const apiService = APIService.getInstance();
export default apiService;
