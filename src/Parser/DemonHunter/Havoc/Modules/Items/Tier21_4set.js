import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import { formatPercentage, formatNumber } from 'common/format';

class Tier21_4set extends Analyzer {
	static dependencies = {
		combatants: Combatants,
		abilityTracker: AbilityTracker,
	};

	betrayersFuryBuffCount = 0;

	on_initialized() {
		this.active = this.combatants.selected.hasBuff(SPELLS.HAVOC_T21_4PC_BONUS.id);
	}

	get eyeBeamCasts() {
		return this.abilityTracker.getAbility(SPELLS.EYE_BEAM.id).casts;
	}

	on_byPlayer_applybuff (event) {
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.HAVOC_T21_4PC_BUFF.id) {
			return;
		}
		this.betrayersFuryBuffCount++;
	}

	on_byPlayer_refreshbuff (event) {
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.HAVOC_T21_4PC_BUFF.id) {
			return;
		}
		this.betrayersFuryBuffCount++;
	}

	get suggestionThresholds() {
    return {
      actual: 1 - this.betrayersFuryBuffCount / this.eyeBeamCasts,
      isGreaterThan: {
        minor: 0,
        average: 0.1,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
  	when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
  		return suggest(<React.Fragment>You are clipping your <SpellLink id={SPELLS.EYE_BEAM.id} icon/> before it ends and losing out on the <SpellLink id={SPELLS.HAVOC_T21_4PC_BUFF.id} icon/> buff. Make sure you fully channel your <SpellLink id={SPELLS.EYE_BEAM.id} icon/>.</React.Fragment>)
  			.icon(SPELLS.HAVOC_T21_4PC_BONUS.icon)
  			.actual(`${formatNumber(this.eyeBeamCasts - this.betrayersFuryBuffCount)} missed proc(s)`)
  			.recommended(`Wasting none is recommended`);
  	});
  }

	item() {
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.HAVOC_T21_4PC_BUFF.id) / this.owner.fightDuration;
    return {
      id: `spell-${SPELLS.HAVOC_T21_4PC_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HAVOC_T21_4PC_BONUS.id} />,
      title: <SpellLink id={SPELLS.HAVOC_T21_4PC_BONUS.id} icon={false} />,
      result: <React.Fragment>{formatPercentage(uptime)} % uptime on <SpellLink id={SPELLS.HAVOC_T21_4PC_BUFF.id} icon/></React.Fragment>,
    };
  }
}

export default Tier21_4set;
