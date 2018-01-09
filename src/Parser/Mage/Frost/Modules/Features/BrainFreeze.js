import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatMilliseconds, formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';

const debug = false;

// Brain Freeze appears to always fall after Flurry cast, but not always on same timestamp. Giving a margin here.
const PROC_WINDOW_MS = 100;

class BrainFreezeTracker extends Analyzer {
	static dependencies = {
		combatants: Combatants,
  };

	lastFlurryTimestamp;

	overwrittenProcs = 0;
	expiredProcs = 0;
	totalProcs = 0;
	flurryWithoutProc = 0;

	on_byPlayer_applybuff(event) {
		const spellId = event.ability.guid;
    if (spellId !== SPELLS.BRAIN_FREEZE.id) {
			return;
		}
		this.totalProcs += 1;
	}

	on_byPlayer_refreshbuff(event) {
		const spellId = event.ability.guid;
    if (spellId !== SPELLS.BRAIN_FREEZE.id) {
			return;
		}
		this.overwrittenProcs += 1;
		this.totalProcs += 1;
    if (debug) {
      console.log("Brain Freeze proc overwritten @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
	}
  }

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
    if (spellId !== SPELLS.FLURRY.id) {
			return;
		}
		this.lastFlurryTimestamp = this.owner.currentTimestamp;
		if (!this.combatants.selected.hasBuff(SPELLS.BRAIN_FREEZE.id)) {
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
      if (debug) {
        console.log("Brain Freeze proc expired @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
			}
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
		return this.totalProcs - this.wastedProcs;
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

	get overwriteSuggestionThresholds() {
		return {
      actual: this.overwrittenPercent,
      isGreaterThan: {
        minor: 0.00,
        average: 0.08,
        major: 0.16,
      },
      style: 'percentage',
    };
	}

	// correct play with Glacial Spike puts you in a situation to sometimes overwrite BF, hence the more lax standard
	get glacialSpikeOverwriteSuggestionThresholds() {
		return {
      actual: this.overwrittenPercent,
      isGreaterThan: {
        minor: 0.05,
        average: 0.15,
        major: 0.25,
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
      actual: this.expiredPercent,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 3,
      },
      style: 'number',
    };
	}

	suggestions(when) {
    if (this.combatants.selected.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id)) {
			when(this.glacialSpikeOverwriteSuggestionThresholds)
				.addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You overwrote {formatPercentage(this.overwrittenPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs. While this is sometimes acceptable when saving a proc for <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} />, try to otherwise use your procs as soon as possible. You may hold your proc for <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> if you have 3 or more <SpellLink id={SPELLS.ICICLES_BUFF.id} />, otherwise you should use it immediately.</span>)
						.icon(SPELLS.BRAIN_FREEZE.icon)
						.actual(`${formatPercentage(this.overwrittenPercent)}% overwritten`)
						.recommended(`Overwriting none is recommended`);
				});
		} else {
			when(this.overwriteSuggestionThresholds)
				.addSuggestion((suggest, actual, recommended) => {
					return suggest(<span>You overwrote {formatPercentage(this.overwrittenPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs. Try to use your procs as soon as possible to avoid this.</span>)
						.icon(SPELLS.BRAIN_FREEZE.icon)
						.actual(`${formatPercentage(this.overwrittenPercent)}% overwritten`)
						.recommended(`Overwriting none is recommended`);
				});
		}

		when(this.expiredSuggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span>You allowed {formatPercentage(this.expiredPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs to expire. Try to use your procs as soon as possible to avoid this.</span>)
					.icon(SPELLS.BRAIN_FREEZE.icon)
					.actual(`${formatPercentage(this.expiredPercent)}% expired`)
					.recommended(`Letting none expire is recommended`);
			});

		when(this.flurryWithoutProcSuggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span>You cast <SpellLink id={SPELLS.FLURRY.id} /> without <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> {this.flurryWithoutProc} times. You should never hard cast Flurry.</span>)
					.icon(SPELLS.FLURRY.icon)
					.actual(`${formatNumber(this.flurryWithoutProc)} casts`)
					.recommended(`Casting none is recommended`);
			});
	}

	statistic() {
    return (
			<StatisticBox
				icon={<SpellIcon id={SPELLS.BRAIN_FREEZE.id} />}
				value={`${formatPercentage(this.utilPercent, 0)} %`}
        label="Brain Freeze Utilization"
				tooltip={`You got ${this.totalProcs} total procs.
					<ul>
						<li>${this.usedProcs} used</li>
						<li>${this.overwrittenProcs} overwritten</li>
						<li>${this.expiredProcs} expired</li>
					</ul>
				`}
			/>
		);
	}
	statisticOrder = STATISTIC_ORDER.CORE(12);
}

export default BrainFreezeTracker;
