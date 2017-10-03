import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SuggestionThresholds from '../../SuggestionThresholds';

const CLEARCASTING_DURATION = 15000;
const debug = false;

class Clearcasting extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  totalCCProccs = 0;
  lastCCTimestamp = 0;
  nonCCRegrowths = 0;
  totalRegrowths = 0;
  used = 0;
  lastRegrowthTimestamp = 0;

  on_initialized() {
    // TODO: make this work with MoC
    this.active = !this.combatants.selected.hasTalent(SPELLS.MOMENT_OF_CLARITY_TALENT_RESTORATION.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.CLEARCASTING_BUFF.id !== spellId) {
      return;
    }
    // Get the applied timestamp
    this.lastCCTimestamp = event.timestamp;
    debug && console.log('CC was applied');
    this.totalCCProccs += 1;
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.CLEARCASTING_BUFF.id !== spellId) {
      return;
    }
    // Get the applied timestamp
    this.lastCCTimestamp = event.timestamp;
    debug && console.log('CC was refreshed');
    this.totalCCProccs += 1;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (SPELLS.REGROWTH.id !== spellId) {
      return;
    }
    if (event.tick === true) {
      return;
    }

    // Check for regrowths used without a clearcasting procc
    if (this.lastRegrowthTimestamp !== event.timestamp) {
      if (this.lastCCTimestamp == null) { // TODO: Replace this with === or simple falsey check
        // We got no CC buff up
        this.nonCCRegrowths += 1;
        return;
      }
      const clearcastingTimeframe = this.lastCCTimestamp + CLEARCASTING_DURATION;
      if (event.timestamp > clearcastingTimeframe) {
        this.nonCCRegrowths += 1;
      } else {
        this.used += 1;
        // Reset
        this.lastCCTimestamp = null;
      }
    }
    // We need this parameter to check against double regrowths applications
    // when you cast a regrowth with power of the druid buff up.
    this.lastRegrowthTimestamp = event.timestamp;
  }

  on_byPlayer_cast(event) {
    if (SPELLS.REGROWTH.id === event.ability.guid && !event.tick) {
      this.totalRegrowths += 1;
    }
  }

  get unusedClearcastingPercent() {
    return 1 - (this.used / this.totalCCProccs);
  }

  suggestions(when) {
    when(this.unusedClearcastingPercent).isGreaterThan(SuggestionThresholds.MISSED_CLEARCASTS.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> procs should be used quickly so they do not get overwritten or expire.</span>)
          .icon(SPELLS.CLEARCASTING_BUFF.icon)
          .actual(`You missed ${(this.totalCCProccs - this.used)}/${(this.totalCCProccs)} procs`)
          .recommended(`<${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(SuggestionThresholds.MISSED_CLEARCASTS.regular).major(SuggestionThresholds.MISSED_CLEARCASTS.major);
      });

    const percentNonCCRegrowths = this.nonCCRegrowths / this.totalRegrowths;

    when(percentNonCCRegrowths).isGreaterThan(SuggestionThresholds.NON_CC_REGROWTHS.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span><SpellLink id={SPELLS.REGROWTH.id} /> is an inefficient spell to cast without a <SpellLink id={SPELLS.CLEARCASTING_BUFF.id} /> proc.</span>)
          .icon(SPELLS.REGROWTH.icon)
          .actual(`${formatPercentage(percentNonCCRegrowths)}% of your Regrowths were cast without a Clearcasting proc.`)
          .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(SuggestionThresholds.NON_CC_REGROWTHS.regular).major(SuggestionThresholds.NON_CC_REGROWTHS.major);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CLEARCASTING_BUFF.id} />}
        value={`${formatPercentage(this.unusedClearcastingPercent)} %`}
        label="Unused Clearcasts"
        tooltip={`You got <b>${this.totalCCProccs} Clearcasting procs</b> and <b>used ${this.used}</b> of them.
            <b>${this.nonCCRegrowths} of your Regrowths were used without a Clearcasting proc</b>.
            Using a clearcasting proc as soon as you get it should be one of your top priorities.
            Even if it overheals you still get that extra mastery stack on a target and the minor HoT.
            Spending your GCD on a free spell also helps with mana management in the long run.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(20);

}

export default Clearcasting;
