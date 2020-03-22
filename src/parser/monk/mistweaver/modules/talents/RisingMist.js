import React from 'react';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';

import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HIT_TYPES from 'game/HIT_TYPES';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import HotTracker from '../core/HotTracker';

const debug = false;

const RISING_MIST_EXTENSION = 4000;
const UPLIFTED_SPIRITS_REDUCTION = 1000;

const UNAFFECTED_SPELLS = [
  SPELLS.CRANE_HEAL.id,
  SPELLS.ENVELOPING_MIST.id,
];


class RisingMist extends Analyzer {
  static dependencies = {
    hotTracker: HotTracker,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  risingMistCount = 0;
  risingMists = [];

  efsExtended = 0;

  remCount = 0;
  efCount = 0;
  evmCount = 0;

  targetCount = 0;

  trackUplift = false;
  extraVivCleaves = 0;
  extraVivHealing = 0;
  extraVivOverhealing = 0;
  extraVivAbsorbed = 0;
  cooldownReductionUsed = 0;
  cooldownReductionWasted = 0;

  extraEnvHits = 0;
  extraEnvBonusHealing = 0;

  extraMasteryHits = 0
  extraMasteryhealing = 0;
  extraMasteryOverhealing = 0;
  extraMasteryAbsorbed = 0;

  masteryTickTock = false;

  extraEFhealing = 0;
  extraEFOverhealing = 0;
  extraEFAbsorbed = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RISING_MIST_TALENT.id);
    this.evmHealingIncrease = this.selectedCombatant.hasTalent(SPELLS.MIST_WRAP_TALENT.id) ? .4 : .3;
    this.trackUplift = this.selectedCombatant.hasTrait(SPELLS.UPLIFTED_SPIRITS.id);
    if(!this.active){
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RISING_SUN_KICK), this.extendHots);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.handleVivify);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.calculateEvn);//gotta just look at all heals tbh
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS), this.handleMastery);
  }

  handleMastery(event){
    const targetId = event.targetID;
    if(!this.hotTracker.hots[targetId] || !this.hotTracker.hots[targetId][SPELLS.ESSENCE_FONT_BUFF.id]){
      return;
    }
    
    const object = this.hotTracker.hots[targetId][SPELLS.ESSENCE_FONT_BUFF.id];

    if(object.originalEnd < event.timestamp){
      if(!this.masteryTickTock){
        this.extraMasteryHits += 1;
        this.extraMasteryhealing += event.amount || 0;
        this.extraMasteryOverhealing += event.overheal || 0;
        this.extraMasteryAbsorbed += event.absorbed || 0;
      }
      this.masteryTickTock = !this.masteryTickTock;
    }
  }

  calculateEvn(event){
    const targetId = event.targetID;
    const spellId = event.ability.guid;
    if(!this.hotTracker.hots[targetId] || !this.hotTracker.hots[targetId][SPELLS.ENVELOPING_MIST.id]){
      return;
    }
    const object = this.hotTracker.hots[targetId][SPELLS.ENVELOPING_MIST.id];

    if (UNAFFECTED_SPELLS.includes(spellId)) {
      return;
    }

    if(object.originalEnd < event.timestamp){
      this.extraEnvHits += 1;
      this.extraEnvBonusHealing += calculateEffectiveHealing(event, this.evmHealingIncrease);
    }

  }

  handleVivify(event){
    const targetId = event.targetID;
    if(!this.hotTracker.hots[targetId] || !this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id]){
      return;
    }
    const object = this.hotTracker.hots[targetId][SPELLS.RENEWING_MIST_HEAL.id];
    if(object.originalEnd < event.timestamp){
      this.extraVivCleaves += 1;
      this.extraVivHealing += event.amount || 0;
      this.extraVivOverhealing += event.overheal || 0;
      this.extraVivAbsorbed += event.absorbed || 0;
      if (this.trackUplift && event.hitType === HIT_TYPES.CRIT) { 
        if (this.spellUsable.isOnCooldown(SPELLS.REVIVAL.id)) {
          this.cooldownReductionUsed += this.spellUsable.reduceCooldown(SPELLS.REVIVAL.id, UPLIFTED_SPIRITS_REDUCTION);
        } else {
          this.cooldownReductionWasted += UPLIFTED_SPIRITS_REDUCTION;
        }
      }
    }
  }

  extendHots(event) {
    const spellId = event.ability.guid;
    if (SPELLS.RISING_SUN_KICK.id !== spellId) {
      return;
    }

    this.risingMistCount += 1;
    debug && console.log(`risingMist cast #: ${this.risingMistCount}`);

    const newRisingMist = {
      name: `RisingMist #${this.risingMistCount}`,
      healing: 0,
      procs: 0,
      duration: 0,
    };
    this.risingMists.push(newRisingMist);

    let foundEf = false;
    let foundTarget = false;

    Object.keys(this.hotTracker.hots).forEach(playerId => {
      Object.keys(this.hotTracker.hots[playerId]).forEach(spellIdString => {
        const spellId = Number(spellIdString);

        const attribution = newRisingMist;
        this.hotTracker.addExtension(attribution, RISING_MIST_EXTENSION, playerId, spellId);

        if (spellId === SPELLS.ESSENCE_FONT_BUFF.id) {
          foundEf = true;
          foundTarget = true;
          this.efCount += 1;
        } else if (spellId === SPELLS.RENEWING_MIST_HEAL.id) {
          foundTarget = true;
          this.remCount += 1;
        } else if (spellId === SPELLS.ENVELOPING_MIST.id) {
          foundTarget = true;
          this.evmCount += 1;
        }
      });
    });

    if (foundEf) {
      this.efsExtended += 1;
    }
    if (foundTarget) {
      this.targetCount += 1;
    }
  }

  get averageExtension() {
    return this.risingMistCount === 0 ? 0 : (this.risingMists.reduce((acc, risingMist) => acc + risingMist.duration, 0) / this.risingMistCount) / 1000;
  }
  get hotHealing() {
    return this.hotTracker.healingAfterFallOff;
  }

  get directHealing() {
    return this.abilityTracker.getAbility(SPELLS.RISING_MIST_HEAL.id).healingEffective;
  }
  get totalHealing() {
    return this.hotHealing + this.directHealing + this.extraMasteryhealing + this.extraVivHealing + this.extraEnvBonusHealing;
  }

  get averageHealing() {
    return this.risingMistCount === 0 ? 0 : this.totalHealing / this.risingMistCount;
  }

  get averageTargetsPerRM() {
    return this.targetCount / this.risingMistCount || 0;
  }

  get calculateVivOverHealing(){
    return formatPercentage(this.extraVivOverhealing / (this.extraVivHealing + this.extraVivOverhealing));
  }

  get calculateMasteryOverHealing(){
    return formatPercentage(this.extraMasteryOverhealing / (this.extraMasteryhealing + this.extraMasteryOverhealing));
  }

  get calculateEFOverHealing(){
    return formatPercentage(this.extraEFOverhealing / (this.extraEFhealing + this.extraEFOverhealing));
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.RISING_MIST_TALENT.id}
        position={STATISTIC_ORDER.CORE(10)}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalHealing))}% total healing`}
        label="Healing Contributed"
        tooltip={(
          <>
            Your {this.risingMistCount} Rising Sun Kick casts contributed the following healing:
            <ul>
              <li>HoT Extension Healing: {formatNumber(this.hotHealing)}</li>
              <li>Rising Mist Direct Healing: {formatNumber(this.directHealing)}</li>
              <li>Average HoT Extension Seconds per cast: {this.averageExtension.toFixed(2)}</li>
              <ul>
                <li>Essense Font HoTs Extended: {this.efCount}</li>
                <li>Renewing Mist HoTs Extended: {this.remCount}</li>
                <li>Enveloping Mist HoTs Extended: {this.evmCount}</li>
              </ul>
              Vivify
              <ul>
                <li>Extra Cleaves: {this.extraVivCleaves}</li>
                <li>Extra Healing: {formatNumber(this.extraVivHealing)} ({this.calculateVivOverHealing}% Overhealing)</li>
              </ul>
              Enveloping Mist
              <ul>
                <li>Extra Hits: {this.extraEnvHits}</li>
                <li>Extra Healing: {formatNumber(this.extraEnvBonusHealing)}</li>
              </ul>
              Mastery
              <ul>
                <li>Extra Hits: {this.extraMasteryHits}</li>
                <li>Extra Healing: {formatNumber(this.extraMasteryhealing)} ({this.calculateMasteryOverHealing}% Overhealing)</li>
              </ul>
              {this.trackUplift ? (
              <>
                Uplift
                <ul>
                  <li>{formatNumber(this.cooldownReductionUsed/1000)||0} Revival Seconds Reduced</li>
                  <li>{formatNumber(this.cooldownReductionWasted/1000)||0} Revival Seconds Reduction Wasted</li>
                </ul>
               </>
               ):<></>
               }
            </ul>
          </>
        )}
      />
    );
  }
}

export default RisingMist;
