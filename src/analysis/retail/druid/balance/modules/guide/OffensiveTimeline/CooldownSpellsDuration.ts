import Combatant from 'parser/core/Combatant';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import { cdDuration, cdSpell } from 'analysis/retail/druid/balance/constants';

export class CooldownSpellsDuration {
  private readonly durations: Record<number, number>;

  constructor(combatant: Combatant) {
    const mainSpell = cdSpell(combatant);
    this.durations = {
      [mainSpell.id]: cdDuration(combatant),
      [SPELLS.SOLAR_ECLIPSE.id]: 15_000,
      [TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id]: 10_000,
      [SPELLS.CONVOKE_SPIRITS.id]: 4_000,
      [TALENTS_DRUID.FURY_OF_ELUNE_TALENT.id]: 8_000,
    };
  }

  get(spellId: number): number | undefined {
    return this.durations[spellId];
  }
}
