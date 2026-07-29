const required = [
  '--nx-font', '--nx-bg', '--nx-depth', '--nx-surface', '--nx-text', '--nx-muted',
  '--nx-accent', '--nx-border', '--nx-control', '--nx-control-text', '--nx-disabled',
  '--nx-focus', '--nx-status', '--nx-footer', '--nx-space', '--nx-radius', '--nx-duration'
];

export const themes = Object.freeze({
  neutral: {
    id: 'neutral',
    tokens: {
      '--nx-font': 'system-ui, sans-serif',
      '--nx-bg': '#ffffff',
      '--nx-depth': '#dbe8f5',
      '--nx-surface': '#f4f5f7',
      '--nx-text': '#17202a',
      '--nx-muted': '#53606e',
      '--nx-accent': '#285c98',
      '--nx-border': '#aab4bf',
      '--nx-control': '#ffffff',
      '--nx-control-text': '#17202a',
      '--nx-disabled': '#697581',
      '--nx-focus': '#174f8f',
      '--nx-status': '#334252',
      '--nx-footer': '#53606e',
      '--nx-space': 'clamp(1rem, 3vw, 3rem)',
      '--nx-radius': '.75rem',
      '--nx-duration': '180ms'
    }
  },
  nexus: {
    id: 'nexus',
    tokens: {
      '--nx-font': 'ui-sans-serif, system-ui, sans-serif',
      '--nx-bg': '#07101f',
      '--nx-depth': '#1a3154',
      '--nx-surface': '#101d31',
      '--nx-text': '#f4f7fc',
      '--nx-muted': '#c4d0e1',
      '--nx-accent': '#e2bd72',
      '--nx-border': '#3e587a',
      '--nx-control': '#182a44',
      '--nx-control-text': '#f4f7fc',
      '--nx-disabled': '#91a0b5',
      '--nx-focus': '#ffd98f',
      '--nx-status': '#dce6f4',
      '--nx-footer': '#b8c5d9',
      '--nx-space': 'clamp(1rem, 3vw, 3.5rem)',
      '--nx-radius': '1rem',
      '--nx-duration': '220ms'
    }
  }
});

export function validateTheme(theme) {
  const missing = required.filter((key) => !theme?.tokens?.[key]);
  return { valid: typeof theme?.id === 'string' && !missing.length, missing };
}

export function applyTheme(target, id = 'nexus') {
  const theme = themes[id];
  const check = validateTheme(theme);
  if (!check.valid) return check;
  Object.entries(theme.tokens).forEach(([key, value]) => target.style?.setProperty?.(key, value));
  if (target.dataset) target.dataset.theme = theme.id;
  return { valid: true, theme };
}
