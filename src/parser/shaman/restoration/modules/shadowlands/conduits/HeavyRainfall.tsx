import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';

import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';
import ConduitSpellText from 'interface/statistics/components/ConduitSpellText';
import { HEAVY_RAINFALL_RANKS } from 'parser/shaman/restoration/constants';

/**
 * Whenever you cast healing tide totem you gain a buff that increases your healing rain healing by x% for 20 seconds
 * https://www.warcraftlogs.com/reports/8HtnKrqLJ7y9VFQ6#fight=21&type=summary&source=88
 */
class HeavyRainfall extends Analyzer {
  conduitRank = 0;
  healingBoost = 0;
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.HEAVY_RAINFALL.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }
    this.healingBoost = HEAVY_RAINFALL_RANKS[this.conduitRank] / 100;

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HEALING_RAIN_HEAL), this.normalizeBoost);
  }

  normalizeBoost(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.HEAVY_RAINFALL_BUFF.id)) {
      this.healing += calculateEffectiveHealing(event, this.healingBoost);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spell={SPELLS.HEAVY_RAINFALL} rank={this.conduitRank}>
          <ItemHealingDone amount={this.healing} /><br />
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default HeavyRainfall;
