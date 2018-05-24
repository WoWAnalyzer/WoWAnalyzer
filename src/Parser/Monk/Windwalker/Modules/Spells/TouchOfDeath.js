import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import statTracker from 'Parser/Core/Modules/StatTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class TouchOfDeath extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  expectedBaseDamage = 0;
  expectedGaleBurst = 0;
  totalBaseDamage = 0;
  totalGaleBurst = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.TOUCH_OF_DEATH.id !== spellId) {
      return;
    }
    let masteryRating = statTracker.masteryRatingPerPercent();
    let versatilityRating = statTracker.versatilityRatingPerPercent();
    let masteryPercentage = statTracker.masteryPercentage(masteryRating, true);
    let versatilityPercentage = statTracker.versatilityPercentage(versatilityRating);
    this.expectedBaseDamage = event.maxHitPoints * 0.5 * (1 + masteryPercentage) * (1 + versatilityPercentage);
  }
}
