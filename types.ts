export const APP_VERSION = "22.15.0";

export type Provider = 'google' | 'openrouter' | 'anthropic' | 'openai' | 'groq';
export type OptimizationMode = string;
export type PublishMode = string;
export type GodModePhase = string;

export interface FAQ {
    question: string;
    answer: string;
}

export interface FAQItem {
    question: string;
    answer: string;
    category?: string;
}

export interface HeadingInfo {
    level: number;
    text: string;
    id?: string;
    hasKeyword?: boolean;
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
}

export interface WpConfig {
    [key: string]: any;
}

export interface ApiKeys {
    [key: string]: string | undefined;
}

export interface GeoTargetConfig {
    [key: string]: any;
}

export interface OpportunityScore {
    total: number;
    factors: Record<string, number>;
    [key: string]: any;
}

export interface ImprovementHistoryEntry {
    [key: string]: any;
}

export interface GodModeJobState {
    [key: string]: any;
}

export interface CoreWebVitals {
    [key: string]: any;
}

export interface SeoMetrics {
    [key: string]: any;
}

export function createDefaultSeoMetrics(): SeoMetrics {
    return {
        wordCount: 0,
        readability: 0,
        contentDepth: 0,
        headingStructure: 0,
        aeoScore: 0,
        geoScore: 0,
        eeatSignals: 0,
        internalLinkScore: 0,
        schemaDetected: false,
        schemaTypes: [],
    };
}

export interface SitemapPage {
    id: string;
    title: string;
    slug: string;
    url?: string;
    lastMod: string | null;
    wordCount: number | null;
    crawledContent: string | null;
    healthScore: number | null;
    status: string;
    opportunity: OpportunityScore;
    improvementHistory: ImprovementHistoryEntry[];
    [key: string]: any;
}

export interface InternalLinkTarget {
    url: string;
    title: string;
    [key: string]: any;
}

export interface InternalLinkResult {
    url: string;
    anchorText: string;
    relevanceScore: number;
    [key: string]: any;
}

export interface InternalLinkAddedItem {
    url: string;
    anchorText: string;
    relevanceScore: number;
    [key: string]: any;
}

export interface InternalLinkInjectionResult {
    html: string;
    linksAdded: InternalLinkResult[];
    totalLinks: number;
    [key: string]: any;
}

export interface QAValidationResult {
    [key: string]: any;
}

export interface QASwarmResult {
    [key: string]: any;
}

export interface ScoreBreakdown {
    [key: string]: any;
}

export interface QARuleContext {
    [key: string]: any;
}

export interface QADetectionResult {
    [key: string]: any;
}

export const CURRENT_SCORE_WEIGHTS = {
    weights: {
        critical: 0.35,
        seo: 0.25,
        aeo: 0.15,
        geo: 0.15,
        enhancement: 0.10
    },
    thresholds: {
        pass: 70,
        excellent: 90
    }
};

export interface ExistingContentAnalysis {
    [key: string]: any;
}

export interface GroundingSource {
    uri: string;
    title: string;
    snippet?: string;
}

export interface ContentContract {
    title: string;
    slug: string;
    excerpt: string;
    metaDescription: string;
    htmlContent: string;
    [key: string]: any;
}

export interface CompetitorAnalysis {
    [key: string]: any;
}

export interface EntityGapAnalysis {
    [key: string]: any;
}

export interface SerpFeature {
    [key: string]: any;
}

export interface NeuronTerm {
    term: string;
    type: string;
    importance: number;
    recommended: number;
    [key: string]: any;
}

export interface NeuronAnalysisResult {
    terms: NeuronTerm[];
    targetWordCount: number;
    [key: string]: any;
}

export interface ValidatedReference {
    url: string;
    title: string;
    source: string;
    year: number | string;
    isValid: boolean;
    isAuthority: boolean;
    [key: string]: any;
}

export interface SiteContext {
    url: string;
    orgName: string;
    authorName: string;
    [key: string]: any;
}

export interface GenerateConfig {
    topic: string;
    mode: string;
    provider: string;
    siteContext: SiteContext;
    apiKeys: ApiKeys;
    [key: string]: any;
}

export interface SerpLengthPolicy {
    [key: string]: any;
}

export interface ContentOutline {
    [key: string]: any;
}

export interface SectionOutline {
    [key: string]: any;
}

export interface GeneratedSection {
    [key: string]: any;
}

export interface AutonomousConfig {
    [key: string]: any;
}

export interface CacheEntry<T = any> {
    data: T;
    timestamp: number;
    [key: string]: any;
}

export interface ProcessingLock {
    [key: string]: any;
}

export interface StageProgress {
    [key: string]: any;
}

export interface NLPInjectionResult {
    [key: string]: any;
}

export interface NLPCoverageAnalysis {
    [key: string]: any;
}

export interface SERPContentBlocks {
    [key: string]: any;
}

export interface VisualValidationResult {
    [key: string]: any;
}

export interface HumanWritingValidation {
    [key: string]: any;
}

export interface YouTubeVideo {
    [key: string]: any;
}

export interface YouTubeSearchResult {
    [key: string]: any;
}

export interface WordPressCredentials {
    [key: string]: any;
}

export interface YoastMeta {
    [key: string]: any;
}

export interface WordPressPost {
    [key: string]: any;
}

export interface AppSettings {
    [key: string]: any;
}

export interface AppState {
    [key: string]: any;
}

export default {
    APP_VERSION,
    createDefaultSeoMetrics,
    CURRENT_SCORE_WEIGHTS
};
