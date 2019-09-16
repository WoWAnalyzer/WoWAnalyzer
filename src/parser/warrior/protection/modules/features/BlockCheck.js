import React from 'react';
import { formatPercentage, formatThousands } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';

const debug = false;

//Moved from another file as it was easier to keep track of with this name
class BlockCheck extends Analyzer {
  physicalHitsWithShieldBlock = 0;
  physicalDamageWithShieldBlock = 0;
  physicalHitsWithoutShieldBlock = 0;
  physicalDamageWithoutShieldBlock = 0;

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
      if (this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id) || (this.bolster && this.selectedCombatant.hasBuff(SPELLS.LAST_STAND.id))) {
        this.physicalHitsWithShieldBlock += 1;
        this.physicalDamageWithShieldBlock += event.amount + (event.absorbed || 0) + (event.overkill || 0);
      } else {
        this.physicalHitsWithoutShieldBlock += 1;
        this.physicalDamageWithoutShieldBlock += event.amount + (event.absorbed || 0) + (event.overkill || 0);
      }
    }
  }

  on_fightend() {
    if (debug) {
      console.log(`Hits with block spell up ${this.physicalHitsWithShieldBlock}`);
      console.log(`Damage with block spell up ${this.physicalDamageWithShieldBlock}`);
      console.log(`Hits without block spell up ${this.physicalHitsWithoutShieldBlock}`);
      console.log(`Damage without block spell up ${this.physicalDamageWithoutShieldBlock}`);
      console.log(`Total physical ${this.physicalDamageWithoutShieldBlock}${this.physicalDamageWithShieldBlock}`);
    }
  }

  get suggestionThresholds() {//was in here before but is/was never used and appears to be very high requirements that are unreasonable maybe lower and add laster?
    return {
      actual: this.physicalDamageWithShieldBlock / (this.physicalDamageWithShieldBlock + this.physicalDamageWithoutShieldBlock),
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
    const physicalHitsMitigatedPercent = this.physicalHitsWithShieldBlock / (this.physicalHitsWithShieldBlock + this.physicalHitsWithoutShieldBlock);
    const physicalDamageMitigatedPercent = this.physicalDamageWithShieldBlock / (this.physicalDamageWithShieldBlock + this.physicalDamageWithoutShieldBlock);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHIELD_BLOCK_BUFF.id} />}
        value={`${formatPercentage (physicalHitsMitigatedPercent)}%`}
        label="Physical Hits Mitigated"
        tooltip={(
          <>
            Shield Block usage breakdown:
            <ul>
              <li>You were hit <strong>{this.physicalHitsWithShieldBlock}</strong> times with block up (<strong>{formatThousands(this.physicalDamageWithShieldBlock)}</strong> damage).</li>
              <li>You were hit <strong>{this.physicalHitsWithoutShieldBlock}</strong> times <strong><em>without</em></strong> block up (<strong>{formatThousands(this.physicalDamageWithoutShieldBlock)}</strong> damage).</li>
            </ul>
            <strong>{formatPercentage(physicalHitsMitigatedPercent)}%</strong> of physical attacks were mitigated with Shield Block (<strong>{formatPercentage(physicalDamageMitigatedPercent)}%</strong> of physical damage taken).
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default BlockCheck;