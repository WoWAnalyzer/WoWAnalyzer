import React from 'react';
import { formatPercentage, formatThousands } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import ShieldBlock from '../spells/ShieldBlock';
import Events from 'parser/core/Events';

const debug = false;

//Moved from another file as it was easier to keep track of with this name
class BlockCheck extends Analyzer {
  static dependencies = {
    shieldBlock: ShieldBlock,
  };

  physicalHitsWithBlock = 0;
  physicalHitsWithoutBlock = 0;
  rawDamageWithBlock = 0;
  rawDamageWithoutBlock = 0;

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
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.fightend.to(SELECTED_PLAYER), this.onFightend);
  }

  onDamageTaken(event) {
    // Physical
    if (event.ability.type === 1) {
      event.prot = {
        shieldBlock: this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id),//ability to look what important buffs they had retro actively
        bloster: (this.bolster && this.selectedCombatant.hasBuff(SPELLS.LAST_STAND.id)),
      };
      this.listOfEvents.push(event);
    }
  }

  onFightend() {
    const blockableSet = new Set();//this is master list of all BLOCKED events in the fight
    blockableSet.add(1);//make it so if they never hit sb we still get data from the melees they take
    this.shieldBlock.shieldBlocksDefensive.forEach(function(block){
      block.eventSpellId.forEach(function(blockedAbility){
        blockableSet.add(blockedAbility);//just go through one set to another
      });
    });

    this.listOfEvents.forEach((event) => {
      if(blockableSet.has(event.ability.guid)){//if it ain't been blocked over the whole fight it prob aint blockable
        if (event.prot.shieldBlock || event.prot.bloster) {//they got block up when it happened?
          this.physicalHitsWithBlock += 1;
          this.rawDamageWithBlock += (event.unmitigatedAmount || 0);
        } else {
          this.physicalHitsWithoutBlock += 1;
          this.rawDamageWithoutBlock += (event.unmitigatedAmount || 0);
        }
      }
    });

    if (debug) {
      console.log(`Hits with block spell up ${this.physicalHitsWithBlock}`);
      console.log(`Hits without block spell up ${this.physicalHitsWithoutBlock}`);
    }
  }

  get suggestionThresholds() {//was in here before but is/was never used and appears to be very high requirements that are unreasonable maybe lower and add laster?
    return {
      actual: this.rawDamageWithBlock / (this.rawDamageWithBlock + this.rawDamageWithoutBlock),
      isLessThan: this.thresholdsToUse,
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => suggest(<>You only had <SpellLink id={SPELLS.SHIELD_BLOCK_BUFF.id} /> or <SpellLink id={SPELLS.LAST_STAND.id} /> for {formatPercentage(actual)}% of physical damage taken. You should have one of the two up to mitigate as much physical damage as possible.</>)
            .icon(SPELLS.SHIELD_BLOCK_BUFF.icon)
            .actual(i18n._(t('warrior.protection.suggestions.block.damageMitigated')`${formatPercentage(actual)}% was mitigated by a block spell`))
            .recommended(`${Math.round(formatPercentage(recommended))}% or more is recommended but this may vary between fights`));
  }

  statistic() {
    const physicalHitsMitigatedPercent = this.physicalHitsWithBlock / (this.physicalHitsWithBlock + this.physicalHitsWithoutBlock);
    const physicalDamageMitigatedPercent = this.rawDamageWithBlock / (this.rawDamageWithBlock + this.rawDamageWithoutBlock);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHIELD_BLOCK_BUFF.id} />}
        value={`${formatPercentage (physicalHitsMitigatedPercent)}%`}
        label="Physical Hits Mitigated"
        tooltip={(
          <>
            Shield Block usage breakdown:
            <ul>
              <li>You were hit <strong>{this.physicalHitsWithBlock}</strong> times with block up (<strong>{formatThousands(this.rawDamageWithBlock)}</strong> damage).</li>
              <li>You were hit <strong>{this.physicalHitsWithoutBlock}</strong> times <strong><em>without</em></strong> block up (<strong>{formatThousands(this.rawDamageWithoutBlock)}</strong> damage).</li>
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
