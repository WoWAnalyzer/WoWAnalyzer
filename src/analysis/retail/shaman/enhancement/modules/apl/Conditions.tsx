import { buffStacks } from 'parser/shared/metrics/apl/conditions';
import SPELLS from 'common/SPELLS';
import { Condition } from 'parser/shared/metrics/apl';

export const AtLeastFiveMSW = buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 });
export const MaxStacksMSW = buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 10, atMost: 10 });
export function minimumMaelstromWeaponStacks(minStacks: number): Condition<number> {
  return buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, {
    atLeast: minStacks,
    atMost: minStacks === 10 ? minStacks : undefined,
  });
}
