import React from 'react';
import SpellLink from 'common/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';

const debug = false;

class ShieldBlock extends Analyzer {

  shieldBlocksO;
  shieldBlocksD;
  shieldBlocksOv;
  goodCast = 0;
  badCast = 0;
  bolster = this.selectedCombatant.hasTalent(SPELLS.BOLSTER_TALENT.id);
  ssNeeded = !this.selectedCombatant.hasTalent(SPELLS.DEVASTATOR_TALENT.id) ? 0 : 1;


  physicalHitsWithShieldBlock = 0;
  physicalDamageWithShieldBlock = 0;
  physicalHitsWithoutShieldBlock = 0;
  physicalDamageWithoutShieldBlock = 0;

  constructor(...args) {
    super(...args);
    this.shieldBlocksO = [];
    this.shieldBlocksD = [];
    this.shieldBlocksOv = [];
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId !== SPELLS.SHIELD_BLOCK.id){
      return;
    }

    if(this.shieldBlocksD.length>0){
      this.checkLastBlock();
    }

    this.shieldBlockCast(event);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if(!this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id)){
      return;
    }

    if(spellId === SPELLS.SHIELD_SLAM.id){
      this.shieldSlamCast(event);
    }
  }

  on_toPlayer_damage(event) {

    if(!this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id)){
      return;
    }

    if(this.selectedCombatant.hasBuff(SPELLS.LAST_STAND.id) && this.bolster){
      return;
    }

    if(event.blocked > 0){
      this.shieldBlocksD[this.shieldBlocksD.length-1].blockAbleEvents += 1;
      this.shieldBlocksD[this.shieldBlocksD.length-1].eventName.add(event.ability.name);
    }

    this.shieldBlocksD[this.shieldBlocksD.length-1].blockedDamage += event.blocked || 0;
    this.shieldBlocksD[this.shieldBlocksD.length-1].damageTaken += event.amount + event.absorbed || 0;

    if(this.shieldBlocksD[this.shieldBlocksD.length-1].blockAbleEvents>1){
      this.shieldBlocksD[this.shieldBlocksD.length-1].good = true;
    }

  }

  shieldBlockCast(event){

    const offensive = {
      shieldBlock: this.shieldBlocksO.length + 1,
      shieldSlamCasts: 0,
      bonusDamage: 0,
      timeStamp: event.timestamp,
      good: false,
    };

    this.shieldBlocksO.push(offensive);
    
    const defensive = {
      shieldBlock: this.shieldBlocksD.length + 1,
      blockAbleEvents: 0,
      blockedDamage: 0,
      damageTaken: 0,
      eventName: new Set(),
      good: false,
    };

    this.shieldBlocksD.push(defensive);

  }

  shieldSlamCast(event){
    this.shieldBlocksO[this.shieldBlocksO.length-1].shieldSlamCasts++;

    if(this.shieldBlocksO[this.shieldBlocksO.length-1].shieldSlamCasts > this.ssNeeded){
      this.shieldBlocksO[this.shieldBlocksO.length-1].good = true;
    }

    const beforeDamage = this.shieldBlocksO[this.shieldBlocksO.length-1].bonusDamage || 0;
    const eventDamage = ((event.amount || 0) + (event.absorbed || 0));
    const bonusDamage = Math.round(eventDamage - eventDamage / 1.3);

    this.shieldBlocksO[this.shieldBlocksO.length-1].bonusDamage = beforeDamage + bonusDamage;
    
  }


  checkLastBlock(){

    const overall = {
      shieldBlock: this.shieldBlocksO[this.shieldBlocksO.length-1].shieldBlock,
      good: (this.shieldBlocksO[this.shieldBlocksO.length-1].good || this.shieldBlocksD[this.shieldBlocksD.length-1].good),
    };

    if(overall.good){
      this.goodCast += 1;
    }else{
      this.badCast +=1;
    }

    this.shieldBlocksOv.push(overall);

  }

  on_fightend(){
    if(this.shieldBlocksD.length>0){
      this.checkLastBlock();
    }

    if(debug){
      console.log(this.shieldBlocksO);
      console.log(`Do they have bolster? ${this.bolster}`);
      console.log(this.shieldBlocksD);
      console.log(this.shieldBlocksOv);
    }
  }

  get suggestionThresholds(){
    return {
      actual: this.goodCast/ (this.goodCast + this.badCast),
      isLessThan: {
        minor: 1,
        average: .80,
        major: .70,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <> You had uneventful <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> cast where there was either no blockable damage events or you didn't cast shield slam enough. </>
      )
        .icon(SPELLS.SHIELD_BLOCK.icon)
        .actual(`${this.goodCast} good casts of shield block`)
        .recommended(`${Math.floor(recommended * (this.goodCast + this.badCast))} is recommended`);
    });
  }

  statistic() {
    let goodCasts = 0;
    let offensiveCasts = 0;
    let defensiveCasts = 0;
    const totalCasts = this.shieldBlocksOv.length;
    for(let i = 0; i<this.shieldBlocksOv.length; i++){
      goodCasts += this.shieldBlocksOv[i].good ? 1 : 0;
      offensiveCasts += this.shieldBlocksO[i].good ? 1 : 0;
      defensiveCasts += this.shieldBlocksD[i].good ? 1 : 0;
    }

    return (
      <Statistic
        size="flexible"
        tooltip={(
          <>
            Overall Bad Casts: {totalCasts - goodCasts}<br />
            Good Offensive Casts: {offensiveCasts}<br />
            Good Offensive casts where you cast <SpellLink id={SPELLS.SHIELD_SLAM.id} /> during the <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> buff to take advantage of increased <SpellLink id={SPELLS.SHIELD_SLAM.id} /> damage.
          <br /><br />
            Good Defensive casts: {defensiveCasts}<br />
            Good Defensive casts where you blocked several hits.
          <br /><br />
           Some casts may be good both offensively and defensively.
          <br /><br />
            Try to maximize the efficiency of your <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> casts by ensuring that you take advantage of the offensive or defensive effects each time. 
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SHIELD_BLOCK}>
          Bad Defensive Casts: {totalCasts - defensiveCasts}<br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ShieldBlock;
