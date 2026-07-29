const required = ['--nx-font','--nx-bg','--nx-surface','--nx-text','--nx-muted','--nx-accent','--nx-space','--nx-radius','--nx-duration'];
export const themes = Object.freeze({
  neutral: { id: 'neutral', tokens: { '--nx-font': 'system-ui, sans-serif', '--nx-bg': '#ffffff', '--nx-surface': '#f4f5f7', '--nx-text': '#17202a', '--nx-muted': '#53606e', '--nx-accent': '#285c98', '--nx-space': 'clamp(1rem, 3vw, 3rem)', '--nx-radius': '.75rem', '--nx-duration': '180ms' } },
  nexus: { id: 'nexus', tokens: { '--nx-font': 'ui-sans-serif, system-ui, sans-serif', '--nx-bg': '#07101f', '--nx-surface': '#101d31', '--nx-text': '#eef4ff', '--nx-muted': '#b8c5d9', '--nx-accent': '#d6ae62', '--nx-space': 'clamp(1rem, 3vw, 3.5rem)', '--nx-radius': '1rem', '--nx-duration': '220ms' } }
});
export function validateTheme(theme) { const missing = required.filter((key) => !theme?.tokens?.[key]); return { valid: typeof theme?.id === 'string' && !missing.length, missing }; }
export function applyTheme(target, id = 'nexus') { const theme = themes[id]; const check = validateTheme(theme); if (!check.valid) return check; Object.entries(theme.tokens).forEach(([key, value]) => target.style?.setProperty?.(key, value)); if (target.dataset) target.dataset.theme = theme.id; return { valid: true, theme }; }
