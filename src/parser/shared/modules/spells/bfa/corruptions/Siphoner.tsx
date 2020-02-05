import React from 'react';

import Events, { HealEvent } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import SPELLS from 'common/SPELLS/index';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import StatTracker from 'parser/shared/modules/StatTracker';
import ItemHealingDone from 'interface/ItemHealingDone';

const T1_SIPHON: number = 0.03;
const T2_SIPHON: number = 0.05;
const T3_SIPHON: number = 0.08;

class Siphoner extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  protected statTracker!: StatTracker;

  leechRatingFromSiphoner: number = 0;
  healing: number = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasCorruptionByName("Siphoner");
    if (!this.active) {
      return;
    }

    let leechPercent: number = 0;
    leechPercent += this.selectedCombatant.getCorruptionCount(SPELLS.SIPHONER_T1.id) * T1_SIPHON;
    leechPercent += this.selectedCombatant.getCorruptionCount(SPELLS.SIPHONER_T2.id) * T2_SIPHON;
    leechPercent += this.selectedCombatant.getCorruptionCount(SPELLS.SIPHONER_T3.id) * T3_SIPHON;

    this.leechRatingFromSiphoner = leechPercent * options.statTracker.leechRatingPerPercent;

    options.statTracker.forceChangeStats({ leech: this.leechRatingFromSiphoner }, "Siphoner");

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LEECH), this.leech);
  }

  leech(event: HealEvent) {
    const siph = this.leechRatingFromSiphoner / this.statTracker.currentLeechRating;
    const effectiveHealing = calculateEffectiveHealing(event, siph);
    this.healing += effectiveHealing;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spell={SPELLS.SIPHONER_T3}>
        <ItemHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Siphoner;
