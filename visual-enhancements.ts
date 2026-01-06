// SOTA VISUAL ENHANCEMENTS - Enterprise Grade Blog Post Design System
// Modern, Accessible, Performance-Optimized Styling v3.0.0

export interface BlogPostConfig {
  title: string;
  excerpt: string;
  featuredImage?: string;
  content: string;
  author?: string;
  publishDate?: string;
}

// Hero Section with Modern Gradient & Blur Effects
export function createSOTAHeroSection(config: BlogPostConfig): string {
  return `<section class="blog-hero-sota" style="
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    padding: clamp(60px, 10vw, 120px) clamp(20px, 5vw, 60px);
    text-align: center;
    overflow: hidden;
  ">
    <div style="
      position: absolute; inset: 0;
      background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15), transparent),
                  radial-gradient(circle at 70% 80%, rgba(0,0,0,0.1), transparent);
      pointer-events: none;
    "></div>
    <div style="position: relative; z-index: 1; max-width: 900px; margin: 0 auto;">
      <h1 style="
        font-size: clamp(32px, 6vw, 64px);
        font-weight: 800;
        color: white;
        margin: 0 0 20px 0;
        letter-spacing: -0.03em;
        line-height: 1.1;
      ">${config.title}</h1>
      <p style="
        font-size: clamp(16px, 2vw, 24px);
        color: rgba(255,255,255,0.9);
        margin: 0;
        line-height: 1.6;
      ">${config.excerpt}</p>
    </div>
  </section>`;
}

// Modern Card Component with Hover Effects
export function createSOTACard(title: string, content: string, icon?: string): string {
  return `<div class="sota-card" style="
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 20px;
    padding: 40px;
    margin: 24px 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  " onmouseover="this.style.borderColor='#3b82f6'; this.style.transform='translateY(-4px)'; this.style.boxShadow='0 20px 60px rgba(59, 130, 246, 0.15)';" onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'; this.style.boxShadow='none';">
    <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(99,102,241,0.03), transparent); pointer-events: none;"></div>
    ${icon ? `<div style="font-size: 48px; margin-bottom: 16px;">${icon}</div>` : ''}
    <h3 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 12px 0;">${title}</h3>
    <p style="color: #6b7280; line-height: 1.8; margin: 0;">${content}</p>
  </div>`;
}

// Reading Progress Bar
export function createReadingProgressBar(): string {
  return `<div class="reading-progress" style="
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    width: 0%;
    z-index: 1000;
    transition: width 0.2s ease;
  " id="reading-progress-bar"></div>
  <script>
    document.addEventListener('scroll', () => {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      document.getElementById('reading-progress-bar').style.width = scrolled + '%';
    });
  </script>`;
}

// Blockquote with Modern Styling
export function createSOTABlockquote(quote: string, author?: string): string {
  return `<blockquote style="
    margin: 40px 0;
    padding: 32px;
    border-left: 6px solid #667eea;
    background: linear-gradient(90deg, rgba(102,126,234,0.05), transparent);
    border-radius: 8px;
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    font-style: italic;
  ">
    &ldquo;${quote}&rdquo;
    ${author ? `<footer style="margin-top: 16px; font-size: 16px; font-weight: 400; color: #6b7280; font-style: normal;">— ${author}</footer>` : ''}
  </blockquote>`;
}

// Table of Contents with Scroll Spy
export function createTableOfContents(headings: Array<{text: string; level: number}>): string {
  const toc = headings.map((h, i) => {
    const indent = (h.level - 1) * 20;
    return `<li style="margin-left: ${indent}px; list-style: none; margin-bottom: 8px;">
      <a href="#heading-${i}" style="color: #3b82f6; text-decoration: none; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.color='#1e40af'; this.style.textDecoration='underline';" onmouseout="this.style.color='#3b82f6'; this.style.textDecoration='none';">${h.text}</a>
    </li>`;
  }).join('');
  
  return `<nav class="toc-sota" style="
    background: #f9fafb;
    padding: 24px;
    border-radius: 16px;
    margin: 40px 0;
    border: 1px solid #e5e7eb;
  ">
    <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #1f2937;">Table of Contents</h3>
    <ul style="margin: 0; padding: 0;">${toc}</ul>
  </nav>`;
}

// Call-to-Action Button with Modern Design
export function createSOTAButton(text: string, link: string, isPrimary: boolean = true): string {
  const bgColor = isPrimary ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent';
  const borderColor = isPrimary ? 'transparent' : '#667eea';
  const textColor = isPrimary ? 'white' : '#667eea';
  
  return `<a href="${link}" class="sota-btn" style="
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: ${bgColor};
    color: ${textColor};
    padding: 16px 36px;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 700;
    font-size: 16px;
    border: 2px solid ${borderColor};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 32px rgba(102, 126, 234, 0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
    ${text}
    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
  </a>`;
}

export default {
  createSOTAHeroSection,
  createSOTACard,
  createReadingProgressBar,
  createSOTABlockquote,
  createTableOfContents,
  createSOTAButton
};
