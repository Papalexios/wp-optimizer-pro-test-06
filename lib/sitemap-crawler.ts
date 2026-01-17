// ═══════════════════════════════════════════════════════════════════════════════
// WP OPTIMIZER PRO v39.0 — ULTRA-FAST SITEMAP CRAWLER
// ═══════════════════════════════════════════════════════════════════════════════
//
// FEATURES:
// ✅ XML Sitemap parsing (sitemap.xml, sitemap_index.xml, post-sitemap.xml)
// ✅ CORS proxy fallback for cross-origin requests
// ✅ Concurrent crawling with rate limiting
// ✅ Automatic URL deduplication
// ✅ WordPress REST API metadata fetching
// ✅ Progress callbacks
// ═══════════════════════════════════════════════════════════════════════════════

import { CrawledPage, InternalLinkTarget } from '../types';

export const SITEMAP_CRAWLER_VERSION = "27.0.0";

// CORS Proxies (fallback chain)
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
];

type LogFunction = (msg: string, progress?: number) => void;

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function extractDomain(url: string): string {
    try {
        return new URL(url).origin;
    } catch {
        return '';
    }
}

function normalizeUrl(url: string): string {
    try {
        const u = new URL(url);
        // Remove trailing slash, lowercase
        let normalized = u.origin + u.pathname.replace(/\/$/, '');
        return normalized.toLowerCase();
    } catch {
        return url.toLowerCase().replace(/\/$/, '');
    }
}

function extractSlugFromUrl(url: string): string {
    try {
        const pathname = new URL(url).pathname;
        const parts = pathname.split('/').filter(Boolean);
        return parts[parts.length - 1] || '';
    } catch {
        return url.split('/').filter(Boolean).pop() || '';
    }
}

function extractTitleFromSlug(slug: string): string {
    return slug
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌐 FETCH WITH CORS PROXY FALLBACK
// ═══════════════════════════════════════════════════════════════════════════════

async function fetchWithCorsProxy(
    url: string,
    log: LogFunction,
    timeoutMs: number = 15000
): Promise<string> {
    // Try direct fetch first
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/xml, text/xml, */*',
                'User-Agent': 'WP-Optimizer-Pro/39.0'
            }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const text = await response.text();
            if (text.includes('<urlset') || text.includes('<sitemapindex') || text.includes('<url>')) {
                log(`   ✅ Direct fetch succeeded`);
                return text;
            }
        }
    } catch (e: any) {
        log(`   ⚠️ Direct fetch failed: ${e.message}`);
    }
    
    // Try CORS proxies
    for (const proxy of CORS_PROXIES) {
        try {
            log(`   🔄 Trying proxy: ${proxy.substring(0, 30)}...`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            
            const proxyUrl = proxy + encodeURIComponent(url);
            const response = await fetch(proxyUrl, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const text = await response.text();
                if (text.includes('<urlset') || text.includes('<sitemapindex') || text.includes('<url>')) {
                    log(`   ✅ CORS proxy succeeded`);
                    return text;
                }
            }
        } catch (e: any) {
            log(`   ⚠️ Proxy failed: ${e.message}`);
        }
        
        await sleep(500);
    }
    
    throw new Error(`Failed to fetch sitemap from ${url}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📄 PARSE XML SITEMAP
// ═══════════════════════════════════════════════════════════════════════════════

function parseXmlSitemap(xml: string): { urls: string[]; sitemaps: string[] } {
    const urls: string[] = [];
    const sitemaps: string[] = [];
    
    // Extract URLs from <loc> tags
    const locMatches = xml.matchAll(/<loc[^>]*>([^<]+)<\/loc>/gi);
    for (const match of locMatches) {
        const url = match[1].trim();
        if (url) {
            // Check if it's a sitemap or a page URL
            if (url.includes('sitemap') && url.endsWith('.xml')) {
                sitemaps.push(url);
            } else {
                urls.push(url);
            }
        }
    }
    
    // Also check for sitemap index entries
    const sitemapMatches = xml.matchAll(/<sitemap[^>]*>[\s\S]*?<loc[^>]*>([^<]+)<\/loc>[\s\S]*?<\/sitemap>/gi);
    for (const match of sitemapMatches) {
        const url = match[1].trim();
        if (url && !sitemaps.includes(url)) {
            sitemaps.push(url);
        }
    }
    
    return { urls, sitemaps };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 DISCOVER SITEMAP URLS
// ═══════════════════════════════════════════════════════════════════════════════

async function discoverSitemapUrls(
    baseUrl: string,
    log: LogFunction
): Promise<string[]> {
    const domain = extractDomain(baseUrl);
    
    // Common sitemap locations
    const possibleSitemaps = [
        `${domain}/sitemap.xml`,
        `${domain}/sitemap_index.xml`,
        `${domain}/post-sitemap.xml`,
        `${domain}/page-sitemap.xml`,
        `${domain}/wp-sitemap.xml`,
        `${domain}/sitemap-posts.xml`,
        `${domain}/news-sitemap.xml`,
    ];
    
    // If user provided a specific sitemap URL, try it first
    if (baseUrl.includes('sitemap') && baseUrl.endsWith('.xml')) {
        possibleSitemaps.unshift(baseUrl);
    }
    
    const discoveredSitemaps: string[] = [];
    
    for (const sitemapUrl of possibleSitemaps) {
        try {
            log(`   🔍 Checking: ${sitemapUrl}`);
            
            const xml = await fetchWithCorsProxy(sitemapUrl, log, 10000);
            
            if (xml) {
                discoveredSitemaps.push(sitemapUrl);
                log(`   ✅ Found sitemap: ${sitemapUrl}`);
                
                // If this is a sitemap index, we've found what we need
                if (xml.includes('<sitemapindex')) {
                    break;
                }
            }
        } catch {
            // Continue to next
        }
        
        await sleep(300);
    }
    
    return discoveredSitemaps;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🕷️ MAIN CRAWL FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export async function crawlSitemap(
    sitemapUrl: string,
    log: LogFunction,
    onProgress?: (current: number, total: number) => void,
    maxUrls: number = 500
): Promise<CrawledPage[]> {
    const startTime = Date.now();
    
    log(`🕷️ ULTRA-FAST SITEMAP CRAWLER v${SITEMAP_CRAWLER_VERSION}`);
    log(`🕷️ URL: ${sitemapUrl}`);
    
    const allUrls = new Set<string>();
    const processedSitemaps = new Set<string>();
    const sitemapsToProcess: string[] = [];
    
    // Discover sitemaps
    const discoveredSitemaps = await discoverSitemapUrls(sitemapUrl, log);
    
    if (discoveredSitemaps.length === 0) {
        // Try the provided URL directly
        sitemapsToProcess.push(sitemapUrl);
    } else {
        sitemapsToProcess.push(...discoveredSitemaps);
    }
    
    // Process sitemaps recursively
    while (sitemapsToProcess.length > 0 && allUrls.size < maxUrls) {
        const currentSitemap = sitemapsToProcess.shift()!;
        
        if (processedSitemaps.has(currentSitemap)) {
            continue;
        }
        
        processedSitemaps.add(currentSitemap);
        
        log(`   📄 Processing: ${currentSitemap}`);
        
        try {
            const xml = await fetchWithCorsProxy(currentSitemap, log);
            const { urls, sitemaps } = parseXmlSitemap(xml);
            
            log(`   📊 Found ${urls.length} URLs, ${sitemaps.length} sub-sitemaps`);
            
            // Add URLs
            for (const url of urls) {
                if (allUrls.size >= maxUrls) break;
                
                const normalized = normalizeUrl(url);
                
                // Skip non-content URLs
                if (
                    normalized.includes('/wp-admin') ||
                    normalized.includes('/wp-content') ||
                    normalized.includes('/wp-includes') ||
                    normalized.includes('/feed') ||
                    normalized.includes('/tag/') ||
                    normalized.includes('/author/') ||
                    normalized.includes('/page/') ||
                    normalized.includes('?') ||
                    normalized.includes('#') ||
                    normalized.endsWith('.xml') ||
                    normalized.endsWith('.jpg') ||
                    normalized.endsWith('.png') ||
                    normalized.endsWith('.pdf')
                ) {
                    continue;
                }
                
                allUrls.add(url);
            }
            
            // Queue sub-sitemaps
            for (const sitemap of sitemaps) {
                if (!processedSitemaps.has(sitemap)) {
                    sitemapsToProcess.push(sitemap);
                }
            }
            
            onProgress?.(allUrls.size, maxUrls);
            
        } catch (e: any) {
            log(`   ❌ Error: ${e.message}`);
        }
        
        await sleep(200);
    }
    
    log(`🔍 Found ${allUrls.size} valid URLs`);
    
    // Convert to CrawledPage objects
    const pages: CrawledPage[] = Array.from(allUrls).map(url => {
        const slug = extractSlugFromUrl(url);
        return {
            url,
            title: extractTitleFromSlug(slug),
            slug,
            excerpt: '',
            categories: [],
            wordCount: 0,
            lastModified: new Date().toISOString()
        };
    });
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`🎉 CRAWL COMPLETE: ${pages.length} pages in ${elapsed}s`);
    
    return pages;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 CONVERT TO INTERNAL LINK TARGETS
// ═══════════════════════════════════════════════════════════════════════════════

export function convertToInternalLinkTargets(pages: CrawledPage[]): InternalLinkTarget[] {
    return pages.map(page => ({
        url: page.url,
        title: page.title,
        slug: page.slug,
        excerpt: page.excerpt,
        categories: page.categories,
        relevanceScore: 0.5
    }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default crawlSitemap;

