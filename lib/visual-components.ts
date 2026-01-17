// ═══════════════════════════════════════════════════════════════════════════════
// WP OPTIMIZER PRO v39.0 — ENTERPRISE VISUAL COMPONENTS LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════

export const VISUAL_COMPONENTS_VERSION = "39.0.0";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

export const TOKENS = {
    // Primary
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',
    primaryBg: '#eef2ff',
    primaryBorder: '#c7d2fe',

    // Success
    success: '#22c55e',
    successDark: '#16a34a',
    successBg: '#f0fdf4',
    successBorder: '#bbf7d0',

    // Warning
    warning: '#f59e0b',
    warningDark: '#d97706',
    warningBg: '#fffbeb',
    warningBorder: '#fde68a',

    // Danger
    danger: '#ef4444',
    dangerDark: '#dc2626',
    dangerBg: '#fef2f2',
    dangerBorder: '#fecaca',

    // Info
    info: '#3b82f6',
    infoDark: '#2563eb',
    infoBg: '#eff6ff',
    infoBorder: '#bfdbfe',

    // Neutrals
    white: '#ffffff',
    gray50: '#f8fafc',
    gray100: '#f1f5f9',
    gray200: '#e2e8f0',
    gray300: '#cbd5e1',
    gray400: '#94a3b8',
    gray500: '#64748b',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1e293b',
    gray900: '#0f172a',

    // Gradients
    gradPrimary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    gradSuccess: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    gradWarning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    gradDanger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    gradInfo: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    gradPurple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradTeal: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',

    // Shadows
    shadowSm: '0 1px 2px rgba(0,0,0,0.05)',
    shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
    shadowLg: '0 12px 32px rgba(0,0,0,0.12)',
    shadowXl: '0 20px 48px rgba(0,0,0,0.15)',

    // Radius
    radiusSm: '8px',
    radiusMd: '12px',
    radiusLg: '16px',
    radiusXl: '20px',
    radiusXxl: '24px',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function escapeHtml(str: string): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function truncate(str: string, max: number): string {
    if (!str || str.length <= max) return str || '';
    return str.substring(0, max - 3) + '...';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 VISUAL COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

export function createQuickAnswerBox(answer: string, title: string = 'Quick Answer'): string {
    if (!answer) return '';

    return `
<div style="background: ${TOKENS.gradPurple} !important; border-radius: ${TOKENS.radiusXl} !important; padding: 32px !important; margin: 40px 0 !important; color: ${TOKENS.white} !important; box-shadow: 0 20px 48px rgba(102,126,234,0.35) !important;">
    <div style="display: flex !important; align-items: flex-start !important; gap: 24px !important;">
        <div style="width: 64px !important; height: 64px !important; background: rgba(255,255,255,0.2) !important; border-radius: ${TOKENS.radiusLg} !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important;">
            <span style="font-size: 32px !important;">⚡</span>
        </div>
        <div style="flex: 1 !important;">
            <div style="font-size: 11px !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 2px !important; color: rgba(255,255,255,0.9) !important; margin-bottom: 10px !important;">${escapeHtml(title)}</div>
            <p style="font-size: 18px !important; line-height: 1.7 !important; color: ${TOKENS.white} !important; margin: 0 !important; font-weight: 500 !important;">${answer}</p>
        </div>
    </div>
</div>`;
}

export function createProTipBox(tip: string, title: string = 'Pro Tip'): string {
    if (!tip) return '';

    return `
<div style="background: ${TOKENS.gradTeal} !important; border-radius: ${TOKENS.radiusXl} !important; padding: 28px 32px !important; margin: 36px 0 !important; color: ${TOKENS.white} !important; box-shadow: 0 16px 36px rgba(17,153,142,0.3) !important;">
    <div style="display: flex !important; align-items: flex-start !important; gap: 20px !important;">
        <div style="width: 56px !important; height: 56px !important; background: rgba(255,255,255,0.2) !important; border-radius: ${TOKENS.radiusMd} !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important;">
            <span style="font-size: 28px !important;">💡</span>
        </div>
        <div style="flex: 1 !important;">
            <div style="font-size: 11px !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 2px !important; color: rgba(255,255,255,0.9) !important; margin-bottom: 8px !important;">${escapeHtml(title)}</div>
            <p style="font-size: 16px !important; line-height: 1.7 !important; color: ${TOKENS.white} !important; margin: 0 !important;">${tip}</p>
        </div>
    </div>
</div>`;
}

export function createWarningBox(warning: string, title: string = 'Warning'): string {
    if (!warning) return '';

    return `
<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important; border-radius: ${TOKENS.radiusXl} !important; padding: 28px 32px !important; margin: 36px 0 !important; color: ${TOKENS.white} !important; box-shadow: 0 16px 36px rgba(245,87,108,0.3) !important;">
    <div style="display: flex !important; align-items: flex-start !important; gap: 20px !important;">
        <div style="width: 56px !important; height: 56px !important; background: rgba(255,255,255,0.2) !important; border-radius: ${TOKENS.radiusMd} !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important;">
            <span style="font-size: 28px !important;">⚠️</span>
        </div>
        <div style="flex: 1 !important;">
            <div style="font-size: 11px !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 2px !important; color: rgba(255,255,255,0.9) !important; margin-bottom: 8px !important;">${escapeHtml(title)}</div>
            <p style="font-size: 16px !important; line-height: 1.7 !important; color: ${TOKENS.white} !important; margin: 0 !important;">${warning}</p>
        </div>
    </div>
</div>`;
}

export function createExpertQuoteBox(quote: string, author: string, role?: string): string {
    if (!quote || !author) return '';

    return `
<blockquote style="background: linear-gradient(135deg, ${TOKENS.primaryBg} 0%, #f0f4ff 100%) !important; border-left: 5px solid ${TOKENS.primary} !important; border-radius: 0 ${TOKENS.radiusXl} ${TOKENS.radiusXl} 0 !important; padding: 32px 36px !important; margin: 40px 0 !important; box-shadow: ${TOKENS.shadowMd} !important; font-style: normal !important;">
    <div style="font-size: 48px !important; color: ${TOKENS.primary} !important; opacity: 0.4 !important; line-height: 1 !important; margin-bottom: 12px !important;">"</div>
    <p style="font-size: 19px !important; line-height: 1.8 !important; font-style: italic !important; margin: 0 0 24px 0 !important; color: ${TOKENS.gray800} !important;">${quote}</p>
    <footer style="display: flex !important; align-items: center !important; gap: 16px !important;">
        <div style="width: 52px !important; height: 52px !important; background: ${TOKENS.gradPrimary} !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important;">
            <span style="font-size: 24px !important;">👤</span>
        </div>
        <div>
            <cite style="font-style: normal !important; font-weight: 800 !important; font-size: 16px !important; display: block !important; color: ${TOKENS.gray800} !important;">${escapeHtml(author)}</cite>
            ${role ? `<span style="font-size: 14px !important; color: ${TOKENS.gray500} !important;">${escapeHtml(role)}</span>` : ''}
        </div>
    </footer>
</blockquote>`;
}

export function createCalloutBox(text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): string {
    if (!text) return '';

    const configs: Record<string, { bg: string; border: string; icon: string; label: string }> = {
        info: { bg: TOKENS.infoBg, border: TOKENS.info, icon: 'ℹ️', label: 'Info' },
        success: { bg: TOKENS.successBg, border: TOKENS.success, icon: '✅', label: 'Success' },
        warning: { bg: TOKENS.warningBg, border: TOKENS.warning, icon: '⚡', label: 'Note' },
        error: { bg: TOKENS.dangerBg, border: TOKENS.danger, icon: '🔥', label: 'Important' }
    };
    const c = configs[type];

    return `
<div style="background: ${c.bg} !important; border-left: 5px solid ${c.border} !important; border-radius: 0 ${TOKENS.radiusLg} ${TOKENS.radiusLg} 0 !important; padding: 24px 28px !important; margin: 32px 0 !important; box-shadow: ${TOKENS.shadowSm} !important;">
    <div style="display: flex !important; align-items: flex-start !important; gap: 16px !important;">
        <span style="font-size: 26px !important;">${c.icon}</span>
        <div style="flex: 1 !important;">
            <div style="font-size: 11px !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 1px !important; color: ${c.border} !important; margin-bottom: 6px !important;">${c.label}</div>
            <p style="font-size: 15px !important; line-height: 1.7 !important; color: ${TOKENS.gray700} !important; margin: 0 !important;">${text}</p>
        </div>
    </div>
</div>`;
}

export function createStatisticsBox(stats: Array<{ value: string; label: string; icon?: string }>): string {
    if (!stats || stats.length === 0) return '';

    const items = stats.map(stat => `
        <div style="flex: 1 !important; min-width: 140px !important; text-align: center !important; padding: 28px 20px !important; background: ${TOKENS.white} !important; border-radius: ${TOKENS.radiusLg} !important; box-shadow: ${TOKENS.shadowMd} !important; border: 1px solid ${TOKENS.gray100} !important;">
            ${stat.icon ? `<div style="font-size: 28px !important; margin-bottom: 12px !important;">${stat.icon}</div>` : ''}
            <div style="font-size: 36px !important; font-weight: 900 !important; background: ${TOKENS.gradPrimary} !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; margin-bottom: 8px !important;">${escapeHtml(stat.value)}</div>
            <div style="font-size: 12px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; color: ${TOKENS.gray500} !important;">${escapeHtml(stat.label)}</div>
        </div>
    `).join('');

    return `
<div style="background: linear-gradient(135deg, ${TOKENS.gray50} 0%, ${TOKENS.gray100} 100%) !important; border: 1px solid ${TOKENS.gray200} !important; border-radius: ${TOKENS.radiusXxl} !important; padding: 32px !important; margin: 48px 0 !important;">
    <div style="display: flex !important; flex-wrap: wrap !important; justify-content: center !important; gap: 20px !important;">
        ${items}
    </div>
</div>`;
}

export function createChecklistBox(title: string, items: string[], icon: string = '✅'): string {
    if (!title || !items || items.length === 0) return '';

    const listItems = items.map((item, i) => `
        <li style="display: flex !important; align-items: flex-start !important; gap: 16px !important; padding: 16px 0 !important; ${i < items.length - 1 ? `border-bottom: 1px solid ${TOKENS.successBorder} !important;` : ''}">
            <span style="font-size: 22px !important; flex-shrink: 0 !important;">${icon}</span>
            <span style="font-size: 15px !important; line-height: 1.7 !important; color: ${TOKENS.gray700} !important;">${escapeHtml(item)}</span>
        </li>
    `).join('');

    return `
<div style="background: linear-gradient(135deg, ${TOKENS.successBg} 0%, #ecfdf5 100%) !important; border: 2px solid ${TOKENS.successBorder} !important; border-radius: ${TOKENS.radiusXl} !important; padding: 32px !important; margin: 40px 0 !important; box-shadow: ${TOKENS.shadowMd} !important;">
    <div style="display: flex !important; align-items: center !important; gap: 16px !important; margin-bottom: 24px !important;">
        <div style="width: 52px !important; height: 52px !important; background: ${TOKENS.gradSuccess} !important; border-radius: ${TOKENS.radiusMd} !important; display: flex !important; align-items: center !important; justify-content: center !important;">
            <span style="font-size: 24px !important;">📝</span>
        </div>
        <h4 style="font-size: 22px !important; font-weight: 800 !important; margin: 0 !important; color: #166534 !important;">${escapeHtml(title)}</h4>
    </div>
    <ul style="list-style: none !important; padding: 0 !important; margin: 0 !important;">${listItems}</ul>
</div>`;
}

export function createStepByStepBox(title: string, steps: Array<{ title: string; description: string }>): string {
    if (!title || !steps || steps.length === 0) return '';

    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": title,
        "step": steps.map((step, i) => ({
            "@type": "HowToStep",
            "position": i + 1,
            "name": step.title,
            "text": step.description
        }))
    };

    const stepItems = steps.map((step, i) => `
        <div style="display: flex !important; gap: 24px !important; ${i < steps.length - 1 ? `padding-bottom: 28px !important; margin-bottom: 28px !important; border-bottom: 2px dashed ${TOKENS.primaryBorder} !important;` : ''}">
            <div style="width: 56px !important; height: 56px !important; background: ${TOKENS.gradPrimary} !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important;">
                <span style="font-size: 22px !important; font-weight: 900 !important; color: ${TOKENS.white} !important;">${i + 1}</span>
            </div>
            <div style="flex: 1 !important; padding-top: 8px !important;">
                <h5 style="font-size: 18px !important; font-weight: 800 !important; margin: 0 0 10px 0 !important; color: ${TOKENS.gray800} !important;">${escapeHtml(step.title)}</h5>
                <p style="font-size: 15px !important; line-height: 1.7 !important; color: ${TOKENS.gray500} !important; margin: 0 !important;">${escapeHtml(step.description)}</p>
            </div>
        </div>
    `).join('');

    return `
<script type="application/ld+json">${JSON.stringify(howToSchema)}</script>
<div style="background: linear-gradient(135deg, ${TOKENS.primaryBg} 0%, ${TOKENS.primaryBorder}40 100%) !important; border: 2px solid ${TOKENS.primaryBorder} !important; border-radius: ${TOKENS.radiusXxl} !important; padding: 36px !important; margin: 48px 0 !important; box-shadow: ${TOKENS.shadowMd} !important;">
    <div style="display: flex !important; align-items: center !important; gap: 18px !important; margin-bottom: 32px !important;">
        <div style="width: 60px !important; height: 60px !important; background: ${TOKENS.gradPrimary} !important; border-radius: ${TOKENS.radiusXl} !important; display: flex !important; align-items: center !important; justify-content: center !important;">
            <span style="font-size: 28px !important;">📋</span>
        </div>
        <h4 style="font-size: 24px !important; font-weight: 800 !important; margin: 0 !important; color: #3730a3 !important;">${escapeHtml(title)}</h4>
    </div>
    ${stepItems}
</div>`;
}

export function createKeyTakeaways(takeaways: string[]): string {
    if (!takeaways || takeaways.length === 0) return '';

    const items = takeaways.map((t, i) => `
        <li style="display: flex !important; align-items: flex-start !important; gap: 18px !important; padding: 20px 0 !important; ${i < takeaways.length - 1 ? `border-bottom: 1px solid ${TOKENS.primaryBorder} !important;` : ''}">
            <span style="min-width: 40px !important; height: 40px !important; background: ${TOKENS.gradPrimary} !important; border-radius: ${TOKENS.radiusMd} !important; display: flex !important; align-items: center !important; justify-content: center !important; color: ${TOKENS.white} !important; font-size: 15px !important; font-weight: 900 !important; flex-shrink: 0 !important;">${i + 1}</span>
            <span style="font-size: 16px !important; line-height: 1.7 !important; color: ${TOKENS.gray700} !important; padding-top: 8px !important;">${escapeHtml(t)}</span>
        </li>
    `).join('');

    return `
<div style="background: linear-gradient(135deg, ${TOKENS.primaryBg} 0%, ${TOKENS.primaryBorder}50 100%) !important; border: 2px solid ${TOKENS.primaryBorder} !important; border-radius: ${TOKENS.radiusXxl} !important; padding: 40px !important; margin: 56px 0 !important; box-shadow: ${TOKENS.shadowMd} !important;">
    <div style="display: flex !important; align-items: center !important; gap: 20px !important; margin-bottom: 32px !important; padding-bottom: 28px !important; border-bottom: 2px solid ${TOKENS.primaryBorder} !important;">
        <div style="width: 68px !important; height: 68px !important; background: ${TOKENS.gradPrimary} !important; border-radius: ${TOKENS.radiusXl} !important; display: flex !important; align-items: center !important; justify-content: center !important;">
            <span style="font-size: 34px !important;">🎯</span>
        </div>
        <div>
            <h3 style="font-size: 26px !important; font-weight: 800 !important; margin: 0 !important; color: #3730a3 !important;">Key Takeaways</h3>
            <p style="font-size: 15px !important; color: ${TOKENS.gray500} !important; margin: 6px 0 0 0 !important;">The essential points to remember</p>
        </div>
    </div>
    <ul style="list-style: none !important; padding: 0 !important; margin: 0 !important;">${items}</ul>
</div>`;
}

export function createFAQAccordion(faqs: Array<{ question: string; answer: string }>): string {
    if (!faqs || faqs.length === 0) return '';

    const validFaqs = faqs.filter(f => f?.question?.length > 5 && f?.answer?.length > 20);
    if (validFaqs.length === 0) return '';

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": validFaqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer.replace(/<[^>]*>/g, '')
            }
        }))
    };

    const items = validFaqs.map(faq => `
        <details style="border: 1px solid ${TOKENS.gray200} !important; border-radius: ${TOKENS.radiusMd} !important; margin-bottom: 14px !important; background: ${TOKENS.white} !important; overflow: hidden !important;">
            <summary style="padding: 20px 24px !important; cursor: pointer !important; font-weight: 700 !important; font-size: 16px !important; color: ${TOKENS.gray800} !important; list-style: none !important; display: flex !important; justify-content: space-between !important; align-items: center !important;">
                <span style="flex: 1 !important; padding-right: 18px !important; line-height: 1.4 !important;">${escapeHtml(faq.question)}</span>
                <span style="width: 32px !important; height: 32px !important; border-radius: 50% !important; background: ${TOKENS.gray100} !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 12px !important; color: ${TOKENS.primary} !important; flex-shrink: 0 !important;">▼</span>
            </summary>
            <div style="padding: 0 24px 24px 24px !important; font-size: 15px !important; line-height: 1.8 !important; color: ${TOKENS.gray600} !important; background: ${TOKENS.gray50} !important; border-top: 1px solid ${TOKENS.gray200} !important;">
                <div style="padding-top: 20px !important;">${faq.answer}</div>
            </div>
        </details>
    `).join('');

    return `
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<section style="margin: 56px 0 !important;">
    <div style="display: flex !important; align-items: center !important; gap: 18px !important; margin-bottom: 32px !important;">
        <div style="width: 64px !important; height: 64px !important; background: ${TOKENS.gradPrimary} !important; border-radius: ${TOKENS.radiusXl} !important; display: flex !important; align-items: center !important; justify-content: center !important;">
            <span style="font-size: 30px !important;">❓</span>
        </div>
        <div>
            <h2 style="font-size: 26px !important; font-weight: 800 !important; margin: 0 !important; color: ${TOKENS.gray800} !important;">Frequently Asked Questions</h2>
            <p style="font-size: 15px !important; color: ${TOKENS.gray500} !important; margin: 6px 0 0 0 !important;">${validFaqs.length} questions answered</p>
        </div>
    </div>
    <div>${items}</div>
</section>`;
}

export function createComparisonTable(title: string, headers: [string, string], rows: Array<[string, string]>): string {
    if (!title || !rows || rows.length === 0) return '';

    const tableRows = rows.map(row => `
        <tr>
            <td style="padding: 18px 22px !important; background: ${TOKENS.dangerBg} !important; width: 50% !important; vertical-align: top !important; border-bottom: 1px solid ${TOKENS.dangerBorder} !important;">
                <span style="color: ${TOKENS.danger} !important; margin-right: 12px !important; font-size: 18px !important;">✗</span>
                <span style="color: #7f1d1d !important; font-size: 15px !important;">${escapeHtml(row[0])}</span>
            </td>
            <td style="padding: 18px 22px !important; background: ${TOKENS.successBg} !important; width: 50% !important; vertical-align: top !important; border-bottom: 1px solid ${TOKENS.successBorder} !important;">
                <span style="color: ${TOKENS.success} !important; margin-right: 12px !important; font-size: 18px !important;">✓</span>
                <span style="color: #166534 !important; font-size: 15px !important;">${escapeHtml(row[1])}</span>
            </td>
        </tr>
    `).join('');

    return `
<div style="border-radius: ${TOKENS.radiusXl} !important; overflow: hidden !important; margin: 48px 0 !important; box-shadow: ${TOKENS.shadowLg} !important; border: 1px solid ${TOKENS.gray200} !important;">
    <div style="padding: 22px 28px !important; background: linear-gradient(135deg, ${TOKENS.gray50} 0%, ${TOKENS.gray100} 100%) !important; border-bottom: 1px solid ${TOKENS.gray200} !important;">
        <div style="display: flex !important; align-items: center !important; gap: 14px !important;">
            <span style="font-size: 28px !important;">⚖️</span>
            <h4 style="font-size: 20px !important; font-weight: 800 !important; margin: 0 !important; color: ${TOKENS.gray800} !important;">${escapeHtml(title)}</h4>
        </div>
    </div>
    <table style="width: 100% !important; border-collapse: collapse !important;">
        <thead>
            <tr>
                <th style="padding: 16px 22px !important; text-align: left !important; font-size: 12px !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 1px !important; background: ${TOKENS.dangerBg} !important; color: ${TOKENS.danger} !important;">${escapeHtml(headers[0])}</th>
                <th style="padding: 16px 22px !important; text-align: left !important; font-size: 12px !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 1px !important; background: ${TOKENS.successBg} !important; color: ${TOKENS.success} !important;">${escapeHtml(headers[1])}</th>
            </tr>
        </thead>
        <tbody>${tableRows}</tbody>
    </table>
</div>`;
}

export function createHighlightBox(text: string, icon: string = '✨', bgColor: string = TOKENS.primary): string {
    if (!text) return '';

    return `
<div style="background: linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%) !important; border-radius: ${TOKENS.radiusXl} !important; padding: 30px 36px !important; margin: 40px 0 !important; box-shadow: 0 16px 40px ${bgColor}40 !important;">
    <div style="display: flex !important; align-items: center !important; gap: 20px !important;">
        <span style="font-size: 42px !important; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)) !important;">${icon}</span>
        <p style="flex: 1 !important; font-size: 18px !important; line-height: 1.7 !important; color: ${TOKENS.white} !important; margin: 0 !important; font-weight: 600 !important;">${text}</p>
    </div>
</div>`;
}

export interface YouTubeVideoData {
    videoId: string;
    title: string;
    channel: string;
    views: number;
    duration?: string;
    thumbnailUrl: string;
    embedUrl: string;
    description?: string;
}

export function createYouTubeEmbed(video: YouTubeVideoData): string {
    if (!video?.videoId) return '';

    const titleEscaped = escapeHtml(video.title || 'Watch Video');

    const videoSchema = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": video.title || 'Video',
        "description": video.description || `Video about ${video.title}`,
        "thumbnailUrl": [`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`],
        "uploadDate": new Date().toISOString().split('T')[0],
        "embedUrl": `https://www.youtube.com/embed/${video.videoId}`,
        "contentUrl": `https://www.youtube.com/watch?v=${video.videoId}`
    };

    return `
<script type="application/ld+json">${JSON.stringify(videoSchema)}</script>
<div style="margin: 52px 0 !important; border-radius: ${TOKENS.radiusXl} !important; overflow: hidden !important; box-shadow: ${TOKENS.shadowXl} !important; background: #000 !important;">
    <div style="position: relative !important; padding-bottom: 56.25% !important; height: 0 !important; overflow: hidden !important;">
        <iframe 
            src="https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1"
            title="${titleEscaped}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy"
            style="position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; border: none !important;"
        ></iframe>
    </div>
    <div style="padding: 22px 28px !important; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;">
        <h4 style="font-size: 17px !important; font-weight: 700 !important; margin: 0 0 8px 0 !important; color: ${TOKENS.white} !important;">${escapeHtml(truncate(video.title, 60))}</h4>
        <div style="display: flex !important; gap: 18px !important; font-size: 13px !important; color: rgba(255,255,255,0.75) !important;">
            <span>📺 ${escapeHtml(video.channel)}</span>
            <span>👁️ ${video.views?.toLocaleString() || 0} views</span>
        </div>
    </div>
</div>`;
}

export interface DiscoveredReference {
    url: string;
    title: string;
    source: string;
    snippet?: string;
    year?: string | number;
    authorityScore?: number;
    favicon?: string;
}

export function createReferencesSection(references: DiscoveredReference[]): string {
    if (!references || references.length === 0) return '';

    const validRefs = references.filter(r => r?.url && r?.title).slice(0, 10);
    if (validRefs.length === 0) return '';

    const items = validRefs.map((ref, i) => {
        const yearDisplay = ref.year ? ` (${ref.year})` : '';
        const authorityBadge = (ref.authorityScore && ref.authorityScore >= 80)
            ? `<span style="background: ${TOKENS.successBg} !important; color: ${TOKENS.successDark} !important; padding: 3px 10px !important; border-radius: 6px !important; font-size: 10px !important; font-weight: 700 !important; text-transform: uppercase !important; margin-left: 10px !important;">HIGH AUTHORITY</span>`
            : '';

        return `
        <li style="display: flex !important; align-items: flex-start !important; gap: 16px !important; padding: 18px 0 !important; ${i < validRefs.length - 1 ? `border-bottom: 1px solid ${TOKENS.gray100} !important;` : ''}">
            <span style="min-width: 32px !important; height: 32px !important; background: ${TOKENS.primaryBg} !important; border-radius: ${TOKENS.radiusSm} !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 13px !important; font-weight: 800 !important; color: ${TOKENS.primary} !important; flex-shrink: 0 !important;">${i + 1}</span>
            <div style="flex: 1 !important; min-width: 0 !important;">
                <a href="${escapeHtml(ref.url)}" target="_blank" rel="noopener noreferrer nofollow" style="font-weight: 700 !important; color: ${TOKENS.primary} !important; text-decoration: none !important; display: block !important; margin-bottom: 6px !important; font-size: 16px !important;">
                    ${escapeHtml(truncate(ref.title, 80))}${yearDisplay}
                </a>
                <div style="display: flex !important; align-items: center !important; gap: 10px !important; font-size: 13px !important; color: ${TOKENS.gray500} !important;">
                    <span>${escapeHtml(ref.source)}</span>
                    ${authorityBadge}
                </div>
            </div>
        </li>`;
    }).join('');

    return `
<section style="background: ${TOKENS.gray50} !important; border-radius: ${TOKENS.radiusXl} !important; padding: 36px !important; margin: 56px 0 !important; box-shadow: ${TOKENS.shadowMd} !important; border: 1px solid ${TOKENS.gray200} !important;">
    <div style="display: flex !important; align-items: center !important; gap: 18px !important; margin-bottom: 28px !important; padding-bottom: 24px !important; border-bottom: 2px solid ${TOKENS.gray200} !important;">
        <div style="width: 60px !important; height: 60px !important; background: ${TOKENS.gradPrimary} !important; border-radius: ${TOKENS.radiusLg} !important; display: flex !important; align-items: center !important; justify-content: center !important;">
            <span style="font-size: 28px !important;">📚</span>
        </div>
        <div>
            <h2 style="font-size: 24px !important; font-weight: 800 !important; margin: 0 !important; color: ${TOKENS.gray800} !important;">References & Sources</h2>
            <p style="font-size: 15px !important; color: ${TOKENS.gray500} !important; margin: 6px 0 0 0 !important;">${validRefs.length} authoritative sources</p>
        </div>
    </div>
    <ul style="list-style: none !important; padding: 0 !important; margin: 0 !important;">${items}</ul>
</section>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
    VISUAL_COMPONENTS_VERSION,
    TOKENS,
    createQuickAnswerBox,
    createProTipBox,
    createWarningBox,
    createExpertQuoteBox,
    createCalloutBox,
    createStatisticsBox,
    createChecklistBox,
    createStepByStepBox,
    createKeyTakeaways,
    createFAQAccordion,
    createComparisonTable,
    createHighlightBox,
    createYouTubeEmbed,
    createReferencesSection
};
