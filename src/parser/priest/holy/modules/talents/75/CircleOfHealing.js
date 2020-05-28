import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import React from 'react';
import ItemHealingDone from 'interface/ItemHealingDone';
import { formatPercentage, formatThousands } from 'common/format';

// Example Log: /report/aBxvzDZJQP7431Nt/21-Normal+G'huun+-+Kill+(7:11)/15-Liarine
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
      this.circleOfHealingCasts += 1;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CIRCLE_OF_HEALING_TALENT.id) {
      this.circleOfHealingTargetsHit += 1;
      this.circleOfHealingHealing += event.amount || 0;
      this.circleOfHealingOverhealing += event.overheal || 0;
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.CIRCLE_OF_HEALING_TALENT.id}
        value={<ItemHealingDone amount={this.circleOfHealingHealing} />}
        tooltip={(
          <>
            Coh Casts: {this.circleOfHealingCasts}<br />
            Total Healing: {formatThousands(this.circleOfHealingHealing)} ({formatPercentage(this.overHealPercent)}% OH)<br />
            Average Targets Hit: {this.averageTargetsHit.toFixed(2)}
          </>
        )}
        position={STATISTIC_ORDER.CORE(5)}
      />
    );
  }
}

export default CircleOfHealing;
