export const PORTABLE_RUNTIME_FILES = Object.freeze([
  'src/contracts/assets.js','src/contracts/errors.js','src/contracts/identifiers.js',
  'src/contracts/index.js','src/contracts/presentation.js','src/contracts/public.js',
  'src/contracts/registry.js','src/contracts/semver.js','src/input/keyboard.js',
  'src/input/touch.js','src/layouts/layouts.js','src/media/media-capability.js',
  'src/package/static-resource-manager.js','src/player/events.js','src/player/navigation.js',
  'src/player/player.js','src/player/renderers.js','src/player/state-machine.js',
  'src/player/transitions.js','src/themes/themes.js','src/ui/player-view.js',
  'src/version.js','portable/runtime-app.js','styles.css'
]);

export function createRuntimeProvider({
  fetchImpl = (...args) => globalThis.fetch(...args),
  baseUrl = new URL('../../', import.meta.url)
} = {}) {
  return {
    async collect() {
      const files = [];
      for (const path of PORTABLE_RUNTIME_FILES) {
        const response = await fetchImpl(new URL(path, baseUrl));
        if (!response.ok) throw Object.assign(new Error(`Runtime file unavailable: ${path}`), { code: 'runtime-file-missing' });
        files.push([`runtime/${path}`, new Uint8Array(await response.arrayBuffer())]);
      }
      return files;
    }
  };
}
