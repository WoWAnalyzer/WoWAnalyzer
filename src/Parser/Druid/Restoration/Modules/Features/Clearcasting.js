import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = true;

class Clearcasting extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  // With MoC, there's no actual indication in the events that you have it...
  // In fact the Clearcasting buff doesn't show with stacks.
  // You'll appear as casting Regrowths without the buff disappating, and then on the 3rd Regrowth it goes away.
  hasMoC;
  procsPerCC;

  totalProcs = 0;
  expiredProcs = 0;
  overwrittenProcs = 0;
  usedProcs = 0;

  availableProcs = 0; // number of free regrowths remaining in current Clearcast. Usually 1, but becomes 3 with MoC.

  nonCCRegrowths = 0;
  totalRegrowths = 0;

  on_initialized() {
    this.hasMoC = this.combatants.selected.hasTalent(SPELLS.MOMENT_OF_CLARITY_TALENT_RESTORATION.id);
    this.procsPerCC = this.hasMoC ? 3 : 1;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CLEARCASTING_BUFF.id) {
      return;
    }

    debug && console.log(`Clearcasting applied @${this.owner.formatTimestamp(event.timestamp)} - ${this.procsPerCC} procs remaining`);
    this.totalProcs += this.procsPerCC;
    this.availableProcs = this.procsPerCC;
  }

  // it looks right now like the refreshbuff handling will never be used, because for whatever reason CC doesn't fire an event when it refreshes...
  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CLEARCASTING_BUFF.id) {
      return;
    }

    debug && console.log(`Clearcasting refreshed @${this.owner.formatTimestamp(event.timestamp)} - overwriting ${this.availableProcs} procs - ${this.procsPerCC} procs remaining`);
    this.totalProcs += this.procsPerCC;
    this.overwrittenProcs += this.availableProcs;
    this.availableProcs = this.procsPerCC;
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CLEARCASTING_BUFF.id) {
      return;
    }

    debug && console.log(`Clearcasting expired @${this.owner.formatTimestamp(event.timestamp)} - ${this.availableProcs} procs expired`);
    if (this.availableProcs < 0) { // there was an invisible refresh after some but not all the MoC charges consumed...
      debug && console.log(`There was an invisible refresh after some but not all MoC charges consumed ... setting available to 0...`);
      this.availableProcs = 0;
    }
    this.expiredProcs += this.availableProcs;
    this.availableProcs = 0;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.REGROWTH.id) {
      return;
    }
    this.totalRegrowths += 1;

    if (this.combatants.selected.hasBuff(SPELLS.CLEARCASTING_BUFF.id)) {
      this.availableProcs -= 1;
      this.usedProcs += 1;
      debug && console.log(`Regrowth w/CC cast @${this.owner.formatTimestamp(event.timestamp)} - ${this.availableProcs} procs remaining`);
    } else {
      this.nonCCRegrowths += 1;
    }
  }

  get wastedProcs() {
    return this.expiredProcs + this.overwrittenProcs;
  }

  get clearcastingUtilPercent() {
    const util = this.usedProcs / this.totalProcs;
    return (util > 1) ? 1 : util; // invisible refresh + MoC can make util greater than 100% ... in that case clamp to 100%
  }

  get hadInvisibleRefresh() {
    return this.usedProcs > this.totalProcs;
  }

  get clearcastingUtilSuggestionThresholds() {
    return {
      actual: this.clearcastingUtilPercent,
      isLessThan: {
        minor: 0.90,
        average: 0.50,
        major: 0.25,
      },
      style: 'percentage',
    };
  }

  get nonCCRegrowthsPerMinute() {
    return this.nonCCRegrowths / (this.owner.fightDuration / 60000);
  }

  get nonCCRegrowthsSuggestionThresholds() {
    return {
      actual: this.nonCCRegrowthsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 3,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.clearcastingUtilSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> procs should be used quickly so they do not get overwritten or expire.</Wrapper>)
          .icon(SPELLS.CLEARCASTING_BUFF.icon)
          .actual(`You missed ${this.wastedProcs} out of ${this.totalProcs} (${formatPercentage(1 - this.clearcastingUtilPercent, 1)}%) of your free regrowth procs`)
          .recommended(`<${Math.round(formatPercentage(1 - recommended, 1))}% is recommended`);
      });
    when(this.nonCCRegrowthsSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper><SpellLink id={SPELLS.REGROWTH.id} /> is a very inefficient spell to cast without a <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> proc. It should only be cast when your target is about to die and you do not have <SpellLink id={SPELLS.SWIFTMEND.id} /> available.</Wrapper>)
          .icon(SPELLS.REGROWTH.icon)
          .actual(`You cast ${this.nonCCRegrowthsPerMinute.toFixed(1)} Regrowths per minute without a Clearcasting proc.`)
          .recommended(`${recommended.toFixed(1)} CPM is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CLEARCASTING_BUFF.id} />}
        value={`${formatPercentage(this.clearcastingUtilPercent, 1)} %`}
        label="Clearcasting Util"
        tooltip={`Clearcasting procced <b>${this.totalProcs} free Regrowths</b>
            <ul>
              <li>Used: <b>${this.usedProcs} ${this.hadInvisibleRefresh ? '*' : ''}</b></li>
              <li>Expired: <b>${this.expiredProcs}</b></li>
            </ul>
            <b>${this.nonCCRegrowths} of your Regrowths were cast without a Clearcasting proc</b>.
            Using a clearcasting proc as soon as you get it should be one of your top priorities.
            Even if it overheals you still get that extra mastery stack on a target and the minor HoT.
            Spending your GCD on a free spell also helps with mana management in the long run.<br />
            ${this.hadInvisibleRefresh ? `<i>* Mark of Clarity can sometimes 'invisibly refresh', which can make your total procs show as lower than you actually got. Basically, you invisibly overwrote some number of procs, but we aren't able to see how many.</i>` : ''}`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(20);

}

export default Clearcasting;
