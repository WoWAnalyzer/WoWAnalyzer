import React from 'react';

import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';

import Combatants from 'Parser/Core/Modules/Combatants';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Analyzer from 'Parser/Core/Analyzer';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import MasteryEffectiveness from '../Features/MasteryEffectiveness';

class Resurgence extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    masteryEffectiveness: MasteryEffectiveness,
  };

  maxMana = 1100000;
  regenedMana = 0;
  extraMana = 0;
  resurgence = [];
  SPELLS_PROCCING_RESURGENCE = {};
  totalResurgenceGain = 0;
  hasbottomlessDepths = false;
  bottomlessDepths = 0;

  on_initialized() {
    const refreshingCurrentTrait = this.combatants.selected.traitsBySpellId[SPELLS.REFRESHING_CURRENTS.id] || 0;
    const hasEnergyPendant = this.combatants.selected.hasNeck(ITEMS.STABILIZED_ENERGY_PENDANT.id);
    this.hasbottomlessDepths = this.combatants.selected.hasTalent(SPELLS.BOTTOMLESS_DEPTHS_TALENT.id);

    // The arcway neck does increase resurgence gained as well
    if (hasEnergyPendant) {
      this.maxMana *= 1.05;
    }

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
    const masteryEffectiveness = event.masteryEffectiveness;

    if (!isAbilityProccingResurgence || event.tick) {
      return;
    }

    if (!this.resurgence[spellId]) {
      this.resurgence[spellId] = {
        spellId: spellId,
        resurgenceTotal: 0,
        castAmount: 0,
      };
    }

    if (event.hitType === HIT_TYPES.CRIT) {
      this.resurgence[spellId].resurgenceTotal += this.SPELLS_PROCCING_RESURGENCE[spellId] * this.maxMana;
      this.resurgence[spellId].castAmount += 1;
    } else if (event.hitType === HIT_TYPES.NORMAL && masteryEffectiveness >= 0.4) {
      if (this.hasbottomlessDepths) {
        this.resurgence[spellId].resurgenceTotal += this.SPELLS_PROCCING_RESURGENCE[spellId] * this.maxMana;
        this.resurgence[spellId].castAmount += 1;
      }
      this.bottomlessDepths += this.SPELLS_PROCCING_RESURGENCE[spellId] * this.maxMana;
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
    this.regenedMana = ((this.owner.fightDuration / 1000) / 5) * 44000;

    return this.regenedMana + this.totalResurgenceGain + this.maxMana + this.extraMana;
  }

  statistic() {
    let expandText = ` `;
    if (this.hasbottomlessDepths) {
      expandText += `added ${formatPercentage(this.bottomlessDepths / this.totalMana, 0)}% (${formatNumber(this.bottomlessDepths)}) mana on top of that.`;
    } else {
      expandText += `would have added ${formatPercentage(this.bottomlessDepths / (this.totalMana + this.bottomlessDepths), 0)}% (${formatNumber(this.bottomlessDepths)}) mana.`;
    }

    return (
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.RESURGENCE.id} />}
        value={`${formatNumber(this.totalResurgenceGain)}`}
        label={`Mana gained from Resurgence`}
      >
        <div>
          <SpellLink id={SPELLS.RESURGENCE.id} icon /> accounted for {formatPercentage((this.totalResurgenceGain - (this.hasbottomlessDepths ? this.bottomlessDepths : 0)) / this.totalMana, 0)}% of your mana pool ({formatNumber(this.totalMana)} mana). <br />
          <SpellLink id={SPELLS.BOTTOMLESS_DEPTHS_TALENT.id} icon /> {expandText}
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
                .map(spell => (
                  <tr key={spell.spellId}>
                    <th scope="row"><SpellIcon id={spell.spellId} style={{ height: '2.5em' }} /></th>
                    <td>{formatNumber(spell.resurgenceTotal)}</td>
                    <td>{formatNumber(spell.castAmount)}</td>
                    <td>{formatPercentage(spell.resurgenceTotal / this.totalMana)}%</td>
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
