import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Wrapper from 'common/Wrapper';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

const DAMAGE_WINDOW_MS = 5000;

class Cinderstorm extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  cinderHits = 0;
  totalHits = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CINDERSTORM_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CINDERSTORM_TALENT.id) {
      return;
    }
    this.castTimestamp = event.timestamp;
    this.cinderHits = 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CINDERSTORM_DAMAGE.id) {
      return;
    }
    if (this.castTimestamp - event.timestamp < DAMAGE_WINDOW_MS && this.cinderHits < 6) {
      this.cinderHits += 1;
      this.totalHits += 1;
    }
  }

  get cindersHitPercent() {
    return this.totalHits / this.totalCinders;
  }

  get totalCinders() {
    return this.abilityTracker.getAbility(SPELLS.CINDERSTORM_TALENT.id).casts * 6;
  }

  get missedCinders() {
    return this.totalCinders - this.totalHits;
  }

  get missedCindersPercent() {
    return this.missedCinders / this.totalCinders;
  }

  get averageHitsPerCast() {
    return 6 - ((this.totalHits / 6) / (this.totalCinders / 6));
  }

  get suggestionThreshold() {
    return {
      actual: this.cindersHitPercent,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  on_finished() {
    console.log(this.totalHits);
    console.log(this.totalCinders);
  }

  suggestions(when) {
		when(this.suggestionThreshold)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<Wrapper>When using <SpellLink id={SPELLS.CINDERSTORM_TALENT.id}/>, {formatNumber(this.missedCinders)} cinders ({formatPercentage(this.missedCindersPercent)}%) did not hit anything. You should either aim the spell better so that all cinders hit the target, or pick a different talent. On AoE, this spell should be used so that each cinder hits every mob.</Wrapper>)
					.icon(SPELLS.CINDERSTORM_TALENT.icon)
					.actual(`${formatPercentage(this.cindersHitPercent)}% Hit`)
					.recommended(`${formatPercentage(recommended)}% is recommended`);
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
