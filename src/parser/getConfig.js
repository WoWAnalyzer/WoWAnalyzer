import AVAILABLE_CONFIGS from 'parser';

export default function getConfig(specId) {
  const config = AVAILABLE_CONFIGS.find((config) => config.spec.id === specId);
  if (!config) {
    return undefined;
  }
  //find visible builds, if any exist
  const activeBuilds =
    config.builds && Object.keys(config.builds).filter((b) => config.builds[b].visible);
  //remove all inactive builds
  config.builds =
    (activeBuilds &&
      activeBuilds.length > 0 &&
      activeBuilds.reduce((obj, key) => {
        obj[key] = config.builds[key];
        return obj;
      }, {})) ||
    undefined;

  return config;
}
