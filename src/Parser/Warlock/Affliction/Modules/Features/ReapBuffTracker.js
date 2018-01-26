import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../Constants';

class ReapBuffTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  totalTicks = 0;
  buffedTicks = 0;

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!UNSTABLE_AFFLICTION_DEBUFF_IDS.includes(spellId)) {
      return;
    }
    this.totalTicks += 1;
    if (this.combatants.selected.hasBuff(SPELLS.DEADWIND_HARVESTER.id, event.timestamp)) {
      this.buffedTicks += 1;
    }
  }

  get unbuffedTicks() {
    return this.totalTicks - this.buffedTicks;
  }

  get suggestionThresholds() {
    return {
      actual: (this.unbuffedTicks / this.totalTicks) || 1,  // if no UAs were cast (totalTicks and unbuffedTicks = 0), it should return NaN and thus be 1 (100% unbuffed ticks)
      isGreaterThan: {
        // TODO
        minor: 0.15,
        average: 0.2,
        major: 0.25,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id}/> aren't buffed enough by <SpellLink id={SPELLS.REAP_SOULS.id}/>. You should delay your Unstable Affliction casts until you have enough <SpellLink id={SPELLS.WARLOCK_TORMENTED_SOULS.id}/> to buff them (but <strong>don't overcap</strong> your Soul Shards while doing so).</Wrapper>)
          .icon(SPELLS.DEADWIND_HARVESTER.icon)
          .actual(`${formatPercentage(actual)}% unbuffed Unstable Affliction ticks.`)
          .recommended(`< ${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    const buffedTicksPercentage = (this.buffedTicks / this.totalTicks) || 1; // if no UAs were cast the result should be 0% buffed ticks
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEADWIND_HARVESTER.id} />}
        value={`${formatPercentage(buffedTicksPercentage)} %`}
        label="UA ticks buffed by Reap Souls"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default ReapBuffTracker;
