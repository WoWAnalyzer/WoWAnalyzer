import { SpellCast } from 'parser/core/MajorCooldowns/MajorCooldown';
import { TrackedBuffEvent } from 'parser/core/Entity';
import { PRIMARY_BUFF_KEY, SECONDARY_BUFF_KEY } from '../Sepsis';
import SepsisBuff from './SepsisBuff';
import SepsisDebuff from './SepsisDebuff';

export default interface SepsisCast extends SpellCast {
  buffs: {
    [PRIMARY_BUFF_KEY]?: SepsisBuff;
    [SECONDARY_BUFF_KEY]?: SepsisBuff;
  };
  debuff?: SepsisDebuff;
  shivData?: {
    events: TrackedBuffEvent[];
    overlapMs: number;
    overlapPercent: number;
  };
}
