import { diagnostic } from './errors.js';

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/;

export function parseSemver(value) {
  if (typeof value !== 'string' || !SEMVER.test(value)) return null;
  return value.split('-')[0].split('.').map(Number);
}

export function validateSemver(value, path) {
  return parseSemver(value) ? [] : [diagnostic('invalid-semver', path, 'Expected a SemVer value.')];
}

export function checkEngineCompatibility({ minimumEngineVersion, maximumEngineVersion, engineVersion }) {
  const diagnostics = [...validateSemver(minimumEngineVersion, 'minimumEngineVersion'), ...validateSemver(engineVersion, 'engineVersion')];
  if (maximumEngineVersion) diagnostics.push(...validateSemver(maximumEngineVersion, 'maximumEngineVersion'));
  if (diagnostics.length) return diagnostics;
  const engine = parseSemver(engineVersion), min = parseSemver(minimumEngineVersion), max = maximumEngineVersion && parseSemver(maximumEngineVersion);
  if (engine[0] !== min[0] || engine[0] < min[0]) diagnostics.push(diagnostic('engine-major-incompatible', 'minimumEngineVersion', 'Engine major version is incompatible.'));
  else if (engine[1] < min[1]) diagnostics.push(diagnostic('engine-too-old', 'minimumEngineVersion', 'Engine version is below the required minimum.'));
  if (max && (engine[0] > max[0] || (engine[0] === max[0] && engine[1] > max[1]))) diagnostics.push(diagnostic('engine-too-new', 'maximumEngineVersion', 'Engine version exceeds the supported maximum.'));
  return diagnostics;
}
