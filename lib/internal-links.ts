// ═══════════════════════════════════════════════════════════════════════════════
// WP OPTIMIZER PRO v38.0 — ENTERPRISE INTERNAL LINK ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
// 
// FEATURES:
// ✅ Contextual Rich Anchor Text (3-7 words, natural phrases)
// ✅ NLP-Lite Semantic Matching
// ✅ No Generic Fallbacks (skip if no good match)
// ✅ Position-Aware Distribution
// ═══════════════════════════════════════════════════════════════════════════════

import { InternalLinkTarget, InternalLinkResult } from '../types';

const LINK_CONFIG = {
    MAX_TOTAL: 15,
    MAX_PER_SECTION: 2,
    MIN_WORDS_BETWEEN: 150,
    MIN_ANCHOR_WORDS: 3,
    MAX_ANCHOR_WORDS: 7,
    MIN_ANCHOR_CHARS: 15,
    MAX_ANCHOR_CHARS: 60,
} as const;

// Comprehensive stop words list
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 
    'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 
    'may', 'might', 'must', 'can', 'need', 'about', 'after', 'again', 'all', 
    'any', 'because', 'before', 'between', 'both', 'during', 'each', 'few', 
    'here', 'how', 'into', 'its', 'just', 'more', 'most', 'no', 'nor', 'not', 
    'now', 'off', 'once', 'only', 'other', 'our', 'out', 'over', 'own', 'same', 
    'so', 'some', 'such', 'than', 'that', 'their', 'them', 'then', 'there', 
    'these', 'they', 'this', 'those', 'through', 'too', 'under', 'until', 'up', 
    'very', 'what', 'when', 'where', 'which', 'while', 'who', 'why', 'your',
    'i', 'me', 'my', 'myself', 'we', 'us', 'you', 'he', 'she', 'it', 'him', 'her'
]);

// Words that make BAD anchors
const BAD_ANCHOR_WORDS = new Set([
    'click', 'here', 'read', 'more', 'learn', 'visit', 'check', 'see', 'go',
    'best', 'top', 'guide', 'complete', 'ultimate', 'tips', 'ways', 'things',
    'stuff', 'really', 'actually', 'basically', 'literally', 'definitely'
]);

type LogFunction = (msg: string, progress?: number) => void;

function escapeHtml(str: string): string {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function countWords(text: string): number {
    if (!text) return 0;
    return text.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 CONTEXTUAL RICH ANCHOR TEXT FINDER — THE KEY ALGORITHM
// ═══════════════════════════════════════════════════════════════════════════════

function findContextualRichAnchor(
    paragraphText: string,
    target: InternalLinkTarget,
    log: LogFunction
): string {
    if (!paragraphText || !target?.title) return '';
    
    const textLower = paragraphText.toLowerCase();
    const titleLower = target.title.toLowerCase();
    
    // Extract meaningful keywords from target title (no stop words, 4+ chars)
    const titleKeywords = titleLower
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 4 && !STOP_WORDS.has(w) && !BAD_ANCHOR_WORDS.has(w));
    
    if (titleKeywords.length === 0) {
        log(`      ⚠️ No valid keywords in title: "${target.title}"`);
        return '';
    }
    
    // Also get keywords from slug
    const slugKeywords = target.slug 
        ? target.slug.replace(/-/g, ' ').split(/\s+/).filter(w => w.length >= 4 && !STOP_WORDS.has(w))
        : [];
    
    const allKeywords = [...new Set([...titleKeywords, ...slugKeywords])];
    
    // ═══════════════════════════════════════════════════════════════════════════
    // STRATEGY 1: Find a natural phrase containing a keyword (BEST QUALITY)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Split paragraph into sentences
    const sentences = paragraphText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    for (const keyword of allKeywords) {
        for (const sentence of sentences) {
            const sentenceLower = sentence.toLowerCase();
            const keywordIdx = sentenceLower.indexOf(keyword);
            
            if (keywordIdx === -1) continue;
            
            // Extract a natural phrase around the keyword (3-7 words)
            const words = sentence.trim().split(/\s+/);
            const wordsLower = sentenceLower.trim().split(/\s+/);
            
            // Find which word index contains the keyword
            let keywordWordIdx = -1;
            for (let i = 0; i < wordsLower.length; i++) {
                if (wordsLower[i].includes(keyword)) {
                    keywordWordIdx = i;
                    break;
                }
            }
            
            if (keywordWordIdx === -1) continue;
            
            // Try different phrase lengths (prefer longer, more natural phrases)
            for (let phraseLen = 6; phraseLen >= 3; phraseLen--) {
                // Try starting positions that include the keyword
                for (let startOffset = 0; startOffset < phraseLen; startOffset++) {
                    const startIdx = Math.max(0, keywordWordIdx - startOffset);
                    const endIdx = Math.min(words.length, startIdx + phraseLen);
                    
                    if (endIdx - startIdx < 3) continue; // Need at least 3 words
                    
                    const phraseWords = words.slice(startIdx, endIdx);
                    const phrase = phraseWords.join(' ').trim();
                    
                    // Clean up the phrase (remove leading/trailing punctuation)
                    const cleanPhrase = phrase
                        .replace(/^[^a-zA-Z0-9]+/, '')
                        .replace(/[^a-zA-Z0-9]+$/, '')
                        .trim();
                    
                    // Validate the phrase
                    if (cleanPhrase.length < LINK_CONFIG.MIN_ANCHOR_CHARS) continue;
                    if (cleanPhrase.length > LINK_CONFIG.MAX_ANCHOR_CHARS) continue;
                    
                    const phraseWordCount = cleanPhrase.split(/\s+/).length;
                    if (phraseWordCount < LINK_CONFIG.MIN_ANCHOR_WORDS) continue;
                    if (phraseWordCount > LINK_CONFIG.MAX_ANCHOR_WORDS) continue;
                    
                    // Check phrase doesn't start/end with stop words
                    const firstWord = cleanPhrase.split(/\s+/)[0].toLowerCase();
                    const lastWord = cleanPhrase.split(/\s+/).pop()?.toLowerCase() || '';
                    
                    if (STOP_WORDS.has(firstWord) || STOP_WORDS.has(lastWord)) continue;
                    if (BAD_ANCHOR_WORDS.has(firstWord) || BAD_ANCHOR_WORDS.has(lastWord)) continue;
                    
                    // Make sure the phrase actually exists in the original text
                    if (paragraphText.includes(cleanPhrase) || 
                        paragraphText.toLowerCase().includes(cleanPhrase.toLowerCase())) {
                        
                        // Find the exact case version from original text
                        const exactIdx = paragraphText.toLowerCase().indexOf(cleanPhrase.toLowerCase());
                        const exactPhrase = paragraphText.substring(exactIdx, exactIdx + cleanPhrase.length);
                        
                        log(`      ✓ Strategy 1 (Natural Phrase): "${exactPhrase}"`);
                        return exactPhrase;
                    }
                }
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // STRATEGY 2: Find keyword + context words (noun phrases)
    // ═══════════════════════════════════════════════════════════════════════════
    
    for (const keyword of allKeywords) {
        const keywordIdx = textLower.indexOf(keyword);
        if (keywordIdx === -1) continue;
        
        // Get surrounding context (50 chars before and after)
        const contextStart = Math.max(0, keywordIdx - 50);
        const contextEnd = Math.min(paragraphText.length, keywordIdx + keyword.length + 50);
        const context = paragraphText.substring(contextStart, contextEnd);
        
        // Find word boundaries around the keyword
        const contextWords = context.split(/\s+/);
        const contextLower = context.toLowerCase();
        
        // Find the keyword word index in context
        let kwIdx = -1;
        for (let i = 0; i < contextWords.length; i++) {
            if (contextWords[i].toLowerCase().includes(keyword)) {
                kwIdx = i;
                break;
            }
        }
        
        if (kwIdx === -1) continue;
        
        // Build phrase: 1-2 words before + keyword + 1-2 words after
        const phraseStart = Math.max(0, kwIdx - 2);
        const phraseEnd = Math.min(contextWords.length, kwIdx + 3);
        
        const phraseWords = contextWords.slice(phraseStart, phraseEnd);
        let phrase = phraseWords.join(' ')
            .replace(/^[^a-zA-Z0-9]+/, '')
            .replace(/[^a-zA-Z0-9]+$/, '')
            .trim();
        
        // Validate
        if (phrase.length >= LINK_CONFIG.MIN_ANCHOR_CHARS && 
            phrase.length <= LINK_CONFIG.MAX_ANCHOR_CHARS) {
            
            const wordCount = phrase.split(/\s+/).length;
            if (wordCount >= 3 && wordCount <= 7) {
                const firstWord = phrase.split(/\s+/)[0].toLowerCase();
                if (!STOP_WORDS.has(firstWord) && !BAD_ANCHOR_WORDS.has(firstWord)) {
                    log(`      ✓ Strategy 2 (Keyword Context): "${phrase}"`);
                    return phrase;
                }
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // STRATEGY 3: Find two adjacent keywords (if multiple match)
    // ═══════════════════════════════════════════════════════════════════════════
    
    for (let i = 0; i < allKeywords.length; i++) {
        for (let j = i + 1; j < allKeywords.length; j++) {
            const kw1 = allKeywords[i];
            const kw2 = allKeywords[j];
            
            // Check if both keywords appear close together
            const idx1 = textLower.indexOf(kw1);
            const idx2 = textLower.indexOf(kw2);
            
            if (idx1 === -1 || idx2 === -1) continue;
            
            const distance = Math.abs(idx2 - idx1);
            if (distance > 60) continue; // Too far apart
            
            // Extract the text between them
            const start = Math.min(idx1, idx2);
            const end = Math.max(idx1 + kw1.length, idx2 + kw2.length);
            
            // Expand to word boundaries
            let expandedStart = start;
            let expandedEnd = end;
            
            while (expandedStart > 0 && paragraphText[expandedStart - 1] !== ' ') {
                expandedStart--;
            }
            while (expandedEnd < paragraphText.length && paragraphText[expandedEnd] !== ' ') {
                expandedEnd++;
            }
            
            const phrase = paragraphText.substring(expandedStart, expandedEnd).trim()
                .replace(/^[^a-zA-Z0-9]+/, '')
                .replace(/[^a-zA-Z0-9]+$/, '');
            
            if (phrase.length >= LINK_CONFIG.MIN_ANCHOR_CHARS && 
                phrase.length <= LINK_CONFIG.MAX_ANCHOR_CHARS) {
                
                const wordCount = phrase.split(/\s+/).length;
                if (wordCount >= 3 && wordCount <= 7) {
                    log(`      ✓ Strategy 3 (Dual Keywords): "${phrase}"`);
                    return phrase;
                }
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // NO GENERIC FALLBACK — Return empty to skip this link
    // ═══════════════════════════════════════════════════════════════════════════
    
    log(`      ⚠️ No quality anchor found for: "${target.title.substring(0, 40)}..."`);
    return '';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔗 MAIN INTERNAL LINK INJECTION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export function injectInternalLinksDistributed(
    html: string,
    linkTargets: InternalLinkTarget[],
    currentUrl: string,
    log: LogFunction
): { html: string; linksAdded: InternalLinkResult[]; totalLinks: number } {
    
    log(`   🔗 INTERNAL LINK ENGINE v2.0`);
    log(`      → HTML: ${html?.length || 0} chars`);
    log(`      → Targets: ${linkTargets?.length || 0}`);
    
    if (!html || !linkTargets || !Array.isArray(linkTargets) || linkTargets.length === 0) {
        log(`   ❌ ABORT: Invalid inputs`);
        return { html: html || '', linksAdded: [], totalLinks: 0 };
    }
    
    const linksAdded: InternalLinkResult[] = [];
    
    // Filter valid targets
    const availableTargets = linkTargets.filter(t => {
        if (!t?.url || !t?.title) return false;
        if (currentUrl && t.url === currentUrl) return false;
        if (t.title.length < 10) return false; // Too short
        return true;
    }).slice(0, 30);
    
    log(`      → Valid targets: ${availableTargets.length}`);
    
    if (availableTargets.length === 0) {
        return { html, linksAdded: [], totalLinks: 0 };
    }
    
    // Split by H2 sections
    const sectionSplitRegex = /(<h2[^>]*>)/gi;
    const parts = html.split(sectionSplitRegex);
    
    let totalLinksAdded = 0;
    let targetIndex = 0;
    let lastLinkWordPos = 0;
    let currentWordPos = 0;
    
    const processedParts = parts.map((part, partIndex) => {
        // Skip H2 tags and intro
        if (part.match(/<h2/i) || partIndex === 0) {
            currentWordPos += countWords(part);
            return part;
        }
        
        // Check limits
        if (totalLinksAdded >= LINK_CONFIG.MAX_TOTAL) {
            currentWordPos += countWords(part);
            return part;
        }
        
        let sectionLinksAdded = 0;
        let processedPart = part;
        
        // Find paragraphs (min 50 chars for quality)
        const paraRegex = /<p[^>]*>([\s\S]{50,}?)<\/p>/gi;
        let match;
        const paragraphs: Array<{ full: string; text: string; plainText: string; pos: number }> = [];
        
        while ((match = paraRegex.exec(part)) !== null) {
            const plainText = match[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            if (plainText.length >= 50) {
                paragraphs.push({ 
                    full: match[0], 
                    text: match[1], 
                    plainText,
                    pos: match.index 
                });
            }
        }
        
        for (const para of paragraphs) {
            if (sectionLinksAdded >= LINK_CONFIG.MAX_PER_SECTION) break;
            if (totalLinksAdded >= LINK_CONFIG.MAX_TOTAL) break;
            
            // Check word spacing
            const paraWordPos = currentWordPos + countWords(part.substring(0, para.pos));
            if (paraWordPos - lastLinkWordPos < LINK_CONFIG.MIN_WORDS_BETWEEN && linksAdded.length > 0) {
                continue;
            }
            
            // Try multiple targets until we find a good match
            let linkInserted = false;
            for (let t = targetIndex; t < Math.min(targetIndex + 5, availableTargets.length); t++) {
                if (linkInserted) break;
                
                const target = availableTargets[t];
                
                // Skip if already used
                if (linksAdded.some(l => l.url === target.url)) continue;
                
                // Find contextual rich anchor
                const anchorText = findContextualRichAnchor(para.plainText, target, log);
                
                if (!anchorText || anchorText.length < LINK_CONFIG.MIN_ANCHOR_CHARS) continue;
                
                // Build the link HTML
                const link = `<a href="${escapeHtml(target.url)}" title="${escapeHtml(target.title)}" style="color: #6366f1 !important; font-weight: 600 !important; text-decoration: underline !important; text-underline-offset: 3px !important;">${anchorText}</a>`;
                
                // Escape anchor for regex
                const escapedAnchor = anchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const anchorRegex = new RegExp(`(?<!<[^>]*)\\b${escapedAnchor}\\b(?![^<]*>)`, 'i');
                
                // Check if anchor exists in paragraph and not already a link
                if (!para.full.match(anchorRegex)) continue;
                if (para.full.includes(`>${anchorText}</a>`)) continue;
                
                // Replace in the paragraph
                const newPara = para.full.replace(anchorRegex, link);
                
                if (newPara !== para.full) {
                    processedPart = processedPart.replace(para.full, newPara);
                    
                    linksAdded.push({ 
                        url: target.url, 
                        anchorText, 
                        relevanceScore: 0.9, 
                        position: paraWordPos 
                    });
                    
                    sectionLinksAdded++;
                    totalLinksAdded++;
                    lastLinkWordPos = paraWordPos;
                    linkInserted = true;
                    
                    log(`   ✅ Link ${totalLinksAdded}: "${anchorText}" → ${target.url.substring(0, 50)}...`);
                }
            }
            
            targetIndex++;
        }
        
        currentWordPos += countWords(part);
        return processedPart;
    });
    
    log(`   🔗 RESULT: ${totalLinksAdded} high-quality links injected`);
    
    return {
        html: processedParts.join(''),
        linksAdded,
        totalLinks: totalLinksAdded
    };
}

export default injectInternalLinksDistributed;
