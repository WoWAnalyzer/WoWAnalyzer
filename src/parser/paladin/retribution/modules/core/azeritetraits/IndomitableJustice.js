import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { formatPercentage } from 'common/format';

//IJ is a  health comparison with the appropiate data found in event.cast and event.damage data for Judgment
//extra_damage = max(0, max_extra_damage * (my_health_percent - their_health_percent) / 100). Just going to calcualte the average benefit and not include damage number statistics

class IndomitableJustice extends Analyzer {
  percentRatios = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.INDOMITABLE_JUSTICE.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_CAST), this.onJudgmentCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_CAST), this.onJudgmentDamage);
  }

  onJudgmentCast(event) {
    this.lastPlayerPercent = event.hitPoints / event.maxHitPoints;
  }

  onJudgmentDamage(event) {
    const enemyhpPercent = event.hitPoints / event.maxHitPoints;
    const percentDifferenceBonus = Math.max(this.lastPlayerPercent - enemyhpPercent, 0);
    const perfectBonus = 1 - enemyhpPercent;
    this.percentRatios.push(percentDifferenceBonus / perfectBonus);

  }

  get IJBenefit() {
    return this.percentRatios.reduce((a, b) => a + b, 0) / (this.percentRatios.length || 1);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.INDOMITABLE_JUSTICE.id}
        value={`${formatPercentage(this.IJBenefit)}%`}
        label="Benefit"
        tooltip={`Indomitable Justice value is determined by a comparison of your health versus your targets health. This is the estimated value for a given fight.`}
      />
    );
  }
}

export default IndomitableJustice;