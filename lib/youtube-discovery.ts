// ═══════════════════════════════════════════════════════════════════════════════
// WP OPTIMIZER PRO v38.0 — YOUTUBE DISCOVERY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export interface YouTubeVideoData {
    videoId: string;
    title: string;
    channel: string;
    views: number;
    duration?: string;
    thumbnailUrl: string;
    embedUrl: string;
    relevanceScore: number;
    description?: string;
}

type LogFunction = (msg: string, progress?: number) => void;

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function extractYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return match[1];
    }
    return null;
}

function parseViewCount(viewString: string | number | undefined): number {
    if (!viewString) return 0;
    if (typeof viewString === 'number') return viewString;
    const str = viewString.toString().toLowerCase().replace(/,/g, '');
    const multipliers: Record<string, number> = { 'k': 1000, 'm': 1000000, 'b': 1000000000 };
    for (const [suffix, mult] of Object.entries(multipliers)) {
        if (str.includes(suffix)) return Math.round(parseFloat(str.replace(/[^0-9.]/g, '')) * mult);
    }
    return parseInt(str.replace(/[^0-9]/g, '')) || 0;
}

export async function searchYouTubeVideo(
    topic: string,
    serperApiKey: string,
    log: LogFunction
): Promise<YouTubeVideoData | null> {
    
    // CRITICAL DEBUG LOGGING
    log(`   🎬 YOUTUBE DISCOVERY ENGINE`);
    log(`      → Topic: "${topic.substring(0, 50)}..."`);
    log(`      → Serper Key: ${serperApiKey ? `✅ (${serperApiKey.substring(0, 8)}...)` : '❌ MISSING!'}`);
    
    if (!serperApiKey) {
        log(`   ❌ ABORT: No Serper API key provided!`);
        return null;
    }
    
    if (!topic || topic.trim().length < 3) {
        log(`   ❌ ABORT: Invalid topic`);
        return null;
    }
    
    const currentYear = new Date().getFullYear();
    
    const queries = [
        `${topic} tutorial guide`,
        `${topic} explained ${currentYear}`,
        `${topic} how to`,
        `best ${topic} tutorial`,
        `${topic} for beginners`
    ];
    
    const allVideos: YouTubeVideoData[] = [];
    
    for (const query of queries) {
        log(`      → Searching: "${query.substring(0, 40)}..."`);
        
        try {
            const response = await fetch('https://google.serper.dev/videos', {
                method: 'POST',
                headers: { 
                    'X-API-KEY': serperApiKey, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    q: query, 
                    gl: 'us', 
                    hl: 'en', 
                    num: 10 
                })
            });
            
            log(`      → Response status: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                log(`      ❌ API Error: ${response.status} - ${errorText.substring(0, 100)}`);
                continue;
            }
            
            const data = await response.json();
            log(`      → Videos returned: ${data.videos?.length || 0}`);
            
            if (!data.videos || !Array.isArray(data.videos)) {
                log(`      ⚠️ No videos array in response`);
                continue;
            }
            
            for (const video of data.videos) {
                // Must be YouTube
                if (!video.link?.includes('youtube.com') && !video.link?.includes('youtu.be')) {
                    continue;
                }
                
                const videoId = extractYouTubeVideoId(video.link);
                if (!videoId) {
                    log(`      ⚠️ Could not extract videoId from: ${video.link}`);
                    continue;
                }
                
                // Skip duplicates
                if (allVideos.some(v => v.videoId === videoId)) continue;
                
                const views = parseViewCount(video.views);
                
                // Lower threshold to 1000 views
                if (views < 1000) {
                    continue;
                }
                
                // Calculate relevance score
                const titleLower = (video.title || '').toLowerCase();
                const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                const matchingWords = topicWords.filter(w => titleLower.includes(w)).length;
                
                let relevanceScore = 50 + Math.min(30, (matchingWords / Math.max(topicWords.length, 1)) * 30);
                
                if (views >= 1000000) relevanceScore += 20;
                else if (views >= 100000) relevanceScore += 15;
                else if (views >= 50000) relevanceScore += 10;
                else if (views >= 10000) relevanceScore += 5;
                
                const videoData: YouTubeVideoData = {
                    videoId,
                    title: video.title || 'Video',
                    channel: video.channel || 'Unknown',
                    views,
                    duration: video.duration,
                    thumbnailUrl: video.imageUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                    embedUrl: `https://www.youtube.com/embed/${videoId}`,
                    relevanceScore: Math.min(100, relevanceScore),
                    description: video.snippet
                };
                
                allVideos.push(videoData);
                log(`      ✓ Found: "${videoData.title.substring(0, 40)}..." (${views.toLocaleString()} views, score: ${videoData.relevanceScore})`);
            }
            
            // If we have enough good videos, stop searching
            if (allVideos.filter(v => v.relevanceScore >= 60).length >= 3) {
                log(`      ✓ Found enough high-quality videos`);
                break;
            }
            
        } catch (err: any) {
            log(`      ❌ Error: ${err.message}`);
        }
        
        await sleep(300);
    }
    
    // Sort by relevance
    allVideos.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    log(`   📊 Total videos found: ${allVideos.length}`);
    
    if (allVideos.length === 0) {
        log(`   ⚠️ No suitable YouTube videos found`);
        return null;
    }
    
    const best = allVideos[0];
    log(`   ✅ SELECTED: "${best.title.substring(0, 50)}..."`);
    log(`      → videoId: ${best.videoId}`);
    log(`      → channel: ${best.channel}`);
    log(`      → views: ${best.views.toLocaleString()}`);
    log(`      → score: ${best.relevanceScore}`);
    
    return best;
}

export default searchYouTubeVideo;

