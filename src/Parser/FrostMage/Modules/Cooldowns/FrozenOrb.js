import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Module from 'Parser/Core/Module';

class FrozenOrb extends Module {
	
	FrozenOrbCooldown = 60;
	FrozenOrbCasts = 0;
	BlizzardHits = 0;
	FightDuration = this.owner.fightDuration;
	
	static dependencies = {
		combatants: Combatants,
	}
	
	on_initialized(){}
	
  on_byPlayer_damage(event) {
	if(event.ability.guid === SPELLS.BLIZZARD_DEBUFF.id) {
		this.BlizzardHits += 1;
	}
  }
	
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FROZEN_ORB_CAST.id) {
      return;
    }
	PreviousTimestamp = event.timestamp;
	OrbCooldown = 60;
	on_byPlayer_damage(event) {
		if(event.ability.guid === SPELLS.BLIZZARD_DEBUFF.id) {
			this.OrbCooldown -= 0.5
		}
	}
    this.FrozenOrbCasts += 1;
  }
	
	suggestions(when) {
		const missedProcsPercent = this.overwrittenBrainFreezeProcs / this.totalBrainFreezeProcs;
		when(missedProcsPercent).isGreaterThan(0)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<span>You wasted {formatPercentage(missedProcsPercent)}% <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> procs</span>)
					.icon(SPELLS.BLIZZARD_CAST.icon)
					.actual(`${formatNumber(this.overwrittenBrainFreezeProcs)} missed proc(s)`)
					.recommended(`Wasting none is recommended`)
					.regular(recommended+ 0.1).major(recommended + 0.2);	
			});
	}
	
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BLIZZARD_DEBUFF.id} />}
        value={`${formatNumber(this.BlizzardHits)}`}
        label="Blizzard Hits" />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default FrozenOrb;