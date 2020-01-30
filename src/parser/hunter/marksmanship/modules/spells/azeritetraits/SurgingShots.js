import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber } from 'common/format';
import SpellLink from 'common/SpellLink';
import SpellUsable from 'parser/hunter/marksmanship/modules/core/SpellUsable';

const surgingShotsStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [damage] = calculateAzeriteEffects(SPELLS.SURGING_SHOTS.id, rank);
  obj.damage += damage;
  return obj;
}, {
  damage: 0,
});

const BASELINE_RF_TICKS = 10;
const INITIAL_DAMAGE_MOD = 0.5;
const RAMP_UP_MOD = 0.2;
const debug = false;

/** Surging Shots
 * Rapid Fire damage is increased by up to 465 per shot fired, this damage starts lower and increases per shot of Rapid Fire.
 * Aimed Shot has a 15% chance to reset the cooldown of Rapid Fire.
 *
 * TODO: Running TODO - verify that the tooltip is still 'wrong', and that the spell values are still hardcoded.
 * It actually starts at 50% of the tooltip value, and then scales by 20% per tick and it doesn't scale beyond normal ticks.
 * Spell Data will say a 415 piece increases damage by 356, tooltip will say 534. 356 is the value at the 5th tick.
 * See more here: https://github.com/simulationcraft/simc/blob/bfa-dev/engine/class_modules/sc_hunter.cpp#L2724
 *
 */
class SurgingShots extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  initialDamage = 0;
  damage = 0;
  damagePotential = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SURGING_SHOTS.id);
    if (!this.active) {
      return;
    }
    const { damage } = surgingShotsStats(this.selectedCombatant.traitsBySpellId[SPELLS.SURGING_SHOTS.id]);
    this.damage = damage;
    this.initialDamage = damage * INITIAL_DAMAGE_MOD;

    for (let ticks = 1; ticks <= BASELINE_RF_TICKS; ticks++) {
      this.damagePotential += this.initialDamage * (1 + (RAMP_UP_MOD * ticks));
      debug && console.log('Tick number: ', ticks, ' and added damage: ', this.initialDamage * (1 + (RAMP_UP_MOD * ticks)));
    }
    debug && console.log('SuS damage potential: ', this.damagePotential);
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        category={'AZERITE_POWERS'}
      >
        <BoringSpellValueText spell={SPELLS.SURGING_SHOTS}>
          <>
            {this.spellUsable.rapidFireResets} <small> {this.spellUsable.rapidFireResets === 0 || this.spellUsable.rapidFireResets > 1 ? 'resets' : 'reset'}</small> <br />
            <small>Up to</small> {formatNumber(this.damagePotential)} <small> damage per <SpellLink id={SPELLS.RAPID_FIRE.id} /></small>
          </>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }

}

export default SurgingShots;
