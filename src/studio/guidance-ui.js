import { createOnboardingPreference } from './onboarding.js';

function openDialog(dialog) {
  if (!dialog) return false;
  dialog.showModal?.();
  if (!dialog.open) dialog.setAttribute('open', '');
  dialog.querySelector?.('[data-dialog-start]')?.focus?.();
  return true;
}

function closeDialog(dialog) {
  if (!dialog) return;
  dialog.close?.();
  if (dialog.open) dialog.removeAttribute('open');
}

export function bindStudioGuidance(root, {
  preference = createOnboardingPreference()
} = {}) {
  let destroyed = false;
  let returnFocus = null;
  const onboarding = root.querySelector?.('[data-onboarding]');
  const help = root.querySelector?.('[data-help-dialog]');
  const openOnboarding = (origin) => {
    if (destroyed) return false;
    returnFocus = origin ?? root.querySelector?.('[data-help]');
    return openDialog(onboarding);
  };
  const finishOnboarding = () => {
    preference.markSeen();
    closeDialog(onboarding);
    returnFocus?.focus?.();
  };
  const openHelp = (origin) => {
    if (destroyed) return false;
    returnFocus = origin;
    return openDialog(help);
  };
  const closeHelp = () => {
    closeDialog(help);
    returnFocus?.focus?.();
  };
  const click = (event) => {
    const target = event.target?.closest?.(
      '[data-help],[data-help-close],[data-repeat-onboarding],[data-onboarding-close]'
    );
    if (!target) return;
    if (target.matches('[data-help]')) openHelp(target);
    if (target.matches('[data-help-close]')) closeHelp();
    if (target.matches('[data-onboarding-close]')) finishOnboarding();
    if (target.matches('[data-repeat-onboarding]')) {
      closeDialog(help);
      preference.reset();
      openOnboarding(root.querySelector?.('[data-help]'));
    }
  };
  root.addEventListener('click', click);
  if (preference.shouldShow()) openOnboarding();
  return {
    openOnboarding,
    openHelp,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      root.removeEventListener('click', click);
      closeDialog(onboarding);
      closeDialog(help);
      returnFocus = null;
    }
  };
}
