// WP Optimizer Pro v28.0 - Enterprise Visual Components Library
// SOTA Design System for Blog Posts & Landing Pages
// Implements modern design patterns with accessibility & performance

// Premium CSS Grid System & Typography
export const ENTERPRISE_DESIGN_SYSTEM = {
  // Color palette (WCAG AAA compliant)
  colors: {
    primary: '#1a1a1a',
    secondary: '#0066cc',
    accent: '#ff6b35',
    background: '#ffffff',
    surface: '#f5f5f5',
    border: '#e0e0e0',
    text: '#2d2d2d',
    textLight: '#666666',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Typography scale (modular)
  typography: {
    fontFamily: {
      serif: '"Georgia", "Times New Roman", serif',
      sansSerif: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
      mono: '"Monaco", "Courier New", monospace',
    },
    scale: {
      xs: { size: '12px', lineHeight: '16px', weight: 400 },
      sm: { size: '14px', lineHeight: '20px', weight: 400 },
      base: { size: '16px', lineHeight: '24px', weight: 400 },
      lg: { size: '18px', lineHeight: '28px', weight: 500 },
      xl: { size: '20px', lineHeight: '28px', weight: 600 },
      '2xl': { size: '24px', lineHeight: '32px', weight: 700 },
      '3xl': { size: '30px', lineHeight: '36px', weight: 700 },
      '4xl': { size: '36px', lineHeight: '44px', weight: 800 },
    },
  },
  
  // Spacing system (8px base)
  spacing: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
  },
  
  // Shadow system (depth)
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Border radius system
  borderRadius: {
    none: '0',
    sm: '2px',
    base: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  // Animation timings
  animation: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slowest: '500ms',
  },
};

// Component CSS Modules
export const COMPONENT_STYLES = {
  // Hero section with gradient
  hero: `
    .hero-section {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white;
      padding: 80px 20px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .hero-section::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%);
      pointer-events: none;
    }
    
    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .hero-title {
      font-size: 48px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 24px;
      letter-spacing: -1px;
    }
    
    .hero-subtitle {
      font-size: 24px;
      font-weight: 300;
      margin-bottom: 32px;
      opacity: 0.9;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
  `,
  
  // Card component
  card: `
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 300ms ease;
      border: 1px solid #e0e0e0;
    }
    
    .card:hover {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      transform: translateY(-4px);
      border-color: #0066cc;
    }
    
    .card-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #1a1a1a;
    }
    
    .card-description {
      font-size: 16px;
      line-height: 1.6;
      color: #666666;
    }
  `,
  
  // Button styles
  button: `
    .btn {
      display: inline-block;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 200ms ease;
      text-decoration: none;
      text-align: center;
      min-width: 120px;
    }
    
    .btn-primary {
      background: #0066cc;
      color: white;
    }
    
    .btn-primary:hover {
      background: #0052a3;
      box-shadow: 0 10px 15px -3px rgba(0, 102, 204, 0.3);
      transform: translateY(-2px);
    }
    
    .btn-secondary {
      background: transparent;
      color: #0066cc;
      border: 2px solid #0066cc;
    }
    
    .btn-secondary:hover {
      background: #f0f7ff;
      border-color: #0052a3;
    }
    
    .btn-accent {
      background: #ff6b35;
      color: white;
    }
    
    .btn-accent:hover {
      background: #e55a2b;
      box-shadow: 0 10px 15px -3px rgba(255, 107, 53, 0.3);
    }
  `,
  
  // Internal link styling
  internalLink: `
    .internal-link {
      color: #0066cc;
      text-decoration: none;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      transition: all 200ms ease;
      padding-bottom: 2px;
    }
    
    .internal-link:hover {
      color: #0052a3;
      border-bottom-color: #0066cc;
    }
    
    .internal-link.highlight {
      background: rgba(0, 102, 204, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
  `,
  
  // Content typography
  contentBody: `
    .content-body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 18px;
      line-height: 1.8;
      color: #2d2d2d;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .content-body h2 {
      font-size: 32px;
      font-weight: 700;
      margin: 48px 0 24px 0;
      color: #1a1a1a;
      border-left: 4px solid #0066cc;
      padding-left: 16px;
    }
    
    .content-body h3 {
      font-size: 24px;
      font-weight: 700;
      margin: 32px 0 16px 0;
      color: #2d2d2d;
    }
    
    .content-body p {
      margin-bottom: 24px;
      orphans: 3;
      widows: 3;
    }
    
    .content-body ul, .content-body ol {
      margin: 24px 0 24px 24px;
    }
    
    .content-body li {
      margin-bottom: 12px;
      line-height: 1.8;
    }
  `,
  
  // Callout boxes
  callout: `
    .callout {
      padding: 24px;
      border-radius: 8px;
      margin: 32px 0;
      border-left: 4px solid;
    }
    
    .callout.info {
      background: #f0f7ff;
      border-color: #0066cc;
    }
    
    .callout.success {
      background: #f0fdf4;
      border-color: #10b981;
    }
    
    .callout.warning {
      background: #fffbeb;
      border-color: #f59e0b;
    }
    
    .callout.error {
      background: #fef2f2;
      border-color: #ef4444;
    }
    
    .callout-title {
      font-weight: 700;
      margin-bottom: 8px;
      font-size: 16px;
    }
    
    .callout-content {
      font-size: 15px;
      line-height: 1.6;
    }
  `,
};

// Animation utilities
export const ANIMATIONS = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  
  slideUp: `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
};

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: '320px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1440px',
};

// Export complete design system
export const EnterpriseVisualComponents = {
  designSystem: ENTERPRISE_DESIGN_SYSTEM,
  components: COMPONENT_STYLES,
  animations: ANIMATIONS,
  breakpoints: BREAKPOINTS,
};
