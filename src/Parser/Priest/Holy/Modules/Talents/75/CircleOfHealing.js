import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';
import { formatPercentage, formatThousands } from 'common/format';

// Example Log: http://localhost:3000/report/aBxvzDZJQP7431Nt/21-Normal+G'huun+-+Kill+(7:11)/15-Liarine
class CircleOfHealing extends Analyzer {
  circleOfHealingCasts = 0;
  circleOfHealingHealing = 0;
  circleOfHealingOverhealing = 0;
  circleOfHealingTargetsHit = 0;

  get overHealPercent() {
    return this.circleOfHealingOverhealing / this.rawHealing;
  }

  get rawHealing() {
    return this.circleOfHealingHealing + this.circleOfHealingOverhealing;
  }

  get averageTargetsHit() {
    return this.circleOfHealingTargetsHit / this.circleOfHealingCasts;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CIRCLE_OF_HEALING_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CIRCLE_OF_HEALING_TALENT.id) {
      this.circleOfHealingCasts++;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CIRCLE_OF_HEALING_TALENT.id) {
      this.circleOfHealingTargetsHit++;
      this.circleOfHealingHealing += event.amount || 0;
      this.circleOfHealingOverhealing += event.overheal || 0;
    }
  }

  statistic() {
    return (

      <TraitStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.CIRCLE_OF_HEALING_TALENT.id} />}
        value={(
          <ItemHealingDone amount={this.circleOfHealingHealing} />
        )}
        label="Circle of Healing"
        tooltip={`
          Coh Casts: ${this.circleOfHealingCasts}<br />
          Total Healing: ${formatThousands(this.circleOfHealingHealing)} (${formatPercentage(this.overHealPercent)}% OH)<br />
          Average Targets Hit: ${this.averageTargetsHit.toFixed(2)}
        `}
        position={STATISTIC_ORDER.CORE(5)}
      />

    );
  }
}

export default CircleOfHealing;
