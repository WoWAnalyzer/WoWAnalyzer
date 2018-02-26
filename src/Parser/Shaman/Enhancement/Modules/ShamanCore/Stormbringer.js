import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Wrapper from 'common/Wrapper';
import { formatMilliseconds, formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';

class Stormbringer extends Analyzer {
	static dependencies = {
		combatants: Combatants,
  };

	lastStormstrikeTimestamp;
	overwrittenProcs = 0;
	expiredProcs = 0;
	totalProcs = 0;

	on_byPlayer_applybuff(event) {
		const spellId = event.ability.guid;
    if (spellId !== SPELLS.STORMBRINGER_BUFF.id) {
			return;
		}
		this.totalProcs += 1;
	}

	on_byPlayer_refreshbuff(event) {
		const spellId = event.ability.guid;
    if (spellId !== SPELLS.STORMBRINGER_BUFF.id) {
			return;
		}
		this.overwrittenProcs += 1;
		this.totalProcs += 1;
  }

	on_byPlayer_removebuff(event) {
		const spellId = event.ability.guid;
    if (spellId !== SPELLS.STORMBRINGER_BUFF.id) {
			return;
		}
    if (this.lastStormstrikeTimestamp < this.owner.currentTimestamp - 12000) {
			this.expiredProcs += 1;
		}
  }

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
    if (spellId !== SPELLS.STORMSTRIKE.id && spellId !== SPELLS.WINDSTRIKE.id) {
			return;
		}
		this.lastStormstrikeTimestamp = this.owner.currentTimestamp;
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

	get overwriteSuggestionThresholds() {
		return {
      actual: this.overwrittenPercent,
      isGreaterThan: {
        minor: 0.00,
        average: 0.10,
        major: 0.20,
      },
      style: 'percentage',
    };
	}

	get expiredSuggestionThresholds() {
		return {
      actual: this.expiredPercent,
      isGreaterThan: {
        minor: 0.00,
        average: 0.00,
        major: 0.00,
      },
      style: 'percentage',
    };
	}

	suggestions(when) {
    {when(this.overwriteSuggestionThresholds)
				.addSuggestion((suggest, actual, recommended) => {
					return suggest(<Wrapper>You had {this.overwrittenProcs} <SpellLink id={SPELLS.STORMBRINGER_BUFF.id} /> procs occur before using a previous <SpellLink id={SPELLS.STORMBRINGER_BUFF.id} /> proc.</Wrapper>)
						.icon(SPELLS.STORMBRINGER_BUFF.icon)
						.actual(`${formatPercentage(this.overwrittenPercent)}% overwritten`)
						.recommended(`Overwriting is unavoidable if this number is high you may not be using procs soon enough.`);
				});
		}

		when(this.expiredSuggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<Wrapper>You allowed {this.expiredProcs} <SpellLink id={SPELLS.STORMBRINGER_BUFF.id} /> procs expire.</Wrapper>)
					.icon(SPELLS.STORMBRINGER_BUFF.icon)
					.actual(`${formatPercentage(this.expiredPercent)}% expired`)
					.recommended(`Letting none expire is recommended`);
			});
	}

	statistic() {
    return (
			<StatisticBox
				icon={<SpellIcon id={SPELLS.STORMBRINGER_BUFF.id} />}
				value={`${this.usedProcs}`}
        label="Stormbringer Procs Utilized"
				tooltip={`Of ${this.totalProcs} total procs
					<ul>
						<li>${this.overwrittenProcs} overwritten</li>
						<li>${this.expiredProcs} expired</li>
					</ul>
				`}
			/>
		);
	}
	statisticOrder = STATISTIC_ORDER.CORE(12);
}

export default Stormbringer;
