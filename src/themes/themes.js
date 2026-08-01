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
  },
  aurora: {
    id: 'aurora',
    tokens: {
      '--nx-font': 'ui-sans-serif, system-ui, sans-serif', '--nx-bg': '#0d0920',
      '--nx-depth': '#432f78', '--nx-surface': '#191331', '--nx-text': '#fbf7ff',
      '--nx-muted': '#c9bfdd', '--nx-accent': '#bd8cff', '--nx-border': '#51436f',
      '--nx-control': '#292044', '--nx-control-text': '#fbf7ff', '--nx-disabled': '#958aa9',
      '--nx-focus': '#69e7ff', '--nx-status': '#75e0cb', '--nx-footer': '#b9afcd',
      '--nx-space': 'clamp(1rem, 3vw, 3.5rem)', '--nx-radius': '1rem', '--nx-duration': '220ms'
    }
  },
  ember: {
    id: 'ember',
    tokens: {
      '--nx-font': 'ui-sans-serif, system-ui, sans-serif', '--nx-bg': '#190d10',
      '--nx-depth': '#6b2f2a', '--nx-surface': '#28171a', '--nx-text': '#fff7ed',
      '--nx-muted': '#dbc0b7', '--nx-accent': '#ff9a62', '--nx-border': '#68413b',
      '--nx-control': '#3b2427', '--nx-control-text': '#fff7ed', '--nx-disabled': '#a78d87',
      '--nx-focus': '#ffd166', '--nx-status': '#f2c879', '--nx-footer': '#cfb2aa',
      '--nx-space': 'clamp(1rem, 3vw, 3.5rem)', '--nx-radius': '.85rem', '--nx-duration': '200ms'
    }
  },
  verdant: {
    id: 'verdant',
    tokens: {
      '--nx-font': 'ui-sans-serif, system-ui, sans-serif', '--nx-bg': '#071410',
      '--nx-depth': '#194d3d', '--nx-surface': '#10251e', '--nx-text': '#f1fff8',
      '--nx-muted': '#b4d1c3', '--nx-accent': '#66ddb0', '--nx-border': '#356354',
      '--nx-control': '#1b382e', '--nx-control-text': '#f1fff8', '--nx-disabled': '#86a397',
      '--nx-focus': '#ffe08a', '--nx-status': '#8de3bd', '--nx-footer': '#a9c7b9',
      '--nx-space': 'clamp(1rem, 3vw, 3.5rem)', '--nx-radius': '.9rem', '--nx-duration': '210ms'
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
