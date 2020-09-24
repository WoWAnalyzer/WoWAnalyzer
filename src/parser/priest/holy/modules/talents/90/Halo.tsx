import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import React from 'react';
import ItemHealingDone from 'interface/ItemHealingDone';
import ItemDamageDone from 'interface/ItemDamageDone';
import { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';

// Example Log: /report/hRd3mpK1yTQ2tDJM/1-Mythic+MOTHER+-+Kill+(2:24)/14-丶寶寶小喵
class Halo extends Analyzer {
  haloDamage = 0;
  haloHealing = 0;
  haloOverhealing = 0;
  haloCasts = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HALO_TALENT.id);
  }

  on_byPlayer_damage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.HALO_DAMAGE.id) {
      this.haloDamage += event.amount || 0;
    }
  }

  on_byPlayer_heal(event: HealEvent) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HALO_HEAL.id) {
      this.haloHealing += event.amount || 0;
      this.haloOverhealing += event.overheal || 0;
    }
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HALO_TALENT.id) {
      this.haloCasts += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        talent={SPELLS.HALO_TALENT.id}
        value={(
          <>
            <ItemHealingDone amount={this.haloHealing} /><br />
            <ItemDamageDone amount={this.haloDamage} />
          </>
        )}
        tooltip={`Halos Cast: ${this.haloCasts}`}
        position={STATISTIC_ORDER.CORE(6)}
      />
    );
  }
}

export default Halo;
