import Analyzer, { SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';
import ItemDamageDone from 'interface/ItemDamageDone';
import { formatNumber } from 'common/format';
import Events, { DamageEvent } from 'parser/core/Events';

const BASIC_ATTACK_SPELLS = [SPELLS.BITE_BASIC_ATTACK, SPELLS.CLAW_BASIC_ATTACK, SPELLS.SMACK_BASIC_ATTACK];
const MAX_TIME_BETWEEN_BASIC_ATK = 3500; //The actual current delay without macros is ~300ms on top of the 3 second cooldown, but adding 200 ms to act as a buffer.
const MACRO_TIME_BETWEEN_BASIC_ATK = 3150; //The delay is reduced to ~100-200ms depending on latency when you macro the abilities
const NO_DELAY_TIME_BETWEEN_BASIC_ATK = 3000; //This is what the optimal scenario would look like, if pet cast it instantly after it came off cooldown
/**
 * Macroing pet basic attacks to the hunters general abilities is a DPS increase, because there is a natural delay before the pet decides to cast the spell by itself.
 */
const debug = false;

class BasicAttacks extends Analyzer {

  lastCast: number = 0;
  timeBetweenAttacks = 0;
  totalCasts = 0;
  chainCasts = 0;
  damage = 0;
  usedBasicAttack: { id: number, name: string, icon: string } = { id: 0, name: '', icon: '' };
  basicAttackChecked: boolean = false;

  constructor(options: any) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(BASIC_ATTACK_SPELLS), this.onPetBasicAttackDamage);
  }

  onPetBasicAttackDamage(event: DamageEvent) {
    if (!this.basicAttackChecked) {
      this.usedBasicAttack = { id: event.ability.guid, name: event.ability.name, icon: event.ability.abilityIcon };
      this.basicAttackChecked = true;
    }
    this.damage += event.amount + (event.absorbed || 0);
    // If no lastcast is registered or if more time has passed than we generally attribute a chaincast then we assume that there has been some downtime, so we set the latest hit as lastCast and don't count it as chained casts.
    if (event.timestamp > this.lastCast + MAX_TIME_BETWEEN_BASIC_ATK) {
      this.lastCast = event.timestamp;
    } else {
      this.timeBetweenAttacks += event.timestamp - this.lastCast;
      this.chainCasts += 1;
    }
    this.totalCasts += 1;
  }

  potentialExtraCasts(dreamScenario: boolean = false) {
    const usedTimeBetween = dreamScenario ? NO_DELAY_TIME_BETWEEN_BASIC_ATK : MACRO_TIME_BETWEEN_BASIC_ATK;
    return Math.max(Math.floor((this.timeBetweenAttacks - (usedTimeBetween * this.chainCasts)) / usedTimeBetween), 0);
  }

  potentialExtraDamage(dreamScenario: boolean = false) {
    return this.potentialExtraCasts(dreamScenario) * (this.damage / this.totalCasts) || 0;
  }

  get additionalAttacksFromMacroing() {
    return {
      actual: this.potentialExtraCasts(),
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: 'number',
    };
  }

  statistic() {
    if (debug) {
      console.log('Avg time between BAs', this.timeBetweenAttacks / this.chainCasts);
      console.log('Total lost BA time', this.timeBetweenAttacks - (MACRO_TIME_BETWEEN_BASIC_ATK * this.chainCasts));
      console.log('Potential extra casts (with macro):', this.potentialExtraCasts());
      console.log('Potential extra damage (with macro):', this.potentialExtraDamage());
      console.log('Potential extra casts (with 0 delay):', this.potentialExtraCasts(true));
      console.log('Potential extra damage (with 0 delay):', this.potentialExtraDamage(true));
    }
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        dropdown={(
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Potential</th>
                  <th>150ms delay</th>
                  <th>0ms delay</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Casts
                  </td>
                  <td>
                    {this.potentialExtraCasts()}
                  </td>
                  <td>
                    {this.potentialExtraCasts(true)}
                  </td>
                </tr>
                <tr>
                  <td>
                    Damage
                  </td>
                  <td>
                    {formatNumber(this.potentialExtraDamage() / this.owner.fightDuration * 1000)} DPS
                  </td>
                  <td>
                    {formatNumber(this.potentialExtraDamage(true) / this.owner.fightDuration * 1000)} DPS
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      >
        <BoringSpellValueText spell={this.usedBasicAttack}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            {formatNumber((this.timeBetweenAttacks / this.chainCasts) - NO_DELAY_TIME_BETWEEN_BASIC_ATK)} ms <small>average delay</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BasicAttacks;
