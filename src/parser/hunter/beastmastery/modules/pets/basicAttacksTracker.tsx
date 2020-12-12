import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { formatNumber } from 'common/format';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Spell from 'common/SPELLS/Spell';

import React from 'react';

import { Trans } from '@lingui/macro';

import { BASIC_ATTACK_SPELLS, MACRO_TIME_BETWEEN_BASIC_ATK, MAX_TIME_BETWEEN_BASIC_ATK, NO_DELAY_TIME_BETWEEN_BASIC_ATK } from '../../constants';


/**
 * Macroing pet basic attacks to the hunters general abilities is a DPS increase, because there is a natural delay before the pet decides to cast the spell by itself.
 */
const debug = false;

class BasicAttacks extends Analyzer {
  lastCast: number = 0;
  timeBetweenAttacks: number = 0;
  totalCasts: number = 0;
  chainCasts: number = 0;
  damage: number = 0;
  //Assume that the usedBasicAttack is Bite, so that there are no issues if no Basic Attack have been cast this fight
  usedBasicAttack: Spell = SPELLS.BITE_BASIC_ATTACK;
  basicAttackChecked: boolean = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(BASIC_ATTACK_SPELLS), this.onPetBasicAttackDamage);
  }

  get additionalAttacksFromMacroing() {
    return {
      actual: this.potentialExtraCasts(),
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get totalAttacksFromBasicAttacks() {
    return {
      actual: this.totalCasts,
      isLessThan: {
        minor: 1,
        average: 1,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
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

  suggestions(when: When) {
    when(this.totalAttacksFromBasicAttacks).addSuggestion((suggest, actual, recommended) => suggest(<> Make sure that your pet is casting it's Basic Attacks, such as <SpellLink id={SPELLS.BITE_BASIC_ATTACK.id} />.</>)
      .icon(SPELLS.BITE_BASIC_ATTACK.icon)
      .actual(<Trans id='hunter.beastmastery.suggestions.petBasicAttacks.actual'> Your pet didn't cast any Basic Attacks this fight </Trans>)
      .recommended(<Trans id='hunter.beastmastery.suggestions.petBasicAttacks.suggestions'> Your pet should be autocast Basic Attacks </Trans>));
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
        position={STATISTIC_ORDER.OPTIONAL(20)}
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
