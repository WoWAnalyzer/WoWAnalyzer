import React from 'react';
import Analyzer, {SELECTED_PLAYER} from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import { calculateAzeriteEffects, calculateSecondaryStatDefault } from 'common/stats';

import Events from 'parser/core/Events';
import EventsIcon from 'interface/icons/Events';
import HIT_TYPES from 'game/HIT_TYPES';
import ItemDamageDone from 'interface/ItemDamageDone';
import ItemHealingDone from 'interface/ItemHealingDone';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatIcon from 'interface/icons/PrimaryStat';
import StatisticGroup from 'interface/statistics/StatisticGroup';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import StatTracker from 'parser/shared/modules/StatTracker';
import UptimeIcon from 'interface/icons/Uptime';

import StatValues from '../StatValues';

const LIGHTS_DECREE_BASE_DURATION = 5;
const AVENGING_WRATH_BASE_DURATION = 20;
const AVENGING_WRATH_CRIT_BONUS = 0.3;

// this will have to be replaced when corrupted gear adds more crit damage/healing //
const CRIT_HEALING_DAMAGE = 2;
const CRIT_HEALING_BONUS = 2;

/**
 * Vision of Perfection
 * Major: Your spells and abilities have a chance to activate Avenging Wrath for 35% of its base duration.
 * Minor: When the Vision of Perfection activates, you and up to 2 other nearby allies gain 2 Haste for 10 sec.
 * Example Log: https://www.warcraftlogs.com/reports/NXkDdR1LnhAcPabq#fight=12&type=auras&source=3
 */
class VisionOfPerfection extends Analyzer {
  static dependencies = { 
    statTracker: StatTracker,
    statValues: StatValues,
  };

  lastAvengingCrusaderCast = null;
  avengingWrathDuration = AVENGING_WRATH_BASE_DURATION;
  lightsDecreeDuration = LIGHTS_DECREE_BASE_DURATION;

  critHeals = 0;
  bonusHealing = 0;
  bonusCritHealing = 0;

  critDamage = 0;
  bonusDamage = 0;
  bonusCritDamage = 0;

  majorHealing = 0;
  majorHaste = 0;
  minorHealing = 0;
  minorVersatility = 0;
  procs = 0;
  extendedBy = 0;
  rank = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.VISION_OF_PERFECTION.traitId);
    if (!this.active) {
      return;
    }

    this.rank = this.selectedCombatant.essenceRank(SPELLS.VISION_OF_PERFECTION.traitId);
    
    if(this.selectedCombatant.hasTalent(SPELLS.SANCTIFIED_WRATH_TALENT.id)){
      this.avengingWrathDuration += this.avengingWrathDuration * 0.25;
      this.lightsDecreeDuration += this.lightsDecreeDuration * 0.25;
    }

    if (this.selectedCombatant.hasTrait(SPELLS.LIGHTS_DECREE.id)){
      this.avengingWrathDuration += this.lightsDecreeDuration;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AVENGING_WRATH), this.onAvengingWrathCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VISION_OF_PERFECTION_HASTE_BUFF_SELF), this.onVisionProc);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.STRIVE_FOR_PERFECTION_HEAL), this.onVisionHeal);

    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.VISION_OF_PERFECTION.traitId);
    if (this.hasMajor){
        this.majorHaste = calculateAzeriteEffects(SPELLS.VISION_OF_PERFECTION_HASTE_CALC.id, this.selectedCombatant.neck.itemLevel)[0];
        this.statTracker.add(SPELLS.VISION_OF_PERFECTION_HASTE_BUFF_SELF.id, {
            haste: this.majorHaste,
          });
    }

    if (this.rank > 2){
        this.minorVersatility = calculateSecondaryStatDefault(420,45,this.selectedCombatant.neck.itemLevel);
        this.statTracker.add(SPELLS.STRIVE_FOR_PERFECTION.id, {
            versatility: this.minorVersatility,
        });
    }
}

isBuffFromVisionOfPerfection(event){
  const buff = this.selectedCombatant.getBuff(SPELLS.AVENGING_WRATH.id, event.timestamp);
  if (buff === undefined) {
    return false;
  }

  // if avenging crusader has not been cast yet //
  if (this.lastAvengingCrusaderCast === null){
    return true;
  }

  // if a Vision of Percetion proc happens during wings, it will be added to the end //
  if((event.timestamp - this.lastAvengingCrusaderCast) > (this.avengingWrathDuration * 1000 )){
    return true;
  }

  return false;
}

onDamage(event){
  if (!this.isBuffFromVisionOfPerfection(event)){
    return;
  }

  const damage = (event.amount + (event.absorbed || 0));
  this.bonusDamage += damage - (damage / 1.2);

  const isCrit = event.hitType === HIT_TYPES.CRIT || event.hitType === HIT_TYPES.BLOCKED_CRIT;
  if (!isCrit){
    return;
  }

  this.critDamage += 1;
  const { baseCritChance, ratingCritChance } = this.statValues._getCritChance(event);
  const critContribution = AVENGING_WRATH_CRIT_BONUS / (baseCritChance + ratingCritChance);
  this.bonusCritDamage += critContribution * (damage / CRIT_HEALING_DAMAGE);
}

onHeal(event){
  if (!this.isBuffFromVisionOfPerfection(event)){
    return;
  }

  const healing = (event.amount + (event.absorbed || 0));
  const overHeal = (event.overheal || 0);
  const totalHealing = healing + overHeal;
  const extraHealing = totalHealing - (totalHealing / 1.2);
  if (extraHealing > overHeal){
    this.bonusHealing += extraHealing - overHeal;
  }

  const isCrit = event.hitType === HIT_TYPES.CRIT;
  if (!isCrit){
    return;
  }

  this.critHeals += 1;
  const baseHeal = totalHealing / CRIT_HEALING_BONUS;
  if (overHeal > totalHealing - baseHeal){
    return;
  }

  const { baseCritChance, ratingCritChance } = this.statValues._getCritChance(event);
  const critContribution = AVENGING_WRATH_CRIT_BONUS / (baseCritChance + ratingCritChance);
  this.bonusCritHealing += critContribution * (healing - baseHeal);
}

onAvengingWrathCast(event){
  this.lastAvengingCrusaderCast = event.timestamp;
}

onVisionProc(event){
    this.procs += 1;
    this.extendedBy += AVENGING_WRATH_BASE_DURATION * 0.35;
}

onVisionHeal(event){
    this.minorHealing += event.amount + (event.absorbed || 0);
}

get additionalUptime(){
    return 100 * (this.extendedBy * 1000) / this.owner.fightDuration; 
}

get visionHasteBuff(){
    const uptime = this.selectedCombatant.getBuffUptime(SPELLS.VISION_OF_PERFECTION_HASTE_BUFF_SELF.id);
    return this.majorHaste * (uptime / this.owner.fightDuration);
}

statistic() {
    return (
      <StatisticGroup category={STATISTIC_CATEGORY.ITEMS}>
        <ItemStatistic
          ultrawide
          size="flexible"
        >
          <div className="pad">
            <label><SpellLink id={SPELLS.STRIVE_FOR_PERFECTION.id} /> - Minor Rank {this.rank}</label>
            <div className="value">
              {this.rank > 1 && (<><ItemHealingDone amount={this.minorHealing} /><br /></>)}
              {this.rank > 2 && (<><StatIcon stat={"versatility"} /> {formatNumber(this.minorVersatility)} <small>Versatility gained</small><br /></>)}
            </div>
          </div>
        </ItemStatistic>
        {this.hasMajor && (
          <ItemStatistic
            ultrawide
            size="flexible"
          >
            <div className="pad">
              <label><SpellLink id={SPELLS.VISION_OF_PERFECTION.id} /> - Major Rank {this.rank}</label>
              <div className="value">
                <EventsIcon /> {this.procs} <small>procs</small><br />
                <ItemHealingDone amount={this.bonusHealing + this.bonusCritHealing} /><br />
                <ItemDamageDone amount={this.bonusDamage + this.bonusCritDamage} /><br />
                <UptimeIcon /> {this.additionalUptime.toFixed(1)}% <small>uptime {this.extendedBy} seconds</small><br />
                {this.rank > 2 && (<><StatIcon stat={"haste"} /> {formatNumber(this.visionHasteBuff)} <small>average Haste gained</small><br /></>)}
              </div>
            </div>
          </ItemStatistic>
        )}
      </StatisticGroup>
    );
  }
}

export default VisionOfPerfection;
