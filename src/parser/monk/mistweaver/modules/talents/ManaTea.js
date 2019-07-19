import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatThousands, formatPercentage } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';

import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import Analyzer from 'parser/core/Analyzer';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class ManaTea extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  manaSavedMT = 0;
  manateaCount = 0;

  casts = null;

  effectiveHealing = 0;
  overhealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MANA_TEA_TALENT.id);
    if(!this.active){
      return;
    }
    this.casts = new Map();
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.MANA_TEA_TALENT.id === spellId) {
      this.manateaCount += 1;//count the number of mana teas to make an average over teas
    }
  }

  on_byPlayer_heal(event){
    if (this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_TALENT.id)) {//if this is in a mana tea window
      this.effectiveHealing += (event.amount || 0) + (event.absorbed || 0);
      this.overhealing +=(event.overheal || 0);
    }
  }

  on_byPlayer_cast(event) {
    const name = event.ability.name;
    if (this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_TALENT.id) && event.ability.guid !== SPELLS.MANA_TEA_TALENT.id) {//we check both since melee doesn't havea classResource 
      if(event.classResources && event.classResources[0].cost){ //checks if the spell costs anything (we don't just use cost since some spells don't play nice)
        this.manaSavedMT += event.rawResourceCost[0]/2;
      }
      if(this.casts.get(name)){
        this.casts.set(name, this.casts.get(name)+1);
      }else{
        this.casts.set(name, 1);
      }
    }
  }

  get avgMtSaves() {
    return this.manaSavedMT / this.manateaCount || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.avgMtSaves,
      isLessThan: {
        minor: 13000,
        average: 11000,
        major: 9000,
      },
      style: 'number',
    };
  }

  get avgOverhealing(){
    return (this.overhealing / (this.overhealing + this.effectiveHealing)).toFixed(4);
  }

  get suggestionThresholdsOverhealing(){
    return {
      actual: this.avgOverhealing,
      isGreaterThan: {
        minor: .20,
        average: .30,
        major: .40,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    console.log(this.casts);
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Your mana spent during <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> can be improved. Aim to prioritize as many <SpellLink id={SPELLS.VIVIFY.id} /> casts until the last second of the buff and then cast <SpellLink id={SPELLS.ESSENCE_FONT.id} />. <SpellLink id={SPELLS.ESSENCE_FONT.id} />'s mana cost is taken at the beginning of the channel, so you gain the benefit of <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> even if the channel continues past the buff.
        </>
      )
        .icon(SPELLS.MANA_TEA_TALENT.icon)
        .actual(`${formatNumber(this.avgMtSaves)} average mana saved per Mana Tea cast`)
        .recommended(`${(recommended / 1000).toFixed(0)}k average mana saved is recommended`);
    });
    when(this.suggestionThresholdsOverhealing).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Your average overhealing was high during your <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> usage. Consider using <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> during specific boss abilities or general periods of high damage to the raid. Also look to target low health raid members to avoid large amounts of overhealing.
        </>
      )
        .icon(SPELLS.MANA_TEA_TALENT.icon)
        .actual(`${formatPercentage(this.avgOverhealing)} % average overhealing per Mana Tea cast`)
        .recommended(`under ${formatPercentage(recommended)}% over healing is recommended`);
    });
  }

  statistic() {
    const arrayOfKeys = Array.from(this.casts.keys());
    return (
      <TalentStatisticBox
        talent={SPELLS.MANA_TEA_TALENT.id}
        position={STATISTIC_ORDER.CORE(25)}
        value={`${formatNumber(this.avgMtSaves)}`}
        label="Average mana saved"
        tooltip={(
          <>
            During your {this.manateaCount} Mana Teas saved the following mana ({formatThousands(this.manaSavedMT / this.owner.fightDuration * 1000 * 5)} MP5):
            <ul>
            {
              arrayOfKeys.map(spell => (
                <li>
                  {this.casts.get(spell)} {spell} casts
                </li>
              ))
            }
            </ul>
          </>
        )}
      />
    );
  }
}

export default ManaTea;