import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../Constants';

const UA_IDS_SET = new Set(UNSTABLE_AFFLICTION_DEBUFF_IDS);

class UABuffTracker extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  totalTicks = 0;
  unbuffedTicks = 0;
  ticksBuffedByReap = 0;
  ticksBuffedByDrain = 0;
  ticksBuffedByHaunt = 0;
  ticksBuffedByBoth = 0;
  _hasMG = false;
  _hasHaunt = false;

  on_initialized() {
    this._hasMG = this.combatants.selected.hasTalent(SPELLS.MALEFIC_GRASP_TALENT.id);
    this._hasHaunt = this.combatants.selected.hasTalent(SPELLS.HAUNT_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!UA_IDS_SET.has(spellId)) {
      return;
    }
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }
    this.totalTicks += 1;
    const buffedByReap = this.combatants.selected.hasBuff(SPELLS.DEADWIND_HARVESTER.id, event.timestamp);
    const buffedByDrain = target.hasBuff(SPELLS.DRAIN_SOUL.id, event.timestamp);
    const buffedByHaunt = target.hasBuff(SPELLS.HAUNT_TALENT.id, event.timestamp);

    if (this._hasMG) {
      if (buffedByReap && buffedByDrain) {
        this.ticksBuffedByBoth += 1;
      } else if (buffedByReap) {
        this.ticksBuffedByReap += 1;
      } else if (buffedByDrain) {
        this.ticksBuffedByDrain += 1;
      } else {
        this.unbuffedTicks += 1;
      }
    } else if (this._hasHaunt) {
      if (buffedByReap && buffedByHaunt) {
        this.ticksBuffedByBoth += 1;
      } else if (buffedByReap) {
        this.ticksBuffedByReap += 1;
      } else if (buffedByHaunt) {
        this.ticksBuffedByHaunt += 1;
      } else {
        this.unbuffedTicks += 1;
      }
    } else if (buffedByReap) {
      this.ticksBuffedByReap += 1;
    } else {
      this.unbuffedTicks += 1;
    }
  }

  get suggestionThresholds() {
    return {
      actual: (this.unbuffedTicks / this.totalTicks) || 1,  // if no UAs were cast (totalTicks and unbuffedTicks = 0), it should return NaN and thus be 1 (100% unbuffed ticks)
      isGreaterThan: {
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
        return suggest(<Wrapper>Your <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id}/> could be buffed more. Unstable Affliction is your main source of damage so keeping it buffed as much as possible with <SpellLink id={SPELLS.REAP_SOULS.id}/>, <SpellLink id={SPELLS.DRAIN_SOUL.id}/> (if using the <SpellLink id={SPELLS.MALEFIC_GRASP_TALENT.id}/> talent) or <SpellLink id={SPELLS.HAUNT_TALENT.id}/> (if using the talent) is very important.</Wrapper>)
          .icon(SPELLS.UNSTABLE_AFFLICTION_CAST.icon)
          .actual(`${formatPercentage(actual)}% unbuffed Unstable Affliction ticks.`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    const buffedTicksPercentage = 1 - ((this.unbuffedTicks / this.totalTicks) || 1); // if no UAs were cast the result should be 0% buffed ticks
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} />}
        value={`${formatPercentage(buffedTicksPercentage)} %`}
        label="UA buffed ticks"
        tooltip={`Your Unstable Afflictions ticked ${this.totalTicks} times in total. Out of that amount:
          <ul>
          ${this._hasMG && this.ticksBuffedByBoth > 0 ? `
            <li>${this.ticksBuffedByBoth} ticks were buffed by both Reap Souls and Drain Soul (${formatPercentage(this.ticksBuffedByBoth / this.totalTicks)}%)</li>
          ` : ''}
          ${this._hasHaunt && this.ticksBuffedByBoth > 0 ? `
            <li>${this.ticksBuffedByBoth} ticks were buffed by both Reap Souls and Haunt (${formatPercentage(this.ticksBuffedByBoth / this.totalTicks)}%)</li>
          ` : ''}

          ${this.ticksBuffedByReap > 0 ? `
            <li>${this.ticksBuffedByReap} ticks were buffed by Reap Souls only (${formatPercentage(this.ticksBuffedByReap / this.totalTicks)}%)</li>
          ` : ''}

          ${this._hasMG && this.ticksBuffedByDrain > 0 ? `
            <li>${this.ticksBuffedByDrain} ticks were buffed by Drain Soul only (${formatPercentage(this.ticksBuffedByDrain / this.totalTicks)}%)</li>
          ` : ''}

          ${this._hasHaunt && this.ticksBuffedByHaunt > 0 ? `
            <li>${this.ticksBuffedByHaunt} ticks were buffed by Haunt only (${formatPercentage(this.ticksBuffedByHaunt / this.totalTicks)}%)</li>
          ` : ''}

          ${this.unbuffedTicks > 0 ? `
            <li>${this.unbuffedTicks} ticks were unbuffed (${formatPercentage(this.unbuffedTicks / this.totalTicks)}%). Try to minimize this amount as much as possible.</li>
          ` : ''}
          </ul>
        `}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default UABuffTracker;
