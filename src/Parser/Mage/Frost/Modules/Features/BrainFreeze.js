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

	get wastedProcs() {
		return this.overwrittenProcs + this.expiredProcs;
	}

	get usedProcs() {
		return this.totalProcs - this.wastedProcs;
	}

	get brainFreezeUtil() {
		return 1 - (this.wastedProcs / this.totalProcs) || 0;
	}

	get brainFreezeUtilSuggestionThresholds() {
    return {
      actual: this.brainFreezeUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.70,
      },
      style: 'percentage',
    };
  }

	suggestions(when) {
		const overwrittenProcsPercent = (this.overwrittenProcs / this.totalProcs) || 0;
    if (this.combatants.selected.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id)) {
			when(overwrittenProcsPercent).isGreaterThan(.05)
				.addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You overwrote {formatPercentage(overwrittenProcsPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs. While this is sometimes acceptable when saving a proc for <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} />, try to otherwise use your procs as soon as possible. You may hold your proc for <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> if you have 3 or more <SpellLink id={SPELLS.ICICLES_BUFF.id} />, otherwise you should use it immediately.</span>)
						.icon(SPELLS.BRAIN_FREEZE.icon)
						.actual(`${formatPercentage(overwrittenProcsPercent)}% missed`)
						.recommended(`Wasting none is recommended`)
						.regular(.08).major(.15);
				});
		} else {
			when(overwrittenProcsPercent).isGreaterThan(0)
				.addSuggestion((suggest, actual, recommended) => {
					return suggest(<span>You overwrote {formatPercentage(overwrittenProcsPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs. Try to use your procs as soon as possible to avoid this.</span>)
						.icon(SPELLS.BRAIN_FREEZE.icon)
						.actual(`${formatPercentage(overwrittenProcsPercent)}% overwritten`)
						.recommended(`Overwriting none is recommended`)
						.regular(.00).major(.05);
				});
		}

		const expiredProcsPercent = (this.expiredProcs / this.totalProcs) || 0;
		when(expiredProcsPercent).isGreaterThan(0)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span>You allowed {formatPercentage(expiredProcsPercent)}% of your <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs to expire. Try to use your procs as soon as possible to avoid this.</span>)
					.icon(SPELLS.BRAIN_FREEZE.icon)
					.actual(`${formatPercentage(expiredProcsPercent)}% expired`)
					.recommended(`Letting none expire is recommended`)
					.regular(.00).major(.05);
			});

		when(this.flurryWithoutProc).isGreaterThan(0)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span>You cast <SpellLink id={SPELLS.FLURRY.id} /> without <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> {this.flurryWithoutProc} times. You should never hard cast Flurry.</span>)
					.icon(SPELLS.FLURRY.icon)
					.actual(`${formatNumber(this.flurryWithoutProc)} casts`)
					.recommended(`Casting none is recommended`)
					.regular(0).major(1);
			});
	}

	statistic() {
    return (
			<StatisticBox
				icon={<SpellIcon id={SPELLS.BRAIN_FREEZE.id} />}
				value={`${formatPercentage(this.brainFreezeUtil, 0)} %`}
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
