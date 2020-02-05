import React from 'react';

import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import StatTracker from 'parser/shared/modules/StatTracker';
import ItemHealingDone from 'interface/ItemHealingDone';

const SMALL_SIPHON = 0.03;
const MEDIUM_SIPHON = 0.05;
const BIG_SIPHON = 0.08;

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
    leechPercent += this.selectedCombatant.getCorruptionCount(SPELLS.SIPHONER_3.id) * SMALL_SIPHON;
    leechPercent += this.selectedCombatant.getCorruptionCount(SPELLS.SIPHONER_5.id) * MEDIUM_SIPHON;
    leechPercent += this.selectedCombatant.getCorruptionCount(SPELLS.SIPHONER_8.id) * BIG_SIPHON;

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
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SIPHONER_8.id} />}
        value={<ItemHealingDone amount={this.healing} />}
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.OPTIONAL(60)}
        label={<SpellLink id={SPELLS.SIPHONER_8.id} icon={false} />}
      />
    );
  }
}

export default Siphoner;
