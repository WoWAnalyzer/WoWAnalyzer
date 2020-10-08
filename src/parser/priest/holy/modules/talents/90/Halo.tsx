import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import ItemHealingDone from 'interface/ItemHealingDone';
import ItemDamageDone from 'interface/ItemDamageDone';
import { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

// Example Log: /report/hRd3mpK1yTQ2tDJM/1-Mythic+MOTHER+-+Kill+(2:24)/14-丶寶寶小喵
class Halo extends Analyzer {
  haloDamage = 0;
  haloHealing = 0;
  haloOverhealing = 0;
  haloCasts = 0;

  constructor(options: Options) {
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
        tooltip={`Halos Cast: ${this.haloCasts}`}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(6)}
      >
        <BoringSpellValueText spell={SPELLS.HALO_TALENT}>
          <ItemHealingDone amount={this.haloHealing} /><br />
          <ItemDamageDone amount={this.haloDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Halo;
