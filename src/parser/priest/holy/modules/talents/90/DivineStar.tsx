import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import ItemHealingDone from 'interface/ItemHealingDone';
import ItemDamageDone from 'interface/ItemDamageDone';
import Events, { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

// Example Log: /report/mWZ6TG9JgjPQVdbA/9-Mythic+Zek'voz+-+Kill+(7:24)/1-Allyseia`Ø
class DivineStar extends Analyzer {
  divineStarDamage = 0;
  divineStarHealing = 0;
  divineStarOverhealing = 0;
  divineStarCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DIVINE_STAR_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.DIVINE_STAR_HEAL, SPELLS.DIVINE_STAR_DAMAGE]), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_STAR_HEAL), this.onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_STAR_TALENT), this.onCast);
  }

  onDamage(event: DamageEvent) {
    // For some reason there are heals that are recoeded as damaging spells. I don't know what's up with that.
    this.divineStarDamage += event.amount || 0;
  }

  onHeal(event: HealEvent) {
    this.divineStarHealing += event.amount || 0;
    this.divineStarOverhealing += event.overheal || 0;
  }

  onCast(event: CastEvent) {
    this.divineStarCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        tooltip={`Divine Stars Cast: ${this.divineStarCasts}`}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(6)}
      >
        <BoringSpellValueText spell={SPELLS.DIVINE_STAR_TALENT}>
          <>
            <ItemHealingDone amount={this.divineStarHealing} /><br />
            <ItemDamageDone amount={this.divineStarDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DivineStar;
