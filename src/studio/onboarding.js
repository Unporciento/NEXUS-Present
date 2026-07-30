export const ONBOARDING_VERSION = '1.0';
export const ONBOARDING_KEY = 'nexus:onboarding-version';

export function createOnboardingPreference({
  storage = globalThis.localStorage,
  version = ONBOARDING_VERSION,
  key = ONBOARDING_KEY
} = {}) {
  const read = () => {
    try {
      return storage?.getItem?.(key) ?? null;
    } catch {
      return null;
    }
  };
  const write = (value) => {
    try {
      storage?.setItem?.(key, value);
      return true;
    } catch {
      return false;
    }
  };
  return Object.freeze({
    version,
    key,
    shouldShow: () => read() !== version,
    markSeen: () => write(version),
    reset: () => {
      try {
        storage?.removeItem?.(key);
        return true;
      } catch {
        return false;
      }
    }
  });
}
