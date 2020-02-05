import React from 'react';

import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import SPELLS from 'common/SPELLS/index';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import StatTracker from 'parser/shared/modules/StatTracker';
import ItemHealingDone from 'interface/ItemHealingDone';

const T1_SIPHON = 0.03;
const T2_SIPHON = 0.05;
const T3_SIPHON = 0.08;

class Siphoner extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  leechRatingFromSiphoner = 0;
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasCorruptionByName("Siphoner");
    if (!this.active) {
      return;
    }

    let leechPercent = 0;
    leechPercent += this.selectedCombatant.getCorruptionCount(SPELLS.SIPHONER_T1.id) * T1_SIPHON;
    leechPercent += this.selectedCombatant.getCorruptionCount(SPELLS.SIPHONER_T2.id) * T2_SIPHON;
    leechPercent += this.selectedCombatant.getCorruptionCount(SPELLS.SIPHONER_T3.id) * T3_SIPHON;

    this.leechRatingFromSiphoner = leechPercent * this.statTracker.leechRatingPerPercent;

    this.statTracker.forceChangeStats({ leech: this.leechRatingFromSiphoner }, "Siphoner");

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LEECH), this.leech);
  }

  leech(event) {
    const siph = this.leechRatingFromSiphoner / this.statTracker.currentLeechRating;
    const effectiveHealing = calculateEffectiveHealing(event, siph);
    this.healing += effectiveHealing;
  }

  statistic() {
    return (
      <ItemStatistic size="flexible">
        <BoringSpellValueText spell={SPELLS.SIPHONER_T3}>
        <ItemHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }
}

export default Siphoner;
