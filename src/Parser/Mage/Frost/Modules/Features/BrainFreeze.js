import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatMilliseconds, formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';

const debug = false;

// Brain Freeze appears to always fall after Flurry cast, but not always on same timestamp. Giving a margin here.
const PROC_WINDOW_MS = 100;

// When Glacial Spike is talented, it's OK to overwrite Brain Freeze procs if you have at least this many icicles during the frost bolt cast
const ICICLE_BREAKPOINT = 3;

class BrainFreeze extends Analyzer {
  lastFlurryTimestamp;

  overwrittenProcs = 0;
  okOverwrittenProcs = 0;
  expiredProcs = 0;
  totalProcs = 0;
  flurryWithoutProc = 0;

  constructor(...args) {
    super(...args);
    this.glacialSpikeTalented = this.selectedCombatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BRAIN_FREEZE.id) {
      this.totalProcs += 1;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BRAIN_FREEZE.id) {
      return;
    }
    this.totalProcs += 1;

    if (!this.glacialSpikeTalented) {
      this.overwrittenProcs += 1;
      debug && console.log("Brain Freeze proc overwritten w/o GS talented @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
      return;
    }

    // Get the number of icicles the player had during the cast of the frostbolt
    const stacksDuringCast = this.selectedCombatant.getBuff(SPELLS.ICICLES_BUFF.id, this.owner.currentTimestamp - 250).stacks || 0;
    if (stacksDuringCast < ICICLE_BREAKPOINT) {
      this.overwrittenProcs += 1;
      debug && console.log("Brain Freeze proc overwritten w/ GS talented with too few icicles @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    } else {
      this.okOverwrittenProcs += 1;
      debug && console.log("Acceptable Brain Freeze proc overwritten w/ GS talented @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FLURRY.id) {
      return;
    }
    this.lastFlurryTimestamp = this.owner.currentTimestamp;
    if (!this.selectedCombatant.hasBuff(SPELLS.BRAIN_FREEZE.id) && !this.selectedCombatant.hasBuff(SPELLS.WINTERS_REACH_BUFF.id)) {
      this.flurryWithoutProc += 1;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BRAIN_FREEZE.id) {
      return;
    }
    if (!this.lastFlurryTimestamp || this.lastFlurryTimestamp + PROC_WINDOW_MS < this.owner.currentTimestamp) {
      this.expiredProcs += 1; // it looks like Brain Freeze is always removed after the cast, and always on same timestamp
      debug && console.log("Brain Freeze proc expired @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    }
  }

  get overwrittenPercent() {
    return (this.overwrittenProcs / this.totalProcs) || 0;
  }

  get expiredPercent() {
    return (this.expiredProcs / this.totalProcs) || 0;
  }

  get wastedProcs() {
    return this.overwrittenProcs + this.expiredProcs;
  }

  get wastedPercent() {
    return (this.wastedProcs / this.totalProcs) || 0;
  }

  get usedProcs() {
    // Even though okOverwrittenProcs do not count against the player, they are not used procs
    return this.totalProcs - this.wastedProcs - this.okOverwrittenProcs;
  }

  get utilPercent() {
    return 1 - this.wastedPercent;
  }

  get utilSuggestionThresholds() {
    return {
      actual: this.utilPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  // Percentages lowered from .03, .08, .16; with the addition of the forgiveness window it is almost as bad as letting BF expire when you waste a proc
  get overwriteSuggestionThresholds() {
    return {
      actual: this.overwrittenPercent,
      isGreaterThan: {
        minor: 0.00,
        average: 0.05,
        major: 0.10,
      },
      style: 'percentage',
    };
  }

  // there's almost never an excuse to let BF expire
  get expiredSuggestionThresholds() {
    return {
      actual: this.expiredPercent,
      isGreaterThan: {
        minor: 0.00,
        average: 0.03,
        major: 0.06,
      },
      style: 'percentage',
    };
  }

  get flurryWithoutProcSuggestionThresholds() {
    return {
      actual: this.flurryWithoutProc,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 3,
      },
      style: 'number',
    };
  }

  suggestions(when) {

    when(this.overwriteSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        let suggestBuilder;
        if (this.glacialSpikeTalented) {
          suggestBuilder = suggest(<React.Fragment>You overwrote {formatPercentage(this.overwrittenPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs incorrectly. You may hold your proc for <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> if you have {ICICLE_BREAKPOINT} or more <SpellLink id={SPELLS.ICICLES_BUFF.id} />, otherwise you should use it immediately after a frost bolt and follow up with an ice lance.</React.Fragment>);
        } else {
          suggestBuilder = suggest(<React.Fragment>You overwrote {formatPercentage(this.overwrittenPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs. Try to use your procs as soon as possible to avoid this.</React.Fragment>);
        }
        return suggestBuilder.icon(SPELLS.BRAIN_FREEZE.icon)
          .actual(`${formatPercentage(this.overwrittenPercent)}% overwritten`)
          .recommended(`Overwriting none is recommended`);
      });

    when(this.expiredSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You allowed {formatPercentage(this.expiredPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs to expire. Try to use your procs as soon as possible to avoid this.</React.Fragment>)
          .icon(SPELLS.BRAIN_FREEZE.icon)
          .actual(`${formatPercentage(this.expiredPercent)}% expired`)
          .recommended(`Letting none expire is recommended`);
      });

    when(this.flurryWithoutProcSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You cast <SpellLink id={SPELLS.FLURRY.id} /> without <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> or <SpellLink id={SPELLS.WINTERS_REACH_TRAIT.id} /> {this.flurryWithoutProc} times. The only time it is acceptable to hard case Flurry is if you have a proc of the Winter's Reach Azerite Trait.</React.Fragment>)
          .icon(SPELLS.FLURRY.icon)
          .actual(`${formatNumber(this.flurryWithoutProc)} casts`)
          .recommended(`Casting none is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(15)}
        icon={<SpellIcon id={SPELLS.BRAIN_FREEZE.id} />}
        value={`${formatPercentage(this.utilPercent, 0)} %`}
        label="Brain Freeze Utilization"
        tooltip={`You got ${this.totalProcs} total procs.
					<ul>
						<li>${this.usedProcs} used</li>
						<li>${this.overwrittenProcs + this.okOverwrittenProcs} overwritten${this.okOverwrittenProcs > 0 ? ` (${this.okOverwrittenProcs} of which were acceptable holds for Glacial Spike)` : ''}</li>
						<li>${this.expiredProcs} expired</li>
					</ul>
				`}
      />
    );
  }
}

export default BrainFreeze;
