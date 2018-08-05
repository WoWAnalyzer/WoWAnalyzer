import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'Interface/Others/StatisticBox';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import { formatNumber } from 'common/format';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';

/**
 * Aimed Shot has a 50% chance to deal 100% bonus damage to targets who are above 80% health or below 20% health.
 */
const HIGHER_HP_THRESHOLD = 0.8;
const LOWER_HP_THRESHOLD = 0.2;
const AIMED_AP_MOD = 2.07;
const MASTERY_DMG_MODIFIER_PER_PERCENT = 2.24;
const CA_MODIFIER = 1;

const debug = true;

class CarefulAim extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  lastAttackPower = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CAREFUL_AIM_TALENT.id);
  }

  caProcs = 0;
  damageContribution = 0;

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    const healthPercent = event.hitPoints / event.maxHitPoints;
    if (healthPercent < HIGHER_HP_THRESHOLD && healthPercent > LOWER_HP_THRESHOLD) {
      return;
    }
    if (this._carefulAimProc(event)) {
      this.caProcs += 1;
      this.damageContribution += calculateEffectiveDamage(event, CA_MODIFIER);
    }
  }

  on_byPlayer_cast(event) {
    if (event.attackPower !== undefined && event.attackPower > 0) {
      this.lastAttackPower = event.attackPower;
    }
  }

  _carefulAimProc(event) {
    const normalDamage = (this.lastAttackPower * AIMED_AP_MOD) * (1 + this.statTracker.currentVersatilityPercentage) * (1 + (this.statTracker.currentMasteryPercentage * MASTERY_DMG_MODIFIER_PER_PERCENT));

    const critDamage = normalDamage * 2;
    const caNormalDamage = normalDamage * 2;
    const caCritDamage = critDamage * 2;

    const normalCutoff = (normalDamage + caNormalDamage) / 1.9;
    const critCutoff = (caCritDamage + critDamage) / 1.9;

    debug && console.log(`CA detection (crit: ${event.hitType === HIT_TYPES.CRIT}): normal-cutoff ${formatNumber(normalCutoff)}, crit-cutoff ${formatNumber(critCutoff)}, actual ${formatNumber(event.amount)}`);
    if (event.hitType === HIT_TYPES.CRIT) {
      //crit
      debug && console.log(`CA prediction (crit): non-CA ${formatNumber(critDamage)}, CA ${formatNumber(caCritDamage)}, actual ${formatNumber(event.amount)}`);
      return event.amount >= critCutoff;
    } else if (event.hitType === HIT_TYPES.NORMAL) {
      //non-crit
      debug && console.log(`CA prediction (normal): non-CA ${formatNumber(normalDamage)}, CA ${formatNumber(critDamage)}, actual ${formatNumber(event.amount)}`);
      return event.amount >= normalCutoff;
    }
    debug && console.warn(`unkownhitType ${event.hitType} seen for Aimed Shot`);
    return false;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(17)}
        icon={<SpellIcon id={SPELLS.CAREFUL_AIM_TALENT.id} />}
        value={`${this.caProcs}`}
        label="Careful Aim procs"
        tooltip={`Careful Aim contribution breakdown:
                <ul>
                  <li>Damage: ${formatNumber(this.damageContribution)}. </li>
                  <li>Procs: ${this.caProcs}.</li>
                  <li>Average damage per proc: ${formatNumber(this.damageContribution / this.caProcs)}.</li>
                </ul>`} />
    );
  }
}

export default CarefulAim;
