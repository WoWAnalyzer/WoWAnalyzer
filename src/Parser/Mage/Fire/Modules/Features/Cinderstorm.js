import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class Cinderstorm extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  cinderHits = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CINDERSTORM_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CINDERSTORM_DAMAGE.id) {
      return;
    }
    this.cinderHits += 1;
  }

  get averageHitsPerCast() {
    return this.cinderHits / this.abilityTracker.getAbility(SPELLS.CINDERSTORM_TALENT.id).casts;
  }

  get suggestionThreshold() {
    return {
      actual: this.averageHitsPerCast,
      isLessThan: {
        minor: 5.7,
        average: 5.4,
        major: 4.8,
      },
      style: 'number',
    };
  }

  suggestions(when) {
		when(this.suggestionThreshold)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>Your Cinders from <SpellLink id={SPELLS.CINDERSTORM_TALENT.id}/>, on average, hit {this.averageHitsPerCast.toFixed(2)} targets per cast. When using the Cinderstorm talent, you need to ensure that you are aiming the ability such that every cinder hits every enemy. If you are unable to do this or are having trouble aiming the spell, then you should pick a different talent.</React.Fragment>)
					.icon(SPELLS.CINDERSTORM_TALENT.icon)
					.actual(`${this.averageHitsPerCast.toFixed(2)} Hits Per Cast`)
					.recommended(`${formatNumber(recommended)} is recommended`);
			});
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CINDERSTORM_TALENT.id} />}
        value={`${this.averageHitsPerCast.toFixed(2)}`}
        label="Cinderstorm Hits Per Cast"
        tooltip={`Cinderstorm is a skill shot ability which needs to be aimed properly so that all 6 cinders from every cast hit the target. In AoE situations, this ability should be aimed such that each cinder will hit every enemy. If this is not possible or you are having trouble aiming the ability, you should pick a different talent.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(10);
}

export default Cinderstorm;
