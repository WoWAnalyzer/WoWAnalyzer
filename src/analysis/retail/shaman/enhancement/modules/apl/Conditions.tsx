import { buffStacks } from 'parser/shared/metrics/apl/conditions';
import SPELLS from 'common/SPELLS';

export const AtLeastFiveMSW = buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 5 });
export const MaxStacksMSW = buffStacks(SPELLS.MAELSTROM_WEAPON_BUFF, { atLeast: 10, atMost: 10 });
