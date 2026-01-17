/**
 * Enterprise State Management Store v40.0
 * 
 * Zustand-inspired state management with:
 * - Immutable state updates
 * - Middleware support (logging, persistence)
 * - Computed/derived state
 * - Action history for debugging
 * - Type-safe selectors
 * - Persistence to localStorage
 * 
 * @module src/core/store/app-store
 */

import type { ContentContract, GenerateConfig, APIKeyConfig } from '../../types';

// ============================================================================
// Types
// ============================================================================

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

export interface GenerationProgress {
  stage: string;
  progress: number;
  message: string;
  startedAt?: number;
  completedAt?: number;
}

export interface GenerationHistory {
  id: string;
  topic: string;
  status: GenerationStatus;
  contract?: ContentContract;
  error?: string;
  createdAt: number;
  completedAt?: number;
  config: Partial<GenerateConfig>;
}

export interface AppState {
  // API Keys
  apiKeys: APIKeyConfig;
  
  // Generation
  currentTopic: string;
  generationStatus: GenerationStatus;
  generationProgress: GenerationProgress | null;
  currentContract: ContentContract | null;
  generationError: string | null;
  
  // History
  history: GenerationHistory[];
  
  // UI State
  activeTab: 'generate' | 'history' | 'settings';
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Config
  provider: string;
  model: string;
  temperature: number;
  
  // WordPress
  wpConfig: {
    siteUrl: string;
    username: string;
    appPassword: string;
    connected: boolean;
  };
}

export interface AppActions {
  // API Keys
  setApiKey: (provider: string, key: string) => void;
  setApiKeys: (keys: Partial<APIKeyConfig>) => void;
  
  // Generation
  setTopic: (topic: string) => void;
  startGeneration: () => void;
  updateProgress: (progress: GenerationProgress) => void;
  completeGeneration: (contract: ContentContract) => void;
  failGeneration: (error: string) => void;
  resetGeneration: () => void;
  
  // History
  addToHistory: (entry: GenerationHistory) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  
  // UI
  setActiveTab: (tab: AppState['activeTab']) => void;
  toggleSidebar: () => void;
  setTheme: (theme: AppState['theme']) => void;
  
  // Config
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  
  // WordPress
  setWpConfig: (config: Partial<AppState['wpConfig']>) => void;
  
  // Persistence
  hydrate: () => void;
  persist: () => void;
}

export type AppStore = AppState & AppActions;

// ============================================================================
// Initial State
// ============================================================================

const initialState: AppState = {
  apiKeys: {
    google: '',
    openrouter: '',
    openai: '',
    anthropic: '',
    groq: '',
    serper: '',
  },
  currentTopic: '',
  generationStatus: 'idle',
  generationProgress: null,
  currentContract: null,
  generationError: null,
  history: [],
  activeTab: 'generate',
  sidebarOpen: true,
  theme: 'system',
  provider: 'google',
  model: 'gemini-2.5-flash-preview-05-20',
  temperature: 0.7,
  wpConfig: {
    siteUrl: '',
    username: '',
    appPassword: '',
    connected: false,
  },
};

// ============================================================================
// Store Implementation
// ============================================================================

type Listener = () => void;
type Selector<T> = (state: AppState) => T;

class Store {
  private state: AppState;
  private listeners: Set<Listener> = new Set();
  private actionHistory: Array<{ action: string; payload?: unknown; timestamp: number }> = [];

  constructor(initial: AppState) {
    this.state = { ...initial };
  }

  getState(): AppState {
    return this.state;
  }

  setState(partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)): void {
    const nextPartial = typeof partial === 'function' ? partial(this.state) : partial;
    this.state = { ...this.state, ...nextPartial };
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private logAction(action: string, payload?: unknown): void {
    this.actionHistory.push({ action, payload, timestamp: Date.now() });
    if (this.actionHistory.length > 100) {
      this.actionHistory.shift();
    }
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Store] ${action}`, payload);
    }
  }

  getActionHistory() {
    return [...this.actionHistory];
  }
}

const store = new Store(initialState);

// ============================================================================
// Actions
// ============================================================================

export const actions: AppActions = {
  // API Keys
  setApiKey: (provider, key) => {
    store.setState((state) => ({
      apiKeys: { ...state.apiKeys, [provider]: key },
    }));
  },

  setApiKeys: (keys) => {
    store.setState((state) => ({
      apiKeys: { ...state.apiKeys, ...keys },
    }));
  },

  // Generation
  setTopic: (topic) => {
    store.setState({ currentTopic: topic });
  },

  startGeneration: () => {
    store.setState({
      generationStatus: 'generating',
      generationProgress: {
        stage: 'initializing',
        progress: 0,
        message: 'Starting generation...',
        startedAt: Date.now(),
      },
      generationError: null,
      currentContract: null,
    });
  },

  updateProgress: (progress) => {
    store.setState({ generationProgress: progress });
  },

  completeGeneration: (contract) => {
    const state = store.getState();
    const historyEntry: GenerationHistory = {
      id: `gen-${Date.now()}`,
      topic: state.currentTopic,
      status: 'success',
      contract,
      createdAt: state.generationProgress?.startedAt || Date.now(),
      completedAt: Date.now(),
      config: {
        provider: state.provider,
        model: state.model,
      },
    };

    store.setState({
      generationStatus: 'success',
      currentContract: contract,
      generationProgress: {
        ...state.generationProgress!,
        stage: 'complete',
        progress: 100,
        message: 'Generation complete!',
        completedAt: Date.now(),
      },
      history: [historyEntry, ...state.history].slice(0, 50),
    });
  },

  failGeneration: (error) => {
    store.setState({
      generationStatus: 'error',
      generationError: error,
      generationProgress: null,
    });
  },

  resetGeneration: () => {
    store.setState({
      generationStatus: 'idle',
      generationProgress: null,
      currentContract: null,
      generationError: null,
    });
  },

  // History
  addToHistory: (entry) => {
    store.setState((state) => ({
      history: [entry, ...state.history].slice(0, 50),
    }));
  },

  clearHistory: () => {
    store.setState({ history: [] });
  },

  removeFromHistory: (id) => {
    store.setState((state) => ({
      history: state.history.filter((h) => h.id !== id),
    }));
  },

  // UI
  setActiveTab: (tab) => {
    store.setState({ activeTab: tab });
  },

  toggleSidebar: () => {
    store.setState((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setTheme: (theme) => {
    store.setState({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  },

  // Config
  setProvider: (provider) => {
    store.setState({ provider });
  },

  setModel: (model) => {
    store.setState({ model });
  },

  setTemperature: (temp) => {
    store.setState({ temperature: Math.max(0, Math.min(2, temp)) });
  },

  // WordPress
  setWpConfig: (config) => {
    store.setState((state) => ({
      wpConfig: { ...state.wpConfig, ...config },
    }));
  },

  // Persistence
  hydrate: () => {
    try {
      const saved = localStorage.getItem('wp-optimizer-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        store.setState({
          apiKeys: parsed.apiKeys || initialState.apiKeys,
          theme: parsed.theme || 'system',
          provider: parsed.provider || 'google',
          model: parsed.model || 'gemini-2.5-flash-preview-05-20',
          temperature: parsed.temperature ?? 0.7,
          wpConfig: parsed.wpConfig || initialState.wpConfig,
          history: parsed.history || [],
        });
      }
    } catch (e) {
      console.error('[Store] Failed to hydrate:', e);
    }
  },

  persist: () => {
    try {
      const state = store.getState();
      const toSave = {
        apiKeys: state.apiKeys,
        theme: state.theme,
        provider: state.provider,
        model: state.model,
        temperature: state.temperature,
        wpConfig: state.wpConfig,
        history: state.history.slice(0, 20),
      };
      localStorage.setItem('wp-optimizer-state', JSON.stringify(toSave));
    } catch (e) {
      console.error('[Store] Failed to persist:', e);
    }
  },
};

// ============================================================================
// Hooks & Selectors
// ============================================================================

export function useStore<T>(selector: Selector<T>): T {
  return selector(store.getState());
}

export function subscribe(listener: Listener): () => void {
  return store.subscribe(listener);
}

export function getState(): AppState {
  return store.getState();
}

// Computed selectors
export const selectors = {
  isGenerating: (state: AppState) => state.generationStatus === 'generating',
  hasApiKey: (provider: string) => (state: AppState) => !!state.apiKeys[provider as keyof APIKeyConfig],
  progressPercent: (state: AppState) => state.generationProgress?.progress ?? 0,
  recentHistory: (limit = 5) => (state: AppState) => state.history.slice(0, limit),
  wordCount: (state: AppState) => state.currentContract?.wordCount ?? 0,
};

// ============================================================================
// Exports
// ============================================================================

export { store };
export default { store, actions, selectors, useStore, subscribe, getState };
