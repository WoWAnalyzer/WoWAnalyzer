import { buffStacks, hasResource } from 'parser/shared/metrics/apl/conditions';
import { Condition } from 'parser/shared/metrics/apl';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

export const AtLeastFiveMSW = hasResource(RESOURCE_TYPES.MAELSTROM_WEAPON, { atLeast: 5 });
export const MaxStacksMSW = buffStacks(RESOURCE_TYPES.MAELSTROM_WEAPON, {
  atLeast: 10,
  atMost: 10,
});
export function minimumMaelstromWeaponStacks(minStacks: number): Condition<number> {
  return hasResource(RESOURCE_TYPES.MAELSTROM_WEAPON, {
    atLeast: minStacks,
    atMost: minStacks === 10 ? minStacks : undefined,
  });
}
