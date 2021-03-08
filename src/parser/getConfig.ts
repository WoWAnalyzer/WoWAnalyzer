import AVAILABLE_CONFIGS from 'parser';

export default function getConfig(specId: number) {
  const config = AVAILABLE_CONFIGS.find((config) => config.spec.id === specId);
  if (!config) {
    return undefined;
  }

  if (config.builds) {
    config.builds = Object.fromEntries(
      Object.entries(config.builds).filter(([_key, build]) => build.visible, {})
    ) || undefined;
  }

  return config;
}
