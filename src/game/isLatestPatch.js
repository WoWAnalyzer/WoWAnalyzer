import parseVersionString from 'common/parseVersionString';

export default function isLatestPatch(patch) {
  const specPatchCompatibility = parseVersionString(patch);
  const latestPatch = parseVersionString(process.env.REACT_APP_CURRENT_GAME_PATCH);
  const isOutdated = specPatchCompatibility.major < latestPatch.major || specPatchCompatibility.minor < latestPatch.minor || specPatchCompatibility.patch < latestPatch.patch;
  return !isOutdated;
}
