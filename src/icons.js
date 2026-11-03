/**
 * 原生手绘 SVG 矢量图标库 (Handcrafted Native SVG Icons)
 * 100% 矢量矢量代码，完全自适应，无任何第三方包依赖。
 */

export function createSvg(content, className = 'w-4 h-4', viewBox = '0 0 24 24') {
  return `<svg class="${className}" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
}

export const ICONS = {
  calendar: createSvg(
    `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
     <line x1="16" y1="2" x2="16" y2="6"></line>
     <line x1="8" y1="2" x2="8" y2="6"></line>
     <line x1="3" y1="10" x2="21" y2="10"></line>
     <circle cx="8" cy="14" r="1" fill="currentColor"></circle>
     <circle cx="12" cy="14" r="1" fill="currentColor"></circle>
     <circle cx="16" cy="14" r="1" fill="currentColor"></circle>
     <circle cx="8" cy="18" r="1" fill="currentColor"></circle>
     <circle cx="12" cy="18" r="1" fill="currentColor"></circle>`
  ),

  almanac: createSvg(
    `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
     <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
     <line x1="10" y1="7" x2="16" y2="7"></line>
     <line x1="10" y1="11" x2="16" y2="11"></line>`
  ),

  converter: createSvg(
    `<path d="M8 3 4 7l4 4"></path>
     <path d="M4 7h16"></path>
     <path d="m16 21 4-4-4-4"></path>
     <path d="M20 17H4"></path>`
  ),

  solarTerms: createSvg(
    `<circle cx="12" cy="12" r="4"></circle>
     <path d="M12 2v2"></path>
     <path d="M12 20v2"></path>
     <path d="m4.93 4.93 1.41 1.41"></path>
     <path d="m17.66 17.66 1.41 1.41"></path>
     <path d="M2 12h2"></path>
     <path d="M20 12h2"></path>
     <path d="m6.34 17.66-1.41 1.41"></path>
     <path d="m19.07 4.93-1.41 1.41"></path>`
  ),

  science: createSvg(
    `<circle cx="12" cy="12" r="2" fill="currentColor"></circle>
     <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)"></ellipse>
     <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)"></ellipse>`
  ),

  chevronLeft: createSvg(`<polyline points="15 18 9 12 15 6"></polyline>`),
  chevronRight: createSvg(`<polyline points="9 18 15 12 9 6"></polyline>`),

  rotate: createSvg(
    `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
     <path d="M3 3v5h5"></path>`
  ),

  sun: createSvg(
    `<circle cx="12" cy="12" r="5"></circle>
     <line x1="12" y1="1" x2="12" y2="3"></line>
     <line x1="12" y1="21" x2="12" y2="23"></line>
     <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
     <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
     <line x1="1" y1="12" x2="3" y2="12"></line>
     <line x1="21" y1="12" x2="23" y2="12"></line>
     <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
     <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`
  ),

  moon: createSvg(
    `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`
  ),

  compass: createSvg(
    `<circle cx="12" cy="12" r="10"></circle>
     <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor"></polygon>`
  ),

  check: createSvg(
    `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
     <polyline points="22 4 12 14.01 9 11.01"></polyline>`
  ),

  shield: createSvg(
    `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>`
  )
};
