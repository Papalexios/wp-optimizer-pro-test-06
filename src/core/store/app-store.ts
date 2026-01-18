/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Enterprise-Grade Zustand State Management Store v40.0
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SOTA Features:
 * - Immutable state updates with Immer
 * - Middleware support (logging, persistence, devtools)
 * - Computed/derived state
 * - Action history for debugging
 * - Type-safe selectors
 * - Performance optimizations
 * - LocalStorage persistence
 * 
 * @module src/core/store/app-store
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  AppState,
  SiteContext,
  OptimizationOptions,
  ContentStrategyMetrics,
  PageQueueItem,
  ActivityLogEntry,
  AnalyticsMetrics,
  APIKeyConfig,
  SessionStatistics,
  QuickOptimizeRequest,
  QuickOptimizeResult,
  BulkOptimizationProgress,
  SitemapCrawlResult,
  OptimizationMode,
  QueueStatus,
  ActivityStatus
} from '../../../types';

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT STATE VALUES
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_SITE_CONTEXT: SiteContext = {
  organizationName: '',
  authorName: '',
  industry: 'other',
  targetAudience: {
    persona: '',
    experienceLevel: 'intermediate'
  }
};

const DEFAULT_OPTIMIZATION_OPTIONS: OptimizationOptions = {
  mode: 'surgical',
  preserveImages: true,
  optimizeAltText: true,
  keepFeaturedImage: true,
  keepCategories: true,
  keepTags: true,
  enableEntityGapAnalysis: true,
  enableReferenceDiscovery: true
};

const DEFAULT_CONTENT_STRATEGY: ContentStrategyMetrics = {
  totalPages: 0,
  atTarget: 0,
  processing: 0,
  avgScore: 0,
  completed: 0,
  totalWords: 0,
  successRate: 100
};

const DEFAULT_SESSION: SessionStatistics = {
  sessionId: `session_${Date.now()}`,
  startTime: Date.now(),
  pagesProcessed: 0,
  pagesImproved: 0,
  wordsGenerated: 0,
  successRate: 100,
  avgDuration: 0,
  avgScoreImprovement: 0
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

interface WPOptimizerStore extends AppState {
  // ───────────────────────────────────────────────────────────────────────
  // Site Context Actions
  // ───────────────────────────────────────────────────────────────────────
  setSiteContext: (context: Partial<SiteContext>) => void;
  updateSiteContext: (updates: Partial<SiteContext>) => void;
  resetSiteContext: () => void;

  // ───────────────────────────────────────────────────────────────────────
  // Optimization Options Actions
  // ───────────────────────────────────────────────────────────────────────
  setOptimizationMode: (mode: OptimizationMode) => void;
  togglePreserveImages: () => void;
  toggleOptimizeAltText: () => void;
  toggleKeepFeaturedImage: () => void;
  toggleKeepCategories: () => void;
  toggleKeepTags: () => void;
  toggleEntityGapAnalysis: () => void;
  toggleReferenceDiscovery: () => void;
  setTargetKeyword: (keyword: string) => void;
  updateOptimizationOptions: (options: Partial<OptimizationOptions>) => void;
  resetOptimizationOptions: () => void;

  // ───────────────────────────────────────────────────────────────────────
  // Content Strategy Actions
  // ───────────────────────────────────────────────────────────────────────
  updateContentStrategy: (metrics: Partial<ContentStrategyMetrics>) => void;
  incrementProcessing: () => void;
  decrementProcessing: () => void;
  incrementCompleted: () => void;
  incrementAtTarget: () => void;
  updateAvgScore: (newScore: number) => void;
  addWords: (count: number) => void;
  recalculateSuccessRate: () => void;

  // ───────────────────────────────────────────────────────────────────────
  // Page Queue Actions
  // ───────────────────────────────────────────────────────────────────────
  addToQueue: (item: Omit<PageQueueItem, 'id' | 'addedAt' | 'retryCount'>) => void;
  addBulkToQueue: (urls: string[], options?: Partial<OptimizationOptions>) => void;
  updateQueueItem: (id: string, updates: Partial<PageQueueItem>) => void;
  setQueueItemStatus: (id: string, status: QueueStatus) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  clearCompletedQueue: () => void;
  getNextPendingItem: () => PageQueueItem | undefined;
  getQueueProgress: () => BulkOptimizationProgress;

  // ───────────────────────────────────────────────────────────────────────
  // Activity Log Actions
  // ───────────────────────────────────────────────────────────────────────
  addActivityLog: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
  clearActivityLog: () => void;
  getActivityLogByStatus: (status: ActivityStatus) => ActivityLogEntry[];
  getRecentActivity: (limit: number) => ActivityLogEntry[];

  // ───────────────────────────────────────────────────────────────────────
  // Analytics Actions
  // ───────────────────────────────────────────────────────────────────────
  updateAnalytics: (metrics: Partial<AnalyticsMetrics>) => void;
  addRecentJob: (job: any) => void;
  updateSessionStats: (stats: Partial<SessionStatistics>) => void;
  resetSession: () => void;

  // ───────────────────────────────────────────────────────────────────────
  // API Keys Actions
  // ───────────────────────────────────────────────────────────────────────
  setApiKeys: (keys: Partial<APIKeyConfig>) => void;
  updateApiKey: (provider: keyof APIKeyConfig, value: string) => void;

  // ───────────────────────────────────────────────────────────────────────
  // Processing State Actions
  // ───────────────────────────────────────────────────────────────────────
  setProcessing: (isProcessing: boolean) => void;
  startProcessing: () => void;
  stopProcessing: () => void;

  // ───────────────────────────────────────────────────────────────────────
  // Utility Actions
  // ───────────────────────────────────────────────────────────────────────
  resetStore: () => void;
  exportState: () => string;
  importState: (stateJson: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// ZUSTAND STORE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export const useAppStore = create<WPOptimizerStore>()(
  devtools(
    persist(
      immer(
        subscribeWithSelector((set, get) => ({
          // Initial State
          siteContext: DEFAULT_SITE_CONTEXT,
          optimizationOptions: DEFAULT_OPTIMIZATION_OPTIONS,
          contentStrategy: DEFAULT_CONTENT_STRATEGY,
          pageQueue: [],
          activityLog: [],
          analytics: {
            ...DEFAULT_CONTENT_STRATEGY,
            sessionStats: DEFAULT_SESSION,
            recentJobs: [],
            trendData: []
          },
          apiKeys: {},
          currentSession: DEFAULT_SESSION,
          isProcessing: false,

          // Site Context Actions
          setSiteContext: (context) => set({ siteContext: { ...DEFAULT_SITE_CONTEXT, ...context } }),
          updateSiteContext: (updates) => set((state) => ({ siteContext: { ...state.siteContext, ...updates } })),
          resetSiteContext: () => set({ siteContext: DEFAULT_SITE_CONTEXT }),

          // Optimization Options Actions
          setOptimizationMode: (mode) => set((state) => ({ optimizationOptions: { ...state.optimizationOptions, mode } })),
          togglePreserveImages: () => set((state) => ({ optimizationOptions: { ...state.optimizationOptions, preserveImages: !state.optimizationOptions.preserveImages } })),
          toggleOptimizeAltText: () => set((state) => ({ optimizationOptions: { ...state.optimizationOptions, optimizeAltText: !state.optimizationOptions.optimizeAltText } })),
          toggleKeepFeaturedImage: () => set((state) => ({ optimizationOptions: { ...state.optimizationOptions, keepFeaturedImage: !state.optimizationOptions.keepFeaturedImage } })),
          toggleKeepCategories: () => set((state) => ({ optimizationOptions: { ...state.optimizationOptions, keepCategories: !state.optimizationOptions.keepCategories } })),
          toggleKeepTags: () => set((state) => ({ optimizationOptions: { ...state.optimizationOptions, keepTags: !state.optimizationOptions.keepTags } })),
          toggleEntityGapAnalysis: () => set((state) => ({ optimizationOptions: { ...state.optimizationOptions, enableEntityGapAnalysis: !state.optimizationOptions.enableEntityGapAnalysis } })),
          toggleReferenceDiscovery: () => set((state) => ({ optimizationOptions: { ...state.optimizationOptions, enableReferenceDiscovery: !state.optimizationOptions.enableReferenceDiscovery } })),
          setTargetKeyword: (keyword) => set((state) => ({ optimizationOptions: { ...state.optimizationOptions, targetKeyword: keyword } })),
          updateOptimizationOptions: (options) => set((state) => ({ optimizationOptions: { ...state.optimizationOptions, ...options } })),
          resetOptimizationOptions: () => set({ optimizationOptions: DEFAULT_OPTIMIZATION_OPTIONS }),

          // Content Strategy Actions
          updateContentStrategy: (metrics) => set((state) => ({ contentStrategy: { ...state.contentStrategy, ...metrics } })),
          incrementProcessing: () => set((state) => ({ contentStrategy: { ...state.contentStrategy, processing: state.contentStrategy.processing + 1 } })),
          decrementProcessing: () => set((state) => ({ contentStrategy: { ...state.contentStrategy, processing: Math.max(0, state.contentStrategy.processing - 1) } })),
          incrementCompleted: () => set((state) => ({ contentStrategy: { ...state.contentStrategy, completed: state.contentStrategy.completed + 1 } })),
          incrementAtTarget: () => set((state) => ({ contentStrategy: { ...state.contentStrategy, atTarget: state.contentStrategy.atTarget + 1 } })),
          updateAvgScore: (newScore) => set((state) => {
            const total = state.contentStrategy.completed + 1;
            const avgScore = ((state.contentStrategy.avgScore * state.contentStrategy.completed) + newScore) / total;
            return { contentStrategy: { ...state.contentStrategy, avgScore } };
          }),
          addWords: (count) => set((state) => ({ contentStrategy: { ...state.contentStrategy, totalWords: state.contentStrategy.totalWords + count } })),
          recalculateSuccessRate: () => set((state) => {
            const total = state.contentStrategy.completed;
            const successful = state.activityLog.filter(log => log.status === 'success').length;
            const successRate = total > 0 ? (successful / total) * 100 : 100;
            return { contentStrategy: { ...state.contentStrategy, successRate } };
          }),

          // Page Queue Actions
          addToQueue: (item) => set((state) => ({
            pageQueue: [...state.pageQueue, { ...item, id: `queue_${Date.now()}_${Math.random()}`, addedAt: Date.now(), retryCount: 0 }]
          })),
          addBulkToQueue: (urls, options) => set((state) => {
            const newItems = urls.map((url, index) => ({
              url,
              status: 'pending' as QueueStatus,
              priority: index,
              optimizationOptions: { ...state.optimizationOptions, ...(options || {}) },
              id: `queue_${Date.now()}_${index}`,
              addedAt: Date.now(),
              retryCount: 0
            }));
            return { pageQueue: [...state.pageQueue, ...newItems] };
          }),
          updateQueueItem: (id, updates) => set((state) => ({
            pageQueue: state.pageQueue.map(item => item.id === id ? { ...item, ...updates } : item)
          })),
          setQueueItemStatus: (id, status) => set((state) => ({
            pageQueue: state.pageQueue.map(item => item.id === id ? { ...item, status } : item)
          })),
          removeFromQueue: (id) => set((state) => ({ pageQueue: state.pageQueue.filter(item => item.id !== id) })),
          clearQueue: () => set({ pageQueue: [] }),
          clearCompletedQueue: () => set((state) => ({ pageQueue: state.pageQueue.filter(item => item.status !== 'completed') })),
          getNextPendingItem: () => get().pageQueue.find(item => item.status === 'pending'),
          getQueueProgress: () => {
            const queue = get().pageQueue;
            return {
              total: queue.length,
              pending: queue.filter(i => i.status === 'pending').length,
              processing: queue.filter(i => i.status === 'processing').length,
              completed: queue.filter(i => i.status === 'completed').length,
              failed: queue.filter(i => i.status === 'failed').length,
              currentItems: queue
            };
          },

          // Activity Log Actions
          addActivityLog: (entry) => set((state) => ({
            activityLog: [{ ...entry, id: `log_${Date.now()}`, timestamp: Date.now() }, ...state.activityLog].slice(0, 1000)
          })),
          clearActivityLog: () => set({ activityLog: [] }),
          getActivityLogByStatus: (status) => get().activityLog.filter(log => log.status === status),
          getRecentActivity: (limit) => get().activityLog.slice(0, limit),

          // Analytics Actions
          updateAnalytics: (metrics) => set((state) => ({ analytics: { ...state.analytics, ...metrics } })),
          addRecentJob: (job) => set((state) => ({ analytics: { ...state.analytics, recentJobs: [job, ...state.analytics.recentJobs].slice(0, 20) } })),
          updateSessionStats: (stats) => set((state) => ({ currentSession: { ...state.currentSession, ...stats } })),
          resetSession: () => set({ currentSession: { ...DEFAULT_SESSION, sessionId: `session_${Date.now()}`, startTime: Date.now() } }),

          // API Keys Actions
          setApiKeys: (keys) => set({ apiKeys: keys }),
          updateApiKey: (provider, value) => set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: value } })),

          // Processing State
          setProcessing: (isProcessing) => set({ isProcessing }),
          startProcessing: () => set({ isProcessing: true }),
          stopProcessing: () => set({ isProcessing: false }),

          // Utility Actions
          resetStore: () => set({
            siteContext: DEFAULT_SITE_CONTEXT,
            optimizationOptions: DEFAULT_OPTIMIZATION_OPTIONS,
            contentStrategy: DEFAULT_CONTENT_STRATEGY,
            pageQueue: [],
            activityLog: [],
            apiKeys: {},
            isProcessing: false
          }),
          exportState: () => JSON.stringify(get()),
          importState: (stateJson) => set(JSON.parse(stateJson))
        }))
      ),
      { name: 'wp-optimizer-pro-storage' }
    )
  )
);
