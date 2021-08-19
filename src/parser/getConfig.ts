import Expansion from 'game/Expansion';
import AVAILABLE_CONFIGS from 'parser';

export default function getConfig(expansion: Expansion, specId: number, type: string) {
  const expansionConfigs = AVAILABLE_CONFIGS.filter((config) => config.expansion === expansion);
  let config = specId !== 0 && expansionConfigs.find((config) => config.spec.id === specId);
  if (!config) {
    config = expansionConfigs.find((config) => config.spec.id === 0 && config.spec.type === type);
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
