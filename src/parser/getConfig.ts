import Expansion from 'game/Expansion';
import { isClassicSpec } from 'game/SPECS';
import AVAILABLE_CONFIGS from 'parser';
import { CombatantInfoEvent } from './core/Events';

export default function getConfig(
  expansion: Expansion,
  specId: number,
  player: {
    type: string;
    icon?: string;
  },
  combatant?: CombatantInfoEvent,
) {
  const expansionConfigs = AVAILABLE_CONFIGS.filter((config) => config.expansion === expansion);
  let config = specId !== 0 && expansionConfigs.find((config) => config.spec.id === specId);
  // Classic
  if (!config) {
    config = expansionConfigs.find(
      (config) => config.spec.id === 0 && config.spec.type === player.type,
    );
    if (!config && player.icon) {
      config = expansionConfigs.find(
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
      config = expansionConfigs.find(
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
  // Classic Builds
  if (config.builds) {
    config.builds =
      Object.fromEntries(
        Object.entries(config.builds).filter(([_key, build]) => build.visible, {}),
      ) || undefined;
  }

  return config;
}
