import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';

const EARTH_SHIELD_BOOST = .1;

/**
 * Earth Shield increases your healing done to the target by an additional x%
 */
class EmbraceOfEarth extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  boost = 0;
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = false;
    this.boost = .05;//TODO Get from combat data when they EXPORT IT >:c

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.normalizeBoost);
  }

  normalizeBoost(event: HealEvent) {
    const target = this.combatants.getEntity(event);

    if (!target) {
      return;
    }

    if (target.hasBuff(SPELLS.EARTH_SHIELD.id, event.timestamp, 0, 0)) {
      // idea
      // heal = boostedHeal / (1.1 + x)
      // bonusHeal = heal * x
      const boostedHeal = (event.amount || 0) + (event.absorbed || 0) + (event.overheal || 0);
      const heal = boostedHeal / (1 + EARTH_SHIELD_BOOST + this.boost);
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
        <BoringSpellValueText spell={SPELLS.EMBRACE_OF_EARTH}>
          <ItemHealingDone amount={this.healing} /><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EmbraceOfEarth;
