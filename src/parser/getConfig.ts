import AVAILABLE_CONFIGS from 'parser';

export default function getConfig(specId: number, type: string) {
  let config = specId !== 0 && AVAILABLE_CONFIGS.find((config) => config.spec.id === specId);
  if (!config) {
    config = AVAILABLE_CONFIGS.find((config) => config.spec.id === 0 && config.spec.type === type);
  }
  if (!config) {
    return undefined;
  }

  if (config.builds) {
    config.builds =
      Object.fromEntries(
        Object.entries(config.builds).filter(([_key, build]) => build.visible, {}),
      ) || undefined;
  }

  return config;
}
