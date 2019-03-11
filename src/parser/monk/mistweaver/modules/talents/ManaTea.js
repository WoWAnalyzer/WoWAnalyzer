// Modified from Original Code by Blazyb and his Innervate module.
import React from 'react';

import SPELLS from 'common/SPELLS'; //Do we really need all spells when we just care about monk spells (but it is nice since it gets talents too)
import MONKSPELLS from 'common/SPELLS/monk';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatThousands } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';

import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import Analyzer from 'parser/core/Analyzer';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const debug = false;

const manaTeaReduction = 0.5;

class ManaTea extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  manaSavedMT = 0;
  manateaCount = 0;

  enmCasts = 0;
  efCasts = 0;
  lcCasts = 0;
  remCasts = 0;
  revCasts = 0;
  vivCasts = 0;
  rjwCasts = 0;
  soomTicks = 0;

  nonManaCasts = 0;
  castsUnderManaTea = 0;

  hasLifeCycles = false;
  casted = false;

  castedStackFrame = [MONKSPELLS.GUSTS_OF_MISTS.id];//alwasy have gusts since this will only proc when a spell is hard cast
  effectivehealing = 0;
  overhealing = 0;
  overhealingPercent = 0.0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MANA_TEA_TALENT.id);
    if (this.selectedCombatant.hasTalent(SPELLS.LIFECYCLES_TALENT.id)) {
      this.hasLifeCycles = true;
    }
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.MANA_TEA_TALENT.id === spellId) {
      this.manateaCount += 1;//count the number of mana teas to make an average over teas
    }
  }

  on_toPlayer_removebuff(event){
    const spellId = event.ability.guid;
    if(SPELLS.MANA_TEA_TALENT.id === spellId){
      console.log("we lost mana tea");
      this.castedStackFrame = [MONKSPELLS.GUSTS_OF_MISTS.id];//alwasy have gusts since this will only proc when a spell is hard cast
    }
  }

  on_heal(event){
    if (this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_TALENT.id)) {//if this is in a mana tea window
      const spellId = event.ability.guid;
      const that = this;
      Object.keys(MONKSPELLS).forEach(function(k){//is the heal a monk spell (this goes through all monk spells even brew/ww)
        if (spellId === MONKSPELLS[k].id && that.castedStackFrame.includes(event.ability.guid)) {//also check if this is casted (this allows us to ignore hots that were already casted)
          that.effectivehealing += (event.amount || 0) + (event.absorbed || 0);
          that.overhealing +=(event.overheal || 0);
        }
      });
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (this.selectedCombatant.hasBuff(SPELLS.MANA_TEA_TALENT.id)) {
      this.castedStackFrame.push(spellId);
      if(SPELLS.SOOTHING_MIST.id === spellId){//added soothing mist since it costs mana now
        this.addToManaSaved(SPELLS.SOOTHING_MIST.manaCost, spellId);
        this.castsUnderManaTea += 1;
        this.soomTicks += 1;
        this.casted = true;
        this.castedStackFrame.push(SPELLS.SOOTHING_MIST_STATUE.id);//if statue is talented check for its healing too
      }
      if(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id === spellId){//added this for overhealing tracking
        this.castedStackFrame.push(SPELLS.CRANE_HEAL.id);//if chi-ji is talented check for its healing too
      }

      if (SPELLS.ENVELOPING_MIST.id === spellId) {
        this.addToManaSaved(SPELLS.ENVELOPING_MIST.manaCost, spellId);
        this.castsUnderManaTea += 1;
        this.enmCasts += 1;
        this.casted = true;
      }
      if (SPELLS.ESSENCE_FONT.id === spellId) {
        this.castedStackFrame.push(SPELLS.ESSENCE_FONT_BUFF.id);
        this.addToManaSaved(SPELLS.ESSENCE_FONT.manaCost, spellId);
        this.castsUnderManaTea += 1;
        this.efCasts += 1;
        this.casted = true;
      }
      if (SPELLS.LIFE_COCOON.id === spellId) {
        this.addToManaSaved(SPELLS.LIFE_COCOON.manaCost, spellId);
        this.castsUnderManaTea += 1;
        this.lcCasts += 1;
        this.casted = true;
      }
      if (SPELLS.RENEWING_MIST.id === spellId) {
        this.castedStackFrame.push(SPELLS.RENEWING_MIST_HEAL.id);
        this.addToManaSaved(SPELLS.RENEWING_MIST.manaCost, spellId);
        this.castsUnderManaTea += 1;
        this.remCasts += 1;
        this.casted = true;
      }
      if (SPELLS.REVIVAL.id === spellId) {
        this.addToManaSaved(SPELLS.REVIVAL.manaCost, spellId);
        this.castsUnderManaTea += 1;
        this.revCasts += 1;
        this.casted = true;
      }
      if (SPELLS.VIVIFY.id === spellId) {
        this.addToManaSaved(SPELLS.VIVIFY.manaCost, spellId);
        this.castsUnderManaTea += 1;
        this.vivCasts += 1;
        this.casted = true;
      }
      if (SPELLS.REFRESHING_JADE_WIND_TALENT.id === spellId) {
        this.addToManaSaved(SPELLS.REFRESHING_JADE_WIND_TALENT.manaCost, spellId);
        this.castsUnderManaTea += 1;
        this.rjwCasts += 1;
        this.casted = true;
      }
      // Capture any Non Mana casts during Mana Tea
      if (!this.casted) {
        this.nonManaCasts += 1;
        this.casted = false;
      }
    }
  }

  addToManaSaved(spellBaseMana, spellId) {
    // If we cast TFT -> Viv, mana cost of Viv is 0
    if (this.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id) && SPELLS.VIVIFY.id === spellId) {
      this.nonManaCasts += 1;
      return;
    }
    this.manaSavedMT += (spellBaseMana * (1 - manaTeaReduction));//removed lifecycles as the combo isn't possible anymore
  }
  on_fightend() {
    this.overHealingPercent = this.overhealing/(this.overhealing+this.effectivehealing);
    this.overHealingPercent = Math.round(this.overHealingPercent * 1000)/1000;
    if(debug){
    console.log(`Mana Tea Casted: ${this.manateaCount}`);
    console.log(`Mana saved: ${this.manaSavedMT}`);
    console.log(`Avg. Mana saved: ${this.manaSavedMT / this.manateaCount}`);
    console.log(`Total Casts under Mana Tea: ${this.castsUnderManaTea}`);
    console.log(`Avg Casts under Mana Tea: ${this.castsUnderManaTea / this.manateaCount}`);
    console.log(`Free spells cast: ${this.nonManaCasts}`);
    console.log(`Effective healing: ${this.effectivehealing}`);
    console.log(`Overhealing healing: ${this.overhealing}`);
    console.log(`OverHealing percentage: ${this.overHealingPercent}`);
  }
  }

  get avgMtSaves() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const manaTea = getAbility(SPELLS.MANA_TEA_TALENT.id);
    const mtCasts = manaTea.casts || 0;

    return this.manaSavedMT / mtCasts || 0;
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

  get avgOverHealing(){
    let overHealingPercent = this.overhealing/(this.overhealing+this.effectivehealing);
    overHealingPercent = Math.round(overHealingPercent * 1000)/1000;
    return overHealingPercent;
  }

  get suggestionThresholdsMana(){
    return {
      actual: this.avgOverHealing,
      isGreaterThan: {
        minor: .20,
        average: .30,
        major: .40,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Your mana spent during <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> can be improved. Aim to only cast <SpellLink id={SPELLS.VIVIFY.id} /> untill the last second then cast <SpellLink id={SPELLS.ESSENCE_FONT.id} />.
        </>
      )
        .icon(SPELLS.MANA_TEA_TALENT.icon)
        .actual(`${formatNumber(this.avgMtSaves)} average mana saved per Mana Tea cast`)
        .recommended(`${(recommended / 1000).toFixed(0)}k average mana saved is recommended`);
    });
    when(this.suggestionThresholdsMana).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          On average during your <SpellLink id={SPELLS.MANA_TEA_TALENT.id} /> you overhealed a decent amount. This can be improved. Always aim to cast into targets with lower health.
        </>
      )
        .icon(SPELLS.MANA_TEA_TALENT.icon)
        .actual(`${this.overHealingPercent*100} % average overhealing per Mana Tea cast`)
        .recommended(`under 20% over healing is recommended`);
    });
  }

  statistic() {
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
              {this.efCasts > 0 && <li>{(this.efCasts)} Essence Font casts</li>}
              {this.efCasts > 0 && <li>{(this.vivCasts)} Vivfy casts</li>}
              {this.efCasts > 0 && <li>{(this.enmCasts)} Enveloping Mists casts</li>}
              <li>{(this.rjwCasts + this.revCasts + this.remCasts + this.lcCasts)} other spells casted.</li>
              <li>{(this.nonManaCasts)} non-mana casts during Mana Tea</li>
            </ul>
          </>
        )}
      />
    );
  }
}

export default ManaTea;