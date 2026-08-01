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
      '--nx-bg': '#f6f2e9',
      '--nx-depth': '#dfe8ef',
      '--nx-surface': '#fffdf8',
      '--nx-text': '#20242b',
      '--nx-muted': '#5c6470',
      '--nx-accent': '#245f86',
      '--nx-border': '#c8c0b4',
      '--nx-control': '#ffffff',
      '--nx-control-text': '#20242b',
      '--nx-disabled': '#717985',
      '--nx-focus': '#006d9c',
      '--nx-status': '#5f4e32',
      '--nx-footer': '#5c6470',
      '--nx-space': 'clamp(1rem, 3vw, 3rem)',
      '--nx-radius': '.75rem',
      '--nx-duration': '180ms'
    }
  },
  nexus: {
    id: 'nexus',
    tokens: {
      '--nx-font': 'ui-sans-serif, system-ui, sans-serif',
      '--nx-bg': '#080b15',
      '--nx-depth': '#24315a',
      '--nx-surface': '#11182a',
      '--nx-text': '#f8f4eb',
      '--nx-muted': '#b8c3d8',
      '--nx-accent': '#62d5ff',
      '--nx-border': '#394868',
      '--nx-control': '#1b2740',
      '--nx-control-text': '#f8f4eb',
      '--nx-disabled': '#8795ad',
      '--nx-focus': '#f4c56f',
      '--nx-status': '#78ddb3',
      '--nx-footer': '#acb8cd',
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
