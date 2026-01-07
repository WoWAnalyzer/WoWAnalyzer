import { type Spec } from 'game/SPECS';
import AVAILABLE_CONFIGS from 'parser';
import GameBranch from 'game/GameBranch';
import type Config from './Config';
import { PlayerDetails } from './core/Player';

export default function getConfig(branch: GameBranch, specId: number, player: PlayerDetails) {
  const relevantConfigs = AVAILABLE_CONFIGS.filter((config) => config.branch === branch);
  let config = specId !== 0 && relevantConfigs.find((config) => config.spec.id === specId);

  if (!config && player.specName) {
    config = relevantConfigs.find(
      (config) =>
        config.spec.wclClassName === player.className &&
        config.spec.wclSpecName === player.specName,
    );
  }

  // No config
  if (!config) {
    return undefined;
  }

  return config;
}

export function getConfigForSpec(spec: Spec): Config | undefined {
  for (const config of AVAILABLE_CONFIGS) {
    if (
      config.spec.branch === spec.branch &&
      config.spec.wclClassName === spec.wclClassName &&
      config.spec.wclSpecName === spec.wclSpecName
    ) {
      return config;
    }
  }

  return undefined;
}
