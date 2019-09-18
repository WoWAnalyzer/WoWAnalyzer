import React from 'react';
import { formatPercentage, formatThousands } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';

import ShieldBlock from '../spells/ShieldBlock';

const debug = false;

//Moved from another file as it was easier to keep track of with this name
class BlockCheck extends Analyzer {
  static dependencies = {
    shieldBlock: ShieldBlock,
  };

  physicalHitsWithBlock = 0;
  physicalDamageWithBlock = 0;
  physicalHitsWithoutBlock = 0;
  physicalDamageWithoutBlock = 0;

  listOfEvents;

  bolster = this.selectedCombatant.hasTalent(SPELLS.BOLSTER_TALENT.id);
  heavyRepercussions = this.selectedCombatant.hasTalent(SPELLS.HEAVY_REPERCUSSIONS_TALENT.id);

  //key to make variable names shorter
  //HR = heavyRepercussions
  //Bl = bolster
  noHRorBlThresholds = {//no HR and no BL 
    minor: 0.4,
    average: 0.35,
    major: 0.3,
  };

  blnoHRThresholds = {//has BL doesn't have HR
    minor: 0.85,
    average: 0.75,
    major: 0.7,
  }
  
  blHRThresholds = {//has BL and HR 
    minor: 0.95,
    average: 0.9,
    major: 0.8,
  }

  thresholdsToUse;

  constructor(...args) {
    super(...args);
    this.listOfEvents = [];
    if(this.bolster && this.heavyRepercussions){
      this.thresholdsToUse = this.blHRThresholds;
    }else if(this.bolster && !this.heavyRepercussions){
      this.thresholdsToUse = this.blnoHRThresholds;
    }else{
      this.thresholdsToUse = this.noHRorBlThresholds;
    }
  }

  on_toPlayer_damage(event) {
    // Physical
    if (event.ability.type === 1) {
      event.prot = {
        shieldBlock: this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id),//ability to look what important buffs they had retro actively
        bloster: (this.bolster && this.selectedCombatant.hasBuff(SPELLS.LAST_STAND.id)),
      };
      this.listOfEvents.push(event);
    }
  }

  on_fightend() {
    let blockableSet = new Set();//this is master list of all BLOCKED events in the fight
    blockableSet.add(1);//make it so if they never hit sb we still get data from the melees they take
    this.shieldBlock.shieldBlocksDefensive.forEach(function(block){
      block.eventName.forEach(function(blockedAbility){
        blockableSet.add(blockedAbility);//just go through one set to another
      });
    });

    const that = this;
    this.listOfEvents.forEach(function(event){
      if(blockableSet.has(event.ability.guid)){//if it ain't been blocked over the whole fight it prob aint blockable
        if (event.prot.shieldBlock || event.prot.bloster) {//they got block up when it happened?
          that.physicalHitsWithBlock += 1;
          that.physicalDamageWithBlock += event.amount + (event.absorbed || 0) + (event.overkill || 0);
        } else {
          that.physicalHitsWithoutBlock += 1;
          that.physicalDamageWithoutBlock += event.amount + (event.absorbed || 0) + (event.overkill || 0);
        }
      }
    });

    if (debug) {
      console.log(`Hits with block spell up ${this.physicalHitsWithBlock}`);
      console.log(`Damage with block spell up ${this.physicalDamageWithBlock}`);
      console.log(`Hits without block spell up ${this.physicalHitsWithoutBlock}`);
      console.log(`Damage without block spell up ${this.physicalDamageWithoutBlock}`);
      console.log(`Total physical ${this.physicalDamageWithoutBlock}${this.physicalDamageWithBlock}`);
    }
  }

  get suggestionThresholds() {//was in here before but is/was never used and appears to be very high requirements that are unreasonable maybe lower and add laster?
    return {
      actual: this.physicalDamageWithBlock / (this.physicalDamageWithBlock + this.physicalDamageWithoutBlock),
      isLessThan: this.thresholdsToUse,
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<>You only had <SpellLink id={SPELLS.SHIELD_BLOCK_BUFF.id} /> or <SpellLink id={SPELLS.LAST_STAND.id} /> for {formatPercentage(actual)}% of physical damage taken. You should have one of the two up to mitigate as much physical damage as possible.</>)
            .icon(SPELLS.SHIELD_BLOCK_BUFF.icon)
            .actual(`${formatPercentage(actual)}% was mitigated by a block spell`)
            .recommended(`${Math.round(formatPercentage(recommended))}% or more is recommended but this may vary between fights`);
        });
  }

  statistic() {
    const physicalHitsMitigatedPercent = this.physicalHitsWithBlock / (this.physicalHitsWithBlock + this.physicalHitsWithoutBlock);
    const physicalDamageMitigatedPercent = this.physicalDamageWithBlock / (this.physicalDamageWithBlock + this.physicalDamageWithoutBlock);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHIELD_BLOCK_BUFF.id} />}
        value={`${formatPercentage (physicalHitsMitigatedPercent)}%`}
        label="Physical Hits Mitigated"
        tooltip={(
          <>
            Shield Block usage breakdown:
            <ul>
              <li>You were hit <strong>{this.physicalHitsWithBlock}</strong> times with block up (<strong>{formatThousands(this.physicalDamageWithBlock)}</strong> damage).</li>
              <li>You were hit <strong>{this.physicalHitsWithoutBlock}</strong> times <strong><em>without</em></strong> block up (<strong>{formatThousands(this.physicalDamageWithoutBlock)}</strong> damage).</li>
            </ul>
            <strong>{formatPercentage(physicalHitsMitigatedPercent)}%</strong> of physical attacks were mitigated with Block (<strong>{formatPercentage(physicalDamageMitigatedPercent)}%</strong> of physical damage taken).
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default BlockCheck;