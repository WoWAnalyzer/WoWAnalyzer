import React from 'react';

import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';

import Combatants from 'Parser/Core/Modules/Combatants';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

class Resurgence extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }

  maxMana = 1100000;
  regenedMana = 0;
  extraMana = 0;
  resurgence = [];
  SPELLS_PROCCING_RESURGENCE = {};
  totalResurgenceGain = 0;

  on_initialized() {
    const refreshingCurrentTrait = this.combatants.selected.traitsBySpellId[SPELLS.REFRESHING_CURRENTS.id] || 0;

    this.SPELLS_PROCCING_RESURGENCE = {
      [SPELLS.HEALING_SURGE_RESTORATION.id]: 0.006,
      [SPELLS.HEALING_WAVE.id]: 0.01,
      [SPELLS.CHAIN_HEAL.id]: refreshingCurrentTrait ? 0.00375 : 0.0025,
      [SPELLS.UNLEASH_LIFE_TALENT.id]: 0.006,
      [SPELLS.RIPTIDE.id]: 0.006,
    };
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const isAbilityProccingResurgence = this.SPELLS_PROCCING_RESURGENCE.hasOwnProperty(spellId);

    if (event.hitType === HIT_TYPES.CRIT && !event.tick) {
      if(isAbilityProccingResurgence){
        if (!this.resurgence[spellId]) {
          this.resurgence[spellId] = {
            spellId: spellId,
            resurgenceTotal: 0,
            castAmount: 0,
          };
        }
        
        this.resurgence[spellId].resurgenceTotal += this.SPELLS_PROCCING_RESURGENCE[spellId] * this.maxMana;
        this.resurgence[spellId].castAmount += 1;
      }
    }
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.RESURGENCE.id) {     
      return this.extraMana += event.resourceChange;
    }

    this.totalResurgenceGain += event.resourceChange;
  }

  get totalMana() {
    this.regenedMana = ((this.owner.fightDuration/1000)/5) * 44000;

    return this.regenedMana + this.totalResurgenceGain + this.maxMana + this.extraMana;
  }

  statistic() {
    return (
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.RESURGENCE.id} />}
        value={`${formatNumber(this.totalResurgenceGain)}`}
        label={(`Resurgence Mana Gain`)}
      >
        <div>
          Resurgence accounted for {formatPercentage(this.totalResurgenceGain / this.totalMana, 0)}% of your mana pool.
        </div>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Spell</th>
              <th>Amount</th>
              <th>Crits</th>
              <th>% of mana</th>
            </tr>
          </thead>
          <tbody>
            {
              this.resurgence
                .map((x) => (
                  <tr key={x.spellId}>
                    <th scope="row"><SpellIcon id={x.spellId} style={{ height: '2.5em' }} /></th>
                    <td>{formatNumber(x.resurgenceTotal)}</td>
                    <td>{formatNumber(x.castAmount)}</td>
                    <td>{formatPercentage(x.resurgenceTotal / this.totalMana)}%</td>
                  </tr>
                ))
            }

          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }
}



export default Resurgence;
