import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';

import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import PRIEST_SPELLS from 'common/SPELLS/PRIEST';
import PRIEST_TALENTS from 'common/SPELLS/TALENTS/PRIEST';

import isAtonement from '../Core/isAtonement';

// Use the priest spell list to whitelist abilities
const PRIEST_WHITELIST = Object.entries({
  ...PRIEST_SPELLS,
  ...PRIEST_TALENTS,
}).map(ability => ability[1].id);

class grace extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };

  graceHealing = 0;
  atonementHealing = 0; // Atonement is always buffed by mastery
  nonAtonementBuffedHealing = 0;
  unbuffedWhiteListHealing = 0;
  buffedWhiteListHealing = 0;

  nonWhiteListHealing = 0; // Healing done unaffected by mastery (Trinkets, etc.)

  getGraceHealing(event) {
    // Get our mastery level at the moment, this is required for temporary buffs
    const currentMastery = this.statTracker.currentMasteryPercentage;
    const masteryContribution = calculateEffectiveHealing(
      event,
      currentMastery
    );

    return masteryContribution;
  }

  calculateEffectiveHealingFromApplyBuff(event, relativeHealIncrease) {
    const absorb = event.absorb || 0;
    const raw = absorb;
    const relativeHealingIncreaseFactor = 1 + relativeHealIncrease;
    const healingIncrease = raw - raw / relativeHealingIncreaseFactor;
    const effectiveHealing = healingIncrease;

    return Math.max(0, effectiveHealing);
  }

  on_byPlayer_applybuff(event){

    if(!event.absorb) return;

    if (!PRIEST_WHITELIST.includes(event.ability.guid)) {
      this.nonWhiteListHealing += event.absorb || 0;
      return;
    }

    // Get the target
    const target = this.combatants.getEntity(event);
    if (!target) return;

    // Mastery only buffs players benefitting from Atonement
    if (!target.hasBuff(SPELLS.ATONEMENT_BUFF.id)) {
      this.unbuffedWhiteListHealing += (event.absorb || 0);
      return;
    }
    else{
      this.buffedWhiteListHealing += (event.absorb || 0);

      const currentMastery = this.statTracker.currentMasteryPercentage;
      const masteryContribution = this.calculateEffectiveHealingFromApplyBuff(event,currentMastery);

      this.graceHealing += masteryContribution;

      console.log(event);
      return;
    }

  }

  on_byPlayer_heal(event) {

    // Check if the heal is whitelisted
    if (!PRIEST_WHITELIST.includes(event.ability.guid)) {
      this.nonWhiteListHealing += event.amount + (event.absorbed || 0);
      return;
    }

    // Get the target
    const target = this.combatants.getEntity(event);
    if (!target) return;

    // Mastery only buffs players benefitting from Atonement
    if (!target.hasBuff(SPELLS.ATONEMENT_BUFF.id)) {
      this.unbuffedWhiteListHealing += event.amount + (event.absorbed || 0);
      return;
    }

    if (isAtonement(event)) {
      this.atonementHealing += event.amount + (event.absorbed || 0);
    } else{
      this.nonAtonementBuffedHealing += event.amount + (event.absorbed || 0);
    }

    this.buffedWhiteListHealing += event.amount + (event.absorbed || 0);

    const graceHealing = this.getGraceHealing(event);

    this.graceHealing += graceHealing;
  }

  statistic() {

    const graceHealingPerc = this.owner.getPercentageOfTotalHealingDone(this.graceHealing);
    const nonWhiteListHealingPercentage = this.owner.getPercentageOfTotalHealingDone(this.nonWhiteListHealing);
    const atonementHealingPercentage = this.owner.getPercentageOfTotalHealingDone(this.atonementHealing);
    const nonAtonementBuffedHealingPercentage = this.owner.getPercentageOfTotalHealingDone(this.nonAtonementBuffedHealing);
    const unbuffedWhiteListHealingPercentage = this.owner.getPercentageOfTotalHealingDone(this.unbuffedWhiteListHealing);
    const buffedWhiteListHealingPercentage = this.owner.getPercentageOfTotalHealingDone(this.buffedWhiteListHealing);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GRACE.id} />}
        value={`${formatNumber(
          this.graceHealing / this.owner.fightDuration * 1000
        )} HPS`}
        label="Mastery Healing"
        tooltip={`
          Grace contributed towards <b>${formatPercentage(graceHealingPerc)}%</b> of your healing.
          <ul>
            <li>${formatPercentage(buffedWhiteListHealingPercentage)}% of your healing benefitted from grace.
              <ul>
                <li>${formatPercentage(atonementHealingPercentage)}% from atonement</li>
                <li>${formatPercentage(nonAtonementBuffedHealingPercentage)}% from other spells</li>
              </ul>
            </li>
            <li>${formatPercentage(unbuffedWhiteListHealingPercentage)}% was not buffed by mastery</li>
            <li>Healing done by spells unaffected by mastery: ${formatPercentage(nonWhiteListHealingPercentage)}%.</li>
          </ul>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default grace;
