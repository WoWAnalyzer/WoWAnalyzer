import React from 'react';

import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Module from 'Parser/Core/Module';

import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import { formatNumber, formatPercentage } from 'common/format';

// TODO: determine whether total mitigated damage from EW compared to total damage taken is sufficient

const ABILITIES_THAT_CONSUME_EW = [
  SPELLS.MELEE.id,
  SPELLS.MAGIC_MELEE.id,
];

class Earthwarden extends Module {
  damageFromMelees = 0;
  swingsMitigated = 0;
  totalSwings = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.lv90Talent === SPELLS.EARTHWARDEN_TALENT.id;
  }

  on_toPlayer_damage(event) {
    if (ABILITIES_THAT_CONSUME_EW.includes(event.ability.guid)) {
      this.damageFromMelees += event.amount + event.absorbed;

      // Dodged swings and fully absorbed swings should not count towards total swings,
      // since we only care about attacks that EW would have mitigated
      if (event.hitType !== HIT_TYPES.DODGE || event.amount > 0) {
        this.totalSwings += 1;
      }
    }
  }

  on_byPlayer_absorbed(event) {
    if (event.ability.guid === SPELLS.EARTHWARDEN_BUFF.id) {
      this.swingsMitigated += 1;
    }
  }

  get hps() {
    const healingDone = this.owner.modules.abilityTracker.getAbility(SPELLS.EARTHWARDEN_BUFF.id).healingEffective;
    const fightLengthSec = this.owner.fightDuration / 1000;
    return healingDone / fightLengthSec;
  }

  get percentMitigated() {
    return this.swingsMitigated / this.totalSwings;
  }

  getPercentofTotalDamageMitigated() {

  }

  statistic() {
    console.log(this.percentMitigated);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EARTHWARDEN_BUFF.id} />}
        label='Earthwarden'
        value={`${formatNumber(this.hps)} HPS`}
        tooltip={`You mitigated ${this.swingsMitigated} out of ${this.totalSwings} attacks that Earthwarden works on. (${formatPercentage(this.percentMitigated)}% mitigated)`}
      />
    );
  }
}

export default Earthwarden;
