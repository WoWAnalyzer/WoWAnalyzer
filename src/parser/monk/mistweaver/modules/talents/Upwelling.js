import React from 'react';

import SPELLS from 'common/SPELLS';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Combatants from 'parser/shared/modules/Combatants';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';


//const debug = false;

const BASE_HOT_TIME = 8000;//ef's hot base time
const BASE_BOLTS = 17;//18 base but we start counting at 0 so 18th on bolt count = 19th bolt


/**
 * Upwelling is a talent that increases essence font's hot by 4 seconds and for every second off cooldown up to 18 seconds it provides an extra bolt for the next ef cast
 * NOTE the buff this provides for extra bolts is invisible so we get to do some ugly coding
 * Things to Track
 * Extra bolts from Upwelling
 * Extra hot time from NON-upwelling bolts
 * Total hot time from upwelling bolts
 */
class Upwelling extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  totalHealing = 0;
  totalOverhealing = 0;
  totalAbsorbs = 0;

  castEF = 0;//casts of ef
  extraHots = 0;//number of extra hots
  extraBolts = 0;//number of extra bolts
  efHotHeal = 0;//healing from hots
  efHotOverheal = 0;//overhealing from hots

  boltCount = 0;

  totalBolts = 0;

  hotMap = new Map();//tracking on who has what and how it is

  masteryTickTock = false;
  masteryHit = 0;
  masteryHealing = 0;
  masteryOverhealing = 0;
  masteryAbsorbed = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.UPWELLING_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT_BUFF), this.efHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT), this.efcast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT_BUFF), this.applyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT_BUFF), this.removeBuff);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS), this.handleMastery);
  }

  efHeal(event) {
    if(event.tick){
      this.hotHeal(event);
    }else{
      this.boltHeal(event);
    }
  }

  hotHeal(event){
    const targetID = event.targetID;//short hand

    if(this.hotMap.has(targetID)){//check if hot heals before bolt hits (should never happen but logs)
      if(this.hotMap.get(targetID).fullCount || event.timestamp - BASE_HOT_TIME > this.hotMap.get(targetID).applicationTime){//check if its an extra bolt from ef or was part of the core 18
        this.efHotHeal += (event.amount || 0) + (event.absorbed || 0);
        this.efHotOverheal += event.overheal || 0;
      }
    }
  }

  boltHeal(event){
    const targetID = event.targetID;//short hand

    this.totalBolts += 1;//told number of bolts
    if (this.boltCount > BASE_BOLTS){//only get bolts that are from upwelling
      this.totalHealing += event.amount || 0;
      this.totalOverhealing += event.overheal || 0;
      this.totalAbsorbs += event.absorbed || 0;
      this.extraBolts += 1;
    }
    const holder = {
      fullCount: this.boltCount > BASE_BOLTS,//if its an extra bolt or not
      applicationTime: event.timestamp,//time when casted for nonextra damage
    };
    this.hotMap.set(targetID, holder);//overriding is okay and actually desired if it want to
    this.boltCount += 1;//increase current bolt
  }

  efcast(event) {
    this.castEF += 1;
    this.boltCount = 0;
    this.hotMap.clear();
  }

  applyBuff(event) {
    if (this.boltCount > BASE_BOLTS) {//Hots from extra bolts
      this.extraHots += 1;
    }
  }

  removeBuff(event){
    this.hotMap.delete(event.targetID);
  }

  handleMastery(event){
    const targetID = event.targetID;//short hand

    if(!this.hotMap.has(targetID)){
      return;
    }

    if(!this.combatants.players[targetID]){//fixes weird bug where if the target fails to load we break the module... might want to add this to core
      return;
    }

    if(this.combatants.players[targetID].hasBuff(SPELLS.ESSENCE_FONT_BUFF.id, event.timestamp, 0, 0)) {//do they have the hot
      if(this.hotMap.get(targetID).fullCount || event.timestamp - BASE_HOT_TIME > this.hotMap.get(targetID).applicationTime){
        if(!this.masteryTickTock){
          this.masteryHit += 1;
          this.masteryHealing += event.amount || 0;
          this.masteryOverhealing += event.overheal || 0;
          this.masteryAbsorbed += event.absorbed || 0;
        }
        this.masteryTickTock = !this.masteryTickTock;
      }
    }
  }

  get totalHealingAll(){
    return this.totalHealing + this.totalAbsorbs + this.efHotHeal + this.masteryHealing + this.masteryAbsorbed;
  }

  get overhealingBolt(){
    return this.totalOverhealing/(this.totalOverhealing+this.totalHealing);
  }

  get overhealingHot(){
    return this.efHotOverheal / (this.efHotHeal + this.efHotOverheal);
  }

  get overhealingMastery(){
    return this.masteryOverhealing/ (this.masteryHealing+this.masteryOverhealing+this.masteryAbsorbed);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.UPWELLING_TALENT.id}
        position={STATISTIC_ORDER.CORE(10)}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalHealingAll))}% Total Healing`}
        label={`Upwelling Healing`}
        tooltip={(
          <>
          <div>
            Counts healing from extra bolts, healing from the extra 4 second of a hot on a normal bolt (first 18), healing from the full hot on upwelling bolts (post 18), and any mastery event from the hot under the same idea as hot counting
          </div>
            <ul>
              <li>Extra Bolts: {formatNumber(this.extraBolts)}</li>
              <li>Extra Bolts Healing: {formatNumber(this.totalHealing)} ({formatPercentage(this.overhealingBolt)}% overhealing)</li>
              <li>Extra Hots: {formatNumber(this.extraHots)}</li>
              <li>Hots Healing: {formatNumber(this.efHotHeal)} ({formatPercentage(this.overhealingHot)}% overhealing)</li>
              <li>Extra Mastery Hits: {formatNumber(this.masteryHit)}</li>
              <li>Extra Mastery Healing: {formatNumber(this.masteryHealing)} ({formatPercentage(this.overhealingMastery)}% overhealing)</li>
            </ul>
          </>
        )}
      />
    );
  }
}

export default Upwelling;
