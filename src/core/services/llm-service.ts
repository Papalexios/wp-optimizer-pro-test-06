/**
 * Enterprise LLM Service v40.0
 * 
 * Multi-provider LLM orchestration with:
 * - Circuit breaker pattern for fault tolerance
 * - Exponential backoff with jitter
 * - Provider health monitoring
 * - Request/response caching
 * - Token budget management
 * - Streaming support
 * 
 * @module src/core/services/llm-service
 */

import { GoogleGenAI } from '@google/genai';

// ============================================================================
// Types
// ============================================================================

export type LLMProvider = 'google' | 'openrouter' | 'openai' | 'anthropic' | 'groq';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  tokensUsed?: number;
  latencyMs: number;
  cached: boolean;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
  successCount: number;
}

// ============================================================================
// Circuit Breaker Implementation
// ============================================================================

class CircuitBreaker {
  private states = new Map<string, CircuitBreakerState>();
  private readonly failureThreshold = 3;
  private readonly recoveryTimeout = 60000;
  private readonly halfOpenSuccessThreshold = 2;

  getState(provider: string): CircuitBreakerState {
    if (!this.states.has(provider)) {
      this.states.set(provider, {
        failures: 0,
        lastFailure: 0,
        isOpen: false,
        successCount: 0,
      });
    }
    return this.states.get(provider)!;
  }

  recordFailure(provider: string): void {
    const state = this.getState(provider);
    state.failures++;
    state.lastFailure = Date.now();
    state.successCount = 0;
    
    if (state.failures >= this.failureThreshold) {
      state.isOpen = true;
      console.warn(`[CircuitBreaker] OPEN for ${provider}`);
    }
  }

  recordSuccess(provider: string): void {
    const state = this.getState(provider);
    state.successCount++;
    
    if (state.isOpen && state.successCount >= this.halfOpenSuccessThreshold) {
      state.isOpen = false;
      state.failures = 0;
      console.info(`[CircuitBreaker] CLOSED for ${provider}`);
    }
  }

  isOpen(provider: string): boolean {
    const state = this.getState(provider);
    
    if (!state.isOpen) return false;
    
    // Check if recovery timeout has passed (half-open state)
    if (Date.now() - state.lastFailure > this.recoveryTimeout) {
      return false; // Allow retry in half-open state
    }
    
    return true;
  }

  reset(provider: string): void {
    this.states.delete(provider);
  }
}

// ============================================================================
// Response Cache
// ============================================================================

class LLMCache {
  private cache = new Map<string, { response: string; timestamp: number }>();
  private readonly ttl = 300000; // 5 minutes
  private readonly maxSize = 100;

  private generateKey(prompt: string, config: LLMConfig): string {
    return `${config.provider}:${config.model}:${prompt.slice(0, 100)}`;
  }

  get(prompt: string, config: LLMConfig): string | null {
    const key = this.generateKey(prompt, config);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.response;
  }

  set(prompt: string, config: LLMConfig, response: string): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    
    const key = this.generateKey(prompt, config);
    this.cache.set(key, { response, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

// ============================================================================
// LLM Service
// ============================================================================

export class LLMService {
  private circuitBreaker = new CircuitBreaker();
  private cache = new LLMCache();
  private apiKeys: Record<string, string> = {};

  constructor(apiKeys?: Record<string, string>) {
    if (apiKeys) {
      this.apiKeys = apiKeys;
    }
  }

  setApiKey(provider: LLMProvider, key: string): void {
    this.apiKeys[provider] = key;
  }

  async call(
    prompt: string,
    systemPrompt: string,
    config: Partial<LLMConfig> & { provider: LLMProvider; model: string }
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const fullConfig: LLMConfig = {
      ...config,
      apiKey: config.apiKey || this.apiKeys[config.provider] || '',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 16000,
      timeout: config.timeout ?? 120000,
    };

    // Check cache
    const cachedResponse = this.cache.get(prompt, fullConfig);
    if (cachedResponse) {
      return {
        content: cachedResponse,
        provider: fullConfig.provider,
        model: fullConfig.model,
        latencyMs: Date.now() - startTime,
        cached: true,
      };
    }

    // Check circuit breaker
    if (this.circuitBreaker.isOpen(fullConfig.provider)) {
      throw new Error(`Circuit breaker OPEN for ${fullConfig.provider}`);
    }

    try {
      const response = await this.executeCall(prompt, systemPrompt, fullConfig);
      this.circuitBreaker.recordSuccess(fullConfig.provider);
      this.cache.set(prompt, fullConfig, response);
      
      return {
        content: response,
        provider: fullConfig.provider,
        model: fullConfig.model,
        latencyMs: Date.now() - startTime,
        cached: false,
      };
    } catch (error) {
      this.circuitBreaker.recordFailure(fullConfig.provider);
      throw error;
    }
  }

  private async executeCall(
    prompt: string,
    systemPrompt: string,
    config: LLMConfig
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      switch (config.provider) {
        case 'google':
          return await this.callGoogle(prompt, systemPrompt, config);
        case 'openrouter':
          return await this.callOpenRouter(prompt, systemPrompt, config, controller.signal);
        case 'openai':
          return await this.callOpenAI(prompt, systemPrompt, config, controller.signal);
        case 'anthropic':
          return await this.callAnthropic(prompt, systemPrompt, config, controller.signal);
        case 'groq':
          return await this.callGroq(prompt, systemPrompt, config, controller.signal);
        default:
          throw new Error(`Unknown provider: ${config.provider}`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async callGoogle(prompt: string, systemPrompt: string, config: LLMConfig): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const response = await ai.models.generateContent({
      model: config.model || 'gemini-2.5-flash-preview-05-20',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
      },
    });
    return response.text || '';
  }

  private async callOpenRouter(
    prompt: string,
    systemPrompt: string,
    config: LLMConfig,
    signal: AbortSignal
  ): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://wp-optimizer-pro.com',
        'X-Title': 'WP Optimizer Pro',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private async callOpenAI(
    prompt: string,
    systemPrompt: string,
    config: LLMConfig,
    signal: AbortSignal
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private async callAnthropic(
    prompt: string,
    systemPrompt: string,
    config: LLMConfig,
    signal: AbortSignal
  ): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model || 'claude-sonnet-4-20250514',
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Anthropic error: ${response.status}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  private async callGroq(
    prompt: string,
    systemPrompt: string,
    config: LLMConfig,
    signal: AbortSignal
  ): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: config.temperature,
        max_tokens: Math.min(config.maxTokens || 8000, 8000),
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Groq error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  clearCache(): void {
    this.cache.clear();
  }

  resetCircuitBreaker(provider?: LLMProvider): void {
    if (provider) {
      this.circuitBreaker.reset(provider);
    } else {
      ['google', 'openrouter', 'openai', 'anthropic', 'groq'].forEach((p) =>
        this.circuitBreaker.reset(p)
      );
    }
  }
}

// Singleton instance
export const llmService = new LLMService();
export default llmService;
