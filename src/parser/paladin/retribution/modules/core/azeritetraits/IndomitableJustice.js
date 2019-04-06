import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';

//IJ is a  health comparison with the appropiate data found in event.cast and event.damage data for Judgment
//extra_damage = max(0, max_extra_damage * (my_health_percent - their_health_percent) / 100). Just going to calcualte the average benefit and not include damage number statistics

class IndomitableJustice extends Analyzer {
  percentRatios = [];
  lastPlayerPercent = 1; //Judgment could be pre-cast and it's safe to assume the player is at full health when that happens

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

    console.log("Player health percentage: "+ this.lastPlayerPercent + " - Enemy health percentage: " + enemyhpPercent + " - Health percentage ratio: " + percentDifferenceBonus);
    this.percentRatios.push(percentDifferenceBonus);

  }

  get IJBenefit() {
    return this.percentRatios.reduce((a, b) => a + b, 0) / (this.percentRatios.length || 1);
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="small"
        tooltip={`Indomitable Justice value is determined by a comparison of your health versus your targets health. This is the estimated value for a given fight.`}
      >
        <BoringSpellValueText spell={SPELLS.INDOMITABLE_JUSTICE}>
          {formatPercentage(this.IJBenefit)}% <small>average benefit</small>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default IndomitableJustice;