// ═══════════════════════════════════════════════════════════════════════════════
// WP OPTIMIZER PRO v39.0 — UNIFIED TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const APP_VERSION = "39.0.0";

// ═══════════════════════════════════════════════════════════════════════════════
// 🔑 API KEY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface APIKeyConfig {
    google?: string;
    openrouter?: string;
    openrouterModel?: string;
    openai?: string;
    anthropic?: string;
    groq?: string;
    groqModel?: string;
    serper?: string;
}

export interface ApiKeys extends APIKeyConfig {}

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 CONTENT CONTRACT
// ═══════════════════════════════════════════════════════════════════════════════

export interface ContentContract {
    title: string;
    metaDescription: string;
    slug: string;
    htmlContent: string;
    excerpt: string;
    wordCount: number;
    faqs?: FAQItem[];
    tableOfContents?: TOCItem[];
    schema?: SchemaMarkup;
    references?: ValidatedReference[];
    internalLinks?: InternalLinkResult[];
    youtubeVideo?: YouTubeVideoData;
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface TOCItem {
    id: string;
    text: string;
    level: number;
}

export interface SchemaMarkup {
    article?: object;
    faq?: object;
    howTo?: object;
    video?: object;
    breadcrumb?: object;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⚙️ GENERATION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface GenerateConfig {
    topic: string;
    provider: 'google' | 'openrouter' | 'openai' | 'anthropic' | 'groq';
    model: string;
    apiKeys: APIKeyConfig;
    internalLinks?: InternalLinkTarget[];
    existingContent?: string;
    targetWordCount?: number;
    tone?: 'professional' | 'conversational' | 'technical' | 'casual';
    includeYouTube?: boolean;
    includeReferences?: boolean;
    includeFAQs?: boolean;
    neuronTerms?: NeuronTerm[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔗 INTERNAL LINKING
// ═══════════════════════════════════════════════════════════════════════════════

export interface InternalLinkTarget {
    url: string;
    title: string;
    slug: string;
    excerpt?: string;
    categories?: string[];
    relevanceScore?: number;
    keywords?: string[];
}

export interface InternalLinkResult {
    url: string;
    anchorText: string;
    relevanceScore: number;
    position: number;
    context?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🕷️ CRAWLED PAGES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CrawledPage {
    url: string;
    title: string;
    slug: string;
    excerpt?: string;
    categories?: string[];
    wordCount?: number;
    lastModified?: string;
    healthScore?: number | null;
    seoMetrics?: SeoMetrics;
    jobState?: JobState;
    opportunity?: OpportunityScore;
    id?: string;
}

export interface SitemapPage extends CrawledPage {
    id: string;
}

export interface JobState {
    status: 'idle' | 'running' | 'completed' | 'failed';
    phase?: GodModePhase;
    progress?: number;
    message?: string;
    startTime?: number;
    endTime?: number;
    error?: string;
}

export interface OpportunityScore {
    total: number;
    seo: number;
    content: number;
    technical: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 SEO METRICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface SeoMetrics {
    wordCount: number;
    contentDepth: number;
    readability: number;
    headingStructure: number;
    aeoScore: number;
    geoScore: number;
    eeatSignals: number;
    internalLinkScore: number;
    schemaDetected: boolean;
    schemaTypes?: string[];
    h1Count?: number;
    h2Count?: number;
    h3Count?: number;
    imageCount?: number;
    imagesWithAlt?: number;
    externalLinks?: number;
    internalLinks?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ✅ QA VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface QAValidationResult {
    agent: string;
    category: 'critical' | 'seo' | 'aeo' | 'geo' | 'enhancement';
    status: 'passed' | 'failed' | 'warning';
    score: number;
    feedback: string;
    fixSuggestion?: string;
    autoFixable?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 ENTITY GAP ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

export interface EntityGapAnalysis {
    competitorEntities: string[];
    missingEntities: string[];
    topKeywords: string[];
    paaQuestions: string[];
    contentGaps: string[];
    avgWordCount: number;
    serpFeatures: SerpFeature[];
    competitorUrls: string[];
    competitors: CompetitorAnalysis[];
    recommendedWordCount: number;
    topicClusters: string[];
    semanticTerms: string[];
    validatedReferences: ValidatedReference[];
    knowledgeGraphData?: object;
    featuredSnippetOpportunity?: boolean;
    localPackPresent?: boolean;
}

export interface CompetitorAnalysis {
    url: string;
    title: string;
    wordCount: number;
    headings: string[];
    entities: string[];
    snippet?: string;
    position: number;
    domain?: string;
    hasSchema?: boolean;
    hasFAQ?: boolean;
}

export interface SerpFeature {
    type: string;
    present: boolean;
    targetable: boolean;
    content?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📚 VALIDATED REFERENCES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ValidatedReference {
    url: string;
    title: string;
    source: string;
    year?: string | number;
    snippet?: string;
    status?: number;
    isValid?: boolean;
    domain?: string;
    isAuthority?: boolean;
    authorityScore?: number;
    favicon?: string;
    author?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 YOUTUBE VIDEO
// ═══════════════════════════════════════════════════════════════════════════════

export interface YouTubeVideoData {
    videoId: string;
    title: string;
    channel: string;
    views: number;
    duration?: string;
    thumbnailUrl: string;
    embedUrl: string;
    publishedAt?: string;
    relevanceScore?: number;
    description?: string;
}

export interface YouTubeSearchResult {
    video: YouTubeVideoData | null;
    source: 'serper' | 'fallback';
    searchQuery: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧬 NEURON NLP TERMS
// ═══════════════════════════════════════════════════════════════════════════════

export interface NeuronTerm {
    term: string;
    type: 'title' | 'header' | 'basic' | 'extended';
    recommended: number;
    importance?: number;
    category?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🤖 GOD MODE PHASES
// ═══════════════════════════════════════════════════════════════════════════════

export type GodModePhase = 
    | 'idle'
    | 'initializing'
    | 'crawling'
    | 'resolving_post'
    | 'analyzing_existing'
    | 'collect_intel'
    | 'strategic_intel'
    | 'entity_gap_analysis'
    | 'reference_discovery'
    | 'reference_validation'
    | 'neuron_analysis'
    | 'competitor_deep_dive'
    | 'outline_generation'
    | 'section_drafts'
    | 'link_plan'
    | 'section_finalize'
    | 'merge_content'
    | 'prompt_assembly'
    | 'content_synthesis'
    | 'qa_validation'
    | 'auto_fix_loop'
    | 'self_improvement'
    | 'internal_linking'
    | 'schema_generation'
    | 'final_polish'
    | 'publishing'
    | 'completed'
    | 'failed';

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 BULK GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface BulkGenerationResult {
    url: string;
    status: 'success' | 'failed' | 'skipped';
    postId?: number;
    newUrl?: string;
    wordCount?: number;
    error?: string;
    duration?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔔 TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}


// ═══════════════════════════════════════════════════════════════════════════════
// 🏢 SITE CONTEXT - Organization & Audience Settings
// ═══════════════════════════════════════════════════════════════════════════════

export interface SiteContext {
  organizationName: string;
  authorName: string;
  industry: 'saas' | 'ecommerce' | 'healthcare' | 'finance' | 'education' | 'media' | 'technology' | 'professional-services' | 'real-estate' | 'other';
  targetAudience: {
    persona: string;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    region?: string;
    demographics?: string;
  };
  brandVoice?: string;
  complianceRules?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 OPTIMIZATION MODE - Surgical vs Full Rewrite
// ═══════════════════════════════════════════════════════════════════════════════

export type OptimizationMode = 'surgical' | 'full-rewrite';

export interface OptimizationOptions {
  mode: OptimizationMode;
  preserveImages: boolean;
  optimizeAltText: boolean;
  keepFeaturedImage: boolean;
  keepCategories: boolean;
  keepTags: boolean;
  targetKeyword?: string;
  enableEntityGapAnalysis: boolean;
  enableReferenceDiscovery: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 CONTENT STRATEGY METRICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ContentStrategyMetrics {
  totalPages: number;
  atTarget: number;
  processing: number;
  avgScore: number;
  completed: number;
  totalWords: number;
  successRate: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🕷️ SITEMAP CRAWLER
// ═══════════════════════════════════════════════════════════════════════════════

export interface SitemapCrawlerConfig {
  sitemapUrl: string;
  followNestedSitemaps: boolean;
  respectRobotsTxt: boolean;
  maxConcurrent: number;
  rateLimit: number;
}

export interface SitemapCrawlResult {
  pages: CrawledPage[];
  totalUrls: number;
  successfulCrawls: number;
  failedCrawls: number;
  duration: number;
  errors: Array<{
    url: string;
    error: string;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ QUICK OPTIMIZE
// ═══════════════════════════════════════════════════════════════════════════════

export interface QuickOptimizeRequest {
  pageUrl: string;
  targetKeyword?: string;
  optimizationOptions: OptimizationOptions;
  siteContext: SiteContext;
  publishMode: 'draft' | 'publish';
}

export interface QuickOptimizeResult {
  success: boolean;
  postId?: number;
  newUrl?: string;
  metricsImprovement: {
    readability: { before: number; after: number };
    seoScore: { before: number; after: number };
    wordCount: { before: number; after: number };
  };
  duration: number;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 BULK OPTIMIZATION & PAGE QUEUE
// ═══════════════════════════════════════════════════════════════════════════════

export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PageQueueItem {
  id: string;
  url: string;
  targetKeyword?: string;
  status: QueueStatus;
  priority: number;
  optimizationOptions: OptimizationOptions;
  addedAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: QuickOptimizeResult;
  error?: string;
  retryCount: number;
}

export interface BulkOptimizationConfig {
  urls: string[];
  optimizationOptions: OptimizationOptions;
  siteContext: SiteContext;
  maxConcurrent: number;
  retryStrategy: {
    maxRetries: number;
    backoffMultiplier: number;
  };
}

export interface BulkOptimizationProgress {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  currentItems: PageQueueItem[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 ACTIVITY LOG
// ═══════════════════════════════════════════════════════════════════════════════

export type ActivityStatus = 'success' | 'failed' | 'warning' | 'info';

export interface ActivityLogEntry {
  id: string;
  timestamp: number;
  pageUrl: string;
  action: 'optimize' | 'crawl' | 'analyze' | 'publish';
  status: ActivityStatus;
  mode: OptimizationMode;
  metrics: {
    previousScore?: number;
    newScore?: number;
    wordDelta?: number;
    readabilityDelta?: number;
    seoDelta?: number;
  };
  duration: number;
  error?: string;
  details?: string;
}

export interface ActivityLogFilter {
  status?: ActivityStatus[];
  action?: string[];
  dateRange?: {
    start: number;
    end: number;
  };
  searchQuery?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📈 ANALYTICS & PERFORMANCE TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

export interface SessionStatistics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  pagesProcessed: number;
  pagesImproved: number;
  wordsGenerated: number;
  successRate: number;
  avgDuration: number;
  avgScoreImprovement: number;
}

export interface RecentJob {
  id: string;
  pageUrl: string;
  mode: OptimizationMode;
  completedAt: number;
  duration: number;
  scoreChange: {
    readability: number;
    seo: number;
    overall: number;
  };
  wordDelta: number;
  status: 'success' | 'failed';
}

export interface AnalyticsMetrics extends ContentStrategyMetrics {
  sessionStats: SessionStatistics;
  recentJobs: RecentJob[];
  trendData: {
    date: string;
    pagesOptimized: number;
    avgScore: number;
    successRate: number;
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 ENTITY GAP ANALYSIS (ENHANCED)
// ═══════════════════════════════════════════════════════════════════════════════

export interface EntityAnalysisResult {
  entities: ExtractedEntity[];
  gaps: EntityGap[];
  opportunities: EntityOpportunity[];
  coverage: number;
  recommendations: string[];
}

export interface ExtractedEntity {
  text: string;
  type: 'person' | 'organization' | 'location' | 'concept' | 'product' | 'technology';
  frequency: number;
  relevance: number;
  contexts: string[];
}

export interface EntityGap {
  entity: string;
  type: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  competitorMentions: number;
  suggestedPlacement: 'introduction' | 'body' | 'conclusion';
  contextSuggestion: string;
}

export interface EntityOpportunity {
  entity: string;
  currentMentions: number;
  recommendedMentions: number;
  semanticVariants: string[];
  linkedTopics: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📚 REFERENCE DISCOVERY (ENHANCED)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ReferenceDiscoveryConfig {
  query: string;
  maxResults: number;
  sourceTypes: ('academic' | 'standards' | 'docs' | 'news' | 'internal')[];
  requireAuthority: boolean;
  minAuthorityScore: number;
}

export interface DiscoveredReference extends ValidatedReference {
  discoveryMethod: 'serp' | 'entity-link' | 'competitor' | 'internal';
  relevanceScore: number;
  citationContext: string;
  supportingEntities: string[];
}

export interface ReferenceInsertionPlan {
  reference: DiscoveredReference;
  targetSection: string;
  insertionType: 'inline-citation' | 'footnote' | 'reference-list' | 'link';
  anchorText: string;
  contextSnippet: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔬 SURGICAL MODE TRANSFORMERS
// ═══════════════════════════════════════════════════════════════════════════════

export interface SurgicalTransform {
  type: 'heading-refinement' | 'entity-insertion' | 'gap-filling' | 'grammar-fix' | 'seo-enhancement';
  section: string;
  original: string;
  transformed: string;
  confidence: number;
  similarity: number;
  reasoning: string;
}

export interface SurgicalModeResult {
  transforms: SurgicalTransform[];
  preservedSections: string[];
  overallSimilarity: number;
  changedSections: number;
  totalSections: number;
  qualityGates: {
    readability: { passed: boolean; score: number };
    seo: { passed: boolean; score: number };
    grammar: { passed: boolean; score: number };
    entityCoverage: { passed: boolean; score: number };
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🏗️ CONTENT ENGINE PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

export interface ContentPipelineStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: number;
  endTime?: number;
  output?: any;
  error?: string;
}

export interface ContentPipelineResult {
  mode: OptimizationMode;
  stages: ContentPipelineStage[];
  finalContent: ContentContract;
  metrics: SeoMetrics;
  qualityScore: number;
  duration: number;
  entityAnalysis?: EntityAnalysisResult;
  surgicalResult?: SurgicalModeResult;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🗃️ GLOBAL APP STATE
// ═══════════════════════════════════════════════════════════════════════════════

export interface AppState {
  siteContext: SiteContext;
  optimizationOptions: OptimizationOptions;
  contentStrategy: ContentStrategyMetrics;
  pageQueue: PageQueueItem[];
  activityLog: ActivityLogEntry[];
  analytics: AnalyticsMetrics;
  apiKeys: APIKeyConfig;
  currentSession: SessionStatistics;
  isProcessing: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 QUALITY GATES & VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface QualityGate {
  name: string;
  metric: keyof SeoMetrics;
  minThreshold: number;
  maxThreshold?: number;
  weight: number;
  required: boolean;
}

export interface QualityGateResult {
  gate: QualityGate;
  value: number;
  passed: boolean;
  delta?: number;
  recommendation?: string;
}

export interface QualityValidationResult {
  overallScore: number;
  passed: boolean;
  gates: QualityGateResult[];
  autoFixable: boolean;
  requiresRegeneration: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
    APP_VERSION
};
