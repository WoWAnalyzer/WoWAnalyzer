import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer from 'parser/core/Analyzer';

const debug = false;

// Brain Freeze appears to always fall after Flurry cast, but not always on same timestamp. Giving a margin here.
const PROC_WINDOW_MS = 100;

// If you have at least this many icicles *during* your frostbolt cast you should hold the proc for glacial spike, if talented. If you have fewer, the proc should be used immediately.
const MIN_ICICLES_DURING_FB_CAST_FOR_HOLD = 3;

class BrainFreeze extends Analyzer {
  lastFlurryTimestamp = null;

  overwrittenProcs = 0;
  okOverwrittenProcs = 0;
  expiredProcs = 0;
  totalProcs = 0;
  flurryWithoutProc = 0;

  // Tracks whether the last brain freeze generator to be cast was Ebonbolt or Frostbolt
  wasLastGeneratorEB = false;

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

    if (!this.glacialSpikeTalented || this.wasLastGeneratorEB) {
      this.overwrittenProcs += 1;
      debug && this.debug("Brain Freeze proc overwritten w/o GS talented or by EB");
      return;
    }

    // Get the number of icicles the player has *after* the cast of the frostbolt
    const stacks = this.selectedCombatant.getBuff(SPELLS.ICICLES_BUFF.id).stacks || 0;

    // The icicle const relates to the number of icicles the player had *during* the cast of frostbolt, so increment by 1 to check against icicles *after* the cast
    if (stacks < (MIN_ICICLES_DURING_FB_CAST_FOR_HOLD + 1)) {
      this.overwrittenProcs += 1;
      debug && this.debug("Brain Freeze proc overwritten w/ GS talented with too few icicles");
    } else {
      this.okOverwrittenProcs += 1;
      debug && this.debug("Acceptable Brain Freeze proc overwritten w/ GS talented");
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if(spellId === SPELLS.FROSTBOLT.id || spellId === SPELLS.EBONBOLT_TALENT.id) {
      this.wasLastGeneratorEB = spellId === SPELLS.EBONBOLT_TALENT.id;
    } else if (spellId === SPELLS.FLURRY.id) {
      this.lastFlurryTimestamp = this.owner.currentTimestamp;
      if (!this.selectedCombatant.hasBuff(SPELLS.BRAIN_FREEZE.id) && !this.selectedCombatant.hasBuff(SPELLS.WINTERS_REACH_BUFF.id)) {
        this.flurryWithoutProc += 1;
      }
    }

  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BRAIN_FREEZE.id) {
      return;
    }
    if (!this.lastFlurryTimestamp || this.lastFlurryTimestamp + PROC_WINDOW_MS < this.owner.currentTimestamp) {
      this.expiredProcs += 1; // it looks like Brain Freeze is always removed after the cast, and always on same timestamp
      debug && this.debug("Brain Freeze proc expired");
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

  // Percentages lowered from .00, .08, .16; with the addition of the forgiveness window it is almost as bad as letting BF expire when you waste a proc
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
          suggestBuilder = suggest(<>You overwrote {formatPercentage(this.overwrittenPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs incorrectly. You should use <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> immediately following <SpellLink id={SPELLS.FROSTBOLT.id} /> if you have fewer than {MIN_ICICLES_DURING_FB_CAST_FOR_HOLD} <SpellLink id={SPELLS.ICICLES_BUFF.id} /> during the <SpellLink id={SPELLS.FROSTBOLT.id} /> cast. If you have {MIN_ICICLES_DURING_FB_CAST_FOR_HOLD} or more <SpellLink id={SPELLS.ICICLES_BUFF.id} /> during the <SpellLink id={SPELLS.FROSTBOLT.id} /> cast, save the <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc for <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} />.</>);
          // suggestBuilder = suggest(<>You overwrote {formatPercentage(this.overwrittenPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs incorrectly. You should only hold <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> for <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> if you have {CONST_NAME} icicles, or would have {CONST_NAME} <SpellLink id={SPELLS.ICICLES_BUFF.id} /> after your current <SpellLink id={SPELLS.FROSTBOLT.id} /> cast. If you have {MIN_ICICLES_DURING_FB_CAST_FOR_HOLD} or more <SpellLink id={SPELLS.ICICLES_BUFF.id} /> during the <SpellLink id={SPELLS.FROSTBOLT.id} /> cast, save the <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> proc for <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} />.</>);
        } else {
          suggestBuilder = suggest(<>You overwrote {formatPercentage(this.overwrittenPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs. Try to use your procs as soon as possible to avoid this.</>);
        }
        return suggestBuilder.icon(SPELLS.BRAIN_FREEZE.icon)
          .actual(`${formatPercentage(this.overwrittenPercent)}% overwritten`)
          .recommended(`Overwriting none is recommended`);
      });

    when(this.expiredSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You allowed {formatPercentage(this.expiredPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs to expire. Try to use your procs as soon as possible to avoid this.</>)
          .icon(SPELLS.BRAIN_FREEZE.icon)
          .actual(`${formatPercentage(this.expiredPercent)}% expired`)
          .recommended(`Letting none expire is recommended`);
      });

    when(this.flurryWithoutProcSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You cast <SpellLink id={SPELLS.FLURRY.id} /> without <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> or <SpellLink id={SPELLS.WINTERS_REACH_TRAIT.id} /> {this.flurryWithoutProc} times. The only time it is acceptable to hard case Flurry is if you have a proc of the Winter's Reach Azerite Trait.</>)
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
