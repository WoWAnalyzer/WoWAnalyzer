import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

class CrimsonScourge extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  crimsonScourgeProcsCounter = 0;
  freeDeathAndDecayCounter = 0;
  deathAndDecayCounter = 0;
  wastedDeathAndDecays = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DEATH_AND_DECAY.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.CRIMSON_SCOURGE.id, event.timestamp)) {
      this.freeDeathAndDecayCounter += 1;
    } else {
      this.deathAndDecayCounter += 1;
    }
  }
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CRIMSON_SCOURGE.id) {
      return;
    }
    this.crimsonScourgeProcsCounter += 1;
    if(this.spellUsable.isOnCooldown(SPELLS.DEATH_AND_DECAY.id)){
      this.spellUsable.endCooldown(SPELLS.DEATH_AND_DECAY.id);
    }
  }

  get wastedCrimsonScourgeProcs(){
    return this.crimsonScourgeProcsCounter - this.freeDeathAndDecayCounter;
  }

  get wastedCrimsonScourgeProcsPercent(){
    return this.wastedCrimsonScourgeProcs / this.crimsonScourgeProcsCounter;
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedCrimsonScourgeProcsPercent,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.15,
      },
      style: 'percentage',
      text: 'You had unspent Crimson Scourge procs. Make sure you always use them.',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(suggest.text)
        .icon(SPELLS.CRIMSON_SCOURGE.icon)
        .actual(`${formatPercentage(actual)}% Crimson Scourge procs wasted`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CRIMSON_SCOURGE.id} />}
        value={`${formatPercentage(this.wastedCrimsonScourgeProcsPercent)} %`}
        label='Crimson Scourge procs Wasted'
        tooltip={`${this.wastedCrimsonScourgeProcs} out of ${this.crimsonScourgeProcsCounter} procs wasted.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default CrimsonScourge;
