import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import React from 'react';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import ItemDamageDone from 'interface/others/ItemDamageDone';

// Example Log: /report/hRd3mpK1yTQ2tDJM/1-Mythic+MOTHER+-+Kill+(2:24)/14-丶寶寶小喵
class Halo extends Analyzer {
  haloDamage = 0;
  haloHealing = 0;
  haloOverhealing = 0;
  haloCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HALO_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.HALO_DAMAGE.id) {
      this.haloDamage += event.amount || 0;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HALO_HEAL.id) {
      this.haloHealing += event.amount || 0;
      this.haloOverhealing += event.overhealing || 0;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.HALO_TALENT.id) {
      this.haloCasts += 1;
    }
  }

  statistic() {
    return (

      <TalentStatisticBox
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
