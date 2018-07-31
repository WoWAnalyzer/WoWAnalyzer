import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
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

  applyAbsorbEvents = [];

  graceHealing = 0;

  healingUnaffectedByMastery = 0;
  healingUnbuffedByMastery = 0;
  healingBuffedByMastery = 0;
  atonement = 0;

  getGraceHealing(event) {
    const currentMastery = this.statTracker.currentMasteryPercentage;
    const masteryContribution = calculateEffectiveHealing(
      event,
      currentMastery
    );
    return masteryContribution;
  }

  on_byPlayer_absorbed(event){
    const spellId = event.ability.guid;

    if(!PRIEST_WHITELIST.includes(spellId)){
      this.healingUnaffectedByMastery += event.amount;
      return;
    }

    const target = this.combatants.getEntity(event);
    if (!target) return;

    if(this.absorbApplicationWasMasteryBuffed(event)){
      this.graceHealing += this.getGraceHealing(event);
      this.healingBuffedByMastery += event.amount;
    } else {
      this.healingUnbuffedByMastery += event.amount;
    }
  }

  absorbApplicationWasMasteryBuffed(event){
    const applyEvent =  this.applyAbsorbEvents.slice().reverse().find(x => x.applyBuffEvent.targetID === event.targetID);
    return applyEvent ? applyEvent.masteryBuffed : false;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if(!(PRIEST_WHITELIST.includes(spellId) && event.absorb)){
      return;
    }

    const target = this.combatants.getEntity(event);
    if (!target) return;

    this.applyAbsorbEvents.push({
      applyBuffEvent: event,
      masteryBuffed: target.hasBuff(SPELLS.ATONEMENT_BUFF.id),
      eventsAssociated: [],
    });

  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (!PRIEST_WHITELIST.includes(spellId)) {
      this.healingUnaffectedByMastery += event.amount;
      return;
    }

    const target = this.combatants.getEntity(event);
    if (!target) return;

    if (!target.hasBuff(SPELLS.ATONEMENT_BUFF.id)) {
      this.healingUnbuffedByMastery += event.amount;
      return;
    }

    if(isAtonement(event)) {
      this.atonement += event.amount;
    }
    this.healingBuffedByMastery += event.amount;
    this.graceHealing += this.getGraceHealing(event);
  }

  statistic() {
    const graceHealingPerc = this.owner.getPercentageOfTotalHealingDone(this.graceHealing);
    const healingUnaffectedByMasteryPerc = this.owner.getPercentageOfTotalHealingDone(this.healingUnaffectedByMastery);
    const healingUnbuffedByMasteryPerc = this.owner.getPercentageOfTotalHealingDone(this.healingUnbuffedByMastery);
    const healingBuffedByMasteryPerc = this.owner.getPercentageOfTotalHealingDone(this.healingBuffedByMastery);
    const atonementPerc = this.owner.getPercentageOfTotalHealingDone(this.atonement);
    const nonAtonementPerc = this.owner.getPercentageOfTotalHealingDone(this.healingBuffedByMastery - this.atonement);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GRACE.id} />}
        value={`${formatNumber(
          this.graceHealing / this.owner.fightDuration * 1000
        )} HPS`}
        label="Mastery Healing"
        tooltip={`
          Your mastery provided <b>${formatPercentage(graceHealingPerc)}%</b> healing
          <ul>
            <li><b>${formatPercentage(healingBuffedByMasteryPerc)}%</b> of your healing was buffed by mastery
              <ul>
                <li>Atonement: <b>${formatPercentage(atonementPerc)}%</b></li>
                <li>Non-Atonement: <b>${formatPercentage(nonAtonementPerc)}%</b></li>
              </ul>
            </li>
            <li><b>${formatPercentage(healingUnbuffedByMasteryPerc)}%</b> of your healing was spells unbuffed by mastery</li>
            <li><b>${formatPercentage(healingUnaffectedByMasteryPerc)}%</b> of your healing was spells unaffected by mastery (trinkets, procs, etc...) </li>
          </ul>
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default grace;
