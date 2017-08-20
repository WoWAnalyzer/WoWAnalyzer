import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

class CelestialBreath extends Module {
  // Implement Mists of Sheilun, Celestial Breath, and Refreshing Jade Wind
  procsCelestialBreath = 0;
  procsCelestialBreathRemove = 0;
  healsCelestialBreath = 0;
  healingCelestialBreath = 0;
  overhealingCelestialBreath = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.traitsBySpellId[SPELLS.CELESTIAL_BREATH_TRAIT.id] === 1;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.CELESTIAL_BREATH_BUFF.id) {
      this.procsCelestialBreath++;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.CELESTIAL_BREATH.id) {
      this.healsCelestialBreath++;
      this.healingCelestialBreath += event.amount;
      if(event.overheal) {
        this.overhealingCelestialBreath += event.overheal;
      }
    }
  }

  statistic() {
    const avgCelestialBreathHealing = this.healingCelestialBreath / this.healsCelestialBreath || 0;
    const avgCelestialBreathTargets = (this.healsCelestialBreath / this.procsCelestialBreath) / 3 || 0;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CELESTIAL_BREATH_TRAIT.id} />}
        value={`${formatNumber(avgCelestialBreathHealing)}`}
        label={(
          <dfn data-tip={`You healed an average of ${avgCelestialBreathTargets.toFixed(2)} targets per Celestial Breath cast over your ${this.procsCelestialBreath} casts.`}>
            Average Healing
          </dfn>
          )}
        />
      );
    }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();

  on_finished() {
    if(debug) {
      console.log('Celestial Breath Procs: ' + this.procsCelestialBreath);
      console.log('Avg Heals per Procs: ' + (this.healsCelestialBreath / this.procsCelestialBreath));
      console.log('Avg Heals Amount: ' + (this.healingCelestialBreath / this.healsCelestialBreath));
    }
  }
}

export default CelestialBreath;
