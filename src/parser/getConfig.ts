import { isClassicSpec } from 'game/SPECS';
import AVAILABLE_CONFIGS from 'parser';
import { CombatantInfoEvent } from './core/Events';
import GameBranch from 'game/GameBranch';

export default function getConfig(
  branch: GameBranch,
  specId: number,
  player: {
    type: string;
    icon?: string;
  },
  combatant?: CombatantInfoEvent,
) {
  const relevantConfigs = AVAILABLE_CONFIGS.filter((config) => config.branch === branch);
  let config = specId !== 0 && relevantConfigs.find((config) => config.spec.id === specId);
  // Classic
  if (!config) {
    config = relevantConfigs.find(
      (config) => config.spec.id === 0 && config.spec.type === player.type,
    );
    if (!config && player.icon) {
      config = relevantConfigs.find(
        (config) =>
          isClassicSpec(config.spec) &&
          config.spec.type === player.type &&
          config.spec.icon === player.icon,
      );
    }
  }
  // Classic Tree lookup
  if (!config && player.type === player.icon && combatant) {
    if (combatant.talents) {
      const talents = Object.entries(combatant.talents).map(([, v]) => v.id);
      const maxTalent = talents.indexOf(Math.max(...talents));
      config = relevantConfigs.find(
        (config) =>
          isClassicSpec(config.spec) &&
          config.spec.type === player.type &&
          config.spec.treeIndex === maxTalent,
      );
    }
  }
  // No config
  if (!config) {
    return undefined;
  }

  return config;
}
