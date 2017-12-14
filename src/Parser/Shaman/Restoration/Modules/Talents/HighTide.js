import React from 'react';

import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class HighTide extends Analyzer {
  healing = 0;

  // const FACTOR_CONTRIBUTED_BY_HT_HIT_1 = 0;
  // const FACTOR_CONTRIBUTED_BY_HT_HIT_2 = 0.17647;
  // const FACTOR_CONTRIBUTED_BY_HT_HIT_3 = 0.32179;
  // const FACTOR_CONTRIBUTED_BY_HT_HIT_4 = 0.44148;
  // const FACTOR_CONTRIBUTED_BY_HT_HIT_5 = 1;


  on_initialized() {
    // WIP
    this.active = false;
    // this.active = this.owner.selectedCombatant.hasTalent(SPELLS.HIGH_TIDE_TALENT.id);
  }


  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (!(spellId === SPELLS.EARTHEN_SHIELD_TOTEM_TALENT.id)) {
      return;
    }

    this.potentialHealing += event.maxHitPoints;
  }

  on_byPlayer_summon(event) {
    const spellId = event.ability.guid;

    if (!(spellId === SPELLS.EARTHEN_SHIELD_TOTEM_TALENT.id)) {
      return;
    }

    // Store the id of the totem we summoned so that we don't include the EST of other rshamans.
    this.activeEST = event.targetID;
  }

  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HIGH_TIDE_TALENT.id} />}
        value={`${formatPercentage(this.healing)} %`}
        label={(
          <dfn data-tip={'The percentage of your healing that is caused by High Tide.'}>

            High Tide healing
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(70);

}

export default HighTide;

