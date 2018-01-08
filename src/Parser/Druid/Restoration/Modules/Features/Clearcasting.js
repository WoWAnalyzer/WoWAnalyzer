import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class Clearcasting extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  hasMoC;
  procsPerCC;

  totalProcs = 0;
  expiredProcs = 0;
  overwrittenProcs = 0;
  usedProcs = 0;

  availableProcs = 0;

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

    this.totalProcs += this.procsPerCC;
    this.availableProcs = this.procsPerCC;
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CLEARCASTING_BUFF.id) {
      return;
    }

    this.totalProcs += this.procsPerCC;
    this.overwrittenProcs += this.availableProcs;
    this.availableProcs = this.procsPerCC;
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CLEARCASTING_BUFF.id) {
      return;
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
    } else {
      this.nonCCRegrowths += 1;
    }
  }

  get wastedProcs() {
    return this.expiredProcs + this.overwrittenProcs;
  }

  get clearcastingUtilPercent() {
    return this.usedProcs / this.totalProcs;
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
        tooltip={`Clearcasting proced <b>${this.totalProcs} free Regrowths</b>
            <ul>
              <li>Used: <b>${this.usedProcs}</b></li>
              <li>Expired: <b>${this.expiredProcs}</b></li>
              <li>Overwritten: <b>${this.overwrittenProcs}</b></li>
            </ul>
            <b>${this.nonCCRegrowths} of your Regrowths were cast without a Clearcasting proc</b>.
            Using a clearcasting proc as soon as you get it should be one of your top priorities.
            Even if it overheals you still get that extra mastery stack on a target and the minor HoT.
            Spending your GCD on a free spell also helps with mana management in the long run.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(20);

}

export default Clearcasting;
