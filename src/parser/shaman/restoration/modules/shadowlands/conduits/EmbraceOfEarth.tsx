import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';
import ConduitSpellText from 'interface/statistics/components/ConduitSpellText';
import { EMBRACE_OF_EARTH_RANKS } from 'parser/shaman/restoration/constants';
import { EARTHSHIELD_HEALING_INCREASE } from 'parser/shaman/shared/talents/EarthShield';

/**
 * Earth Shield increases your healing done to the target by an additional x%
 */
class EmbraceOfEarth extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  conduitRank = 0;
  boost = 0;
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.EMBRACE_OF_EARTH.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }
    this.boost = EMBRACE_OF_EARTH_RANKS[this.conduitRank] / 100;

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.normalizeBoost);
  }

  normalizeBoost(event: HealEvent) {
    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }

    if (target.hasBuff(SPELLS.EARTH_SHIELD_HEAL.id, event.timestamp, 0, 0)) {
      // idea
      // heal = boostedHeal / (1.2 + x)
      // bonusHeal = heal * x
      const boostedHeal = (event.amount || 0) + (event.absorbed || 0) + (event.overheal || 0);
      const heal = boostedHeal / (1 + EARTHSHIELD_HEALING_INCREASE + this.boost);
      const bonusHeal = heal * this.boost;
      const effectiveHealing = Math.max(0, (bonusHeal - (event.overheal || 0)));
      this.healing += effectiveHealing;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spell={SPELLS.EMBRACE_OF_EARTH} rank={this.conduitRank}>
          <ItemHealingDone amount={this.healing} /><br />
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default EmbraceOfEarth;
