// ═══════════════════════════════════════════════════════════════════════════════
// WP OPTIMIZER PRO v39.0 — TEXT-AWARE LINK INJECTOR
// ═══════════════════════════════════════════════════════════════════════════════

import { InternalLinkTarget, InternalLinkResult } from '../types';

export const TEXT_AWARE_INJECTOR_VERSION = "39.0.0";

type LogFunction = (msg: string) => void;

const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'this', 'that', 'these', 'those', 'it', 'its', 'your', 'you', 'we', 'they',
    'here', 'there', 'when', 'where', 'what', 'which', 'who', 'how', 'why'
]);

const BAD_ANCHORS = [
    'click here', 'read more', 'learn more', 'check out', 'find out',
    'this article', 'this post', 'this guide', 'click this', 'see here'
];

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function escapeHtml(str: string): string {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function countWords(text: string): number {
    if (!text) return 0;
    return text.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
}

function extractKeywords(title: string): string[] {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 4 && !STOP_WORDS.has(w));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 FIND CONTEXTUAL ANCHOR TEXT
// ═══════════════════════════════════════════════════════════════════════════════

function findContextualAnchor(
    paragraphText: string,
    target: InternalLinkTarget,
    log: LogFunction
): string {
    if (!paragraphText || !target?.title) return '';
    
    const textLower = paragraphText.toLowerCase();
    const keywords = extractKeywords(target.title);
    
    if (keywords.length === 0) return '';
    
    // Split into sentences
    const sentences = paragraphText.split(/[.!?]+/).filter(s => s.trim().length > 30);
    
    for (const keyword of keywords) {
        for (const sentence of sentences) {
            const sentLower = sentence.toLowerCase();
            const kwIdx = sentLower.indexOf(keyword);
            
            if (kwIdx === -1) continue;
            
            const words = sentence.trim().split(/\s+/);
            const wordsLower = sentLower.trim().split(/\s+/);
            
            // Find word containing keyword
            let kwWordIdx = -1;
            for (let i = 0; i < wordsLower.length; i++) {
                if (wordsLower[i].includes(keyword)) {
                    kwWordIdx = i;
                    break;
                }
            }
            
            if (kwWordIdx === -1) continue;
            
            // Extract 3-6 word phrase around keyword
            for (let len = 6; len >= 3; len--) {
                for (let offset = 0; offset < len; offset++) {
                    const start = Math.max(0, kwWordIdx - offset);
                    const end = Math.min(words.length, start + len);
                    
                    if (end - start < 3) continue;
                    
                    let phrase = words.slice(start, end).join(' ')
                        .replace(/^[^a-zA-Z0-9]+/, '')
                        .replace(/[^a-zA-Z0-9]+$/, '')
                        .trim();
                    
                    if (phrase.length < 15 || phrase.length > 60) continue;
                    
                    const wordCount = phrase.split(/\s+/).length;
                    if (wordCount < 3 || wordCount > 7) continue;
                    
                    const firstWord = phrase.split(/\s+/)[0].toLowerCase();
                    const lastWord = phrase.split(/\s+/).pop()?.toLowerCase() || '';
                    
                    if (STOP_WORDS.has(firstWord) || STOP_WORDS.has(lastWord)) continue;
                    
                    const phraseLower = phrase.toLowerCase();
                    if (BAD_ANCHORS.some(b => phraseLower.includes(b))) continue;
                    
                    // Find exact match in original text
                    const exactIdx = paragraphText.toLowerCase().indexOf(phrase.toLowerCase());
                    if (exactIdx >= 0) {
                        const exactPhrase = paragraphText.substring(exactIdx, exactIdx + phrase.length);
                        return exactPhrase;
                    }
                }
            }
        }
    }
    
    return '';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔗 MAIN INJECTION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export function injectLinksIntoContent(
    html: string,
    linkTargets: InternalLinkTarget[],
    currentUrl: string,
    log: LogFunction,
    options: {
        maxTotal?: number;
        maxPerSection?: number;
        minWordsBetween?: number;
    } = {}
): { html: string; linksAdded: InternalLinkResult[]; totalLinks: number } {
    const {
        maxTotal = 15,
        maxPerSection = 2,
        minWordsBetween = 120
    } = options;
    
    log(`🔗 TEXT-AWARE LINK INJECTOR v${TEXT_AWARE_INJECTOR_VERSION}`);
    
    if (!html || !linkTargets || linkTargets.length === 0) {
        return { html: html || '', linksAdded: [], totalLinks: 0 };
    }
    
    const linksAdded: InternalLinkResult[] = [];
    
    const validTargets = linkTargets.filter(t => 
        t?.url && t?.title && t.title.length >= 10 && (!currentUrl || t.url !== currentUrl)
    ).slice(0, 30);
    
    if (validTargets.length === 0) {
        return { html, linksAdded: [], totalLinks: 0 };
    }
    
    // Split by H2 sections
    const parts = html.split(/(<h2[^>]*>)/gi);
    
    let totalLinksAdded = 0;
    let targetIdx = 0;
    let lastLinkWordPos = 0;
    let currentWordPos = 0;
    
    const processed = parts.map((part, partIdx) => {
        if (part.match(/<h2/i) || partIdx === 0) {
            currentWordPos += countWords(part);
            return part;
        }
        
        if (totalLinksAdded >= maxTotal) {
            currentWordPos += countWords(part);
            return part;
        }
        
        let sectionLinks = 0;
        let processedPart = part;
        
        // Find paragraphs
        const paraRegex = /<p[^>]*>([\s\S]{60,}?)<\/p>/gi;
        let match;
        const paras: Array<{ full: string; plain: string; pos: number }> = [];
        
        while ((match = paraRegex.exec(part)) !== null) {
            const plain = match[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            if (plain.length >= 60) {
                paras.push({ full: match[0], plain, pos: match.index });
            }
        }
        
        for (const para of paras) {
            if (sectionLinks >= maxPerSection || totalLinksAdded >= maxTotal) break;
            
            const paraWordPos = currentWordPos + countWords(part.substring(0, para.pos));
            
            if (paraWordPos - lastLinkWordPos < minWordsBetween && linksAdded.length > 0) {
                continue;
            }
            
            // Try targets
            let inserted = false;
            for (let t = targetIdx; t < Math.min(targetIdx + 5, validTargets.length) && !inserted; t++) {
                const target = validTargets[t];
                
                if (linksAdded.some(l => l.url === target.url)) continue;
                
                const anchor = findContextualAnchor(para.plain, target, log);
                
                if (!anchor || anchor.length < 15) continue;
                
                const link = `<a href="${escapeHtml(target.url)}" title="${escapeHtml(target.title)}" style="color: #6366f1 !important; font-weight: 600 !important; text-decoration: underline !important;">${anchor}</a>`;
                
                const escaped = anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(?<!<[^>]*)\\b${escaped}\\b(?![^<]*>)`, 'i');
                
                if (!para.full.match(regex) || para.full.includes(`>${anchor}</a>`)) continue;
                
                const newPara = para.full.replace(regex, link);
                
                if (newPara !== para.full) {
                    processedPart = processedPart.replace(para.full, newPara);
                    
                    linksAdded.push({
                        url: target.url,
                        anchorText: anchor,
                        relevanceScore: 0.9,
                        position: paraWordPos
                    });
                    
                    sectionLinks++;
                    totalLinksAdded++;
                    lastLinkWordPos = paraWordPos;
                    inserted = true;
                    
                    log(`   ✅ Link: "${anchor}" → ${target.url.substring(0, 50)}...`);
                }
            }
            
            targetIdx++;
        }
        
        currentWordPos += countWords(part);
        return processedPart;
    });
    
    log(`   🔗 Total: ${totalLinksAdded} links`);
    
    return {
        html: processed.join(''),
        linksAdded,
        totalLinks: totalLinksAdded
    };
}

export default {
    TEXT_AWARE_INJECTOR_VERSION,
    injectLinksIntoContent
};
