import React from 'react';

import StatisticBox from 'Interface/Others/StatisticBox';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import { HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR } from '../../Constants';

const PHOTOSYNTHESIS_HOT_INCREASE = 0.2;
// Spring blossoms double dips, confirmed by Bastas
const PHOTOSYNTHESIS_SB_INCREASE = 0.44;
const BLOOM_BUFFER_MS = 200;

/*
While your Lifebloom is on yourself, your periodic heals heal 20% faster.

While your Lifebloom is on an ally, your periodic heals on them have a 5% chance to cause it to bloom.
 */
class Photosynthesis extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  lifebloomIncrease = 0;

  lastRealBloomTimestamp = null;

  // Counters for increased ticking rate of hots
  increasedRateTotalHealing = 0;

  increasedRateRejuvenationHealing = 0;
  increasedRateWildGrowthHealing = 0;
  increasedRateCenarionWardHealing = 0;
  increasedRateCultivationHealing = 0;
  increasedRateLifebloomHealing = 0;
  increasedRateRegrowthHealing = 0;
  increasedRateTranqHealing = 0;
  increasedRateSpringBlossomsHealing = 0;
  increasedRateEffloHealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PHOTOSYNTHESIS_TALENT.id);
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.LIFEBLOOM_HOT_HEAL.id) {
      this.lastRealBloomTimestamp = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event){
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.LIFEBLOOM_HOT_HEAL.id) {
      return;
    }
    this.lastRealBloomTimestamp = event.timestamp;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const amount = event.amount + (event.absorbed || 0);

    // Lifebloom random bloom procc
    if(spellId === SPELLS.LIFEBLOOM_BLOOM_HEAL.id && (this.lastRealBloomTimestamp === null || (event.timestamp - this.lastRealBloomTimestamp) > BLOOM_BUFFER_MS)){
      this.lifebloomIncrease += amount;
    }

    // Yes it actually buffs efflorescence, confirmed by Voulk and Bastas
    if(this.selectedCombatant.hasBuff(SPELLS.LIFEBLOOM_HOT_HEAL.id) && (HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR.includes(spellId) || spellId === SPELLS.EFFLORESCENCE_HEAL.id || spellId === SPELLS.SPRING_BLOSSOMS.id)) {
      switch (spellId) {
        case SPELLS.REJUVENATION.id:
          this.increasedRateRejuvenationHealing += calculateEffectiveHealing(event, PHOTOSYNTHESIS_HOT_INCREASE);
          break;
        case SPELLS.REJUVENATION_GERMINATION.id:
          this.increasedRateRejuvenationHealing += calculateEffectiveHealing(event, PHOTOSYNTHESIS_HOT_INCREASE);
          break;
        case SPELLS.WILD_GROWTH.id:
          this.increasedRateWildGrowthHealing += calculateEffectiveHealing(event, PHOTOSYNTHESIS_HOT_INCREASE);
          break;
        case SPELLS.CENARION_WARD_HEAL.id:
          this.increasedRateCenarionWardHealing += calculateEffectiveHealing(event, PHOTOSYNTHESIS_HOT_INCREASE);
          break;
        case SPELLS.CULTIVATION.id:
          this.increasedRateCultivationHealing += calculateEffectiveHealing(event, PHOTOSYNTHESIS_HOT_INCREASE);
          break;
        case SPELLS.LIFEBLOOM_HOT_HEAL.id:
          this.increasedRateLifebloomHealing += calculateEffectiveHealing(event, PHOTOSYNTHESIS_HOT_INCREASE);
          break;
        case SPELLS.SPRING_BLOSSOMS.id:
          this.increasedRateSpringBlossomsHealing += calculateEffectiveHealing(event, PHOTOSYNTHESIS_SB_INCREASE);
          break;
        case SPELLS.EFFLORESCENCE_HEAL.id:
          this.increasedRateEffloHealing += calculateEffectiveHealing(event, PHOTOSYNTHESIS_HOT_INCREASE);
          break;
        case SPELLS.REGROWTH.id:
          if (event.tick === true) {
            this.increasedRateRegrowthHealing += calculateEffectiveHealing(event, PHOTOSYNTHESIS_HOT_INCREASE);
          }
          break;
        case SPELLS.TRANQUILITY_HEAL.id:
          if (event.tick === true) {
            this.increasedRateTranqHealing += calculateEffectiveHealing(event, PHOTOSYNTHESIS_HOT_INCREASE);
          }
          break;
        default:
          console.error('EssenceOfGhanir: Error, could not identify this object as a HoT: %o', event);
      }
    }

    if ((SPELLS.REGROWTH.id === spellId || SPELLS.TRANQUILITY_HEAL.id) && event.tick !== true) {
      return;
    }
    this.increasedRateTotalHealing += calculateEffectiveHealing(event, PHOTOSYNTHESIS_HOT_INCREASE);
  }

  statistic() {
    const totalPercent = this.owner.getPercentageOfTotalHealingDone(
      this.increasedRateRejuvenationHealing
      + this.increasedRateWildGrowthHealing
      + this.increasedRateCenarionWardHealing
      + this.increasedRateCultivationHealing
      + this.increasedRateLifebloomHealing
      + this.increasedRateRegrowthHealing
      + this.increasedRateTranqHealing
      + this.increasedRateSpringBlossomsHealing
      + this.increasedRateEffloHealing
      + this.lifebloomIncrease);
    const sourceID = this.selectedCombatant._combatantInfo.sourceID;
    const selfUptime = this.selectedCombatant.getBuffUptime(SPELLS.LIFEBLOOM_HOT_HEAL.id, sourceID);
    const totalUptime =
      Object.keys(this.combatants.players)
          .map(key => this.combatants.players[key])
          .reduce((uptime, player) => uptime + player.getBuffUptime(SPELLS.LIFEBLOOM_HOT_HEAL.id), sourceID);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PHOTOSYNTHESIS_TALENT.id} />}
        value={`${formatPercentage(totalPercent)} %`}
        label={'Photosynthesis'}
        tooltip={`
            Healing contribution
            <ul>
              <li>Rejuvenation: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateRejuvenationHealing))} %</b></li>
              <li>Wild Growth: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateWildGrowthHealing))} %</b></li>
              <li>Cenarion Ward: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateCenarionWardHealing))} %</b></li>
              <li>Cultivation: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateCultivationHealing))} %</b></li>
              <li>Lifebloom HoT: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateLifebloomHealing))} %</b></li>
              <li>Regrowth HoT: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateRegrowthHealing))} %</b></li>
              <li>Tranquility HoT: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateTranqHealing))} %</b></li>
              <li>Spring blossoms: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateSpringBlossomsHealing))} %</b></li>
              <li>Efflorescence: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateEffloHealing))} %</b></li>
              <hr>
              <li>Total HoT increase part: <b>${formatPercentage(totalPercent-this.owner.getPercentageOfTotalHealingDone(this.lifebloomIncrease))} %</b></li>
              <li>Lifebloom random bloom: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.lifebloomIncrease))} %</b></li>
            </ul>
            Lifebloom uptime
            <ul>
              <li>On Self: <b>${formatPercentage(selfUptime/ this.owner.fightDuration)} %</b>
              <li>On Others: <b>${formatPercentage((totalUptime - selfUptime) / this.owner.fightDuration)} %</b>
            </ul>
        `}
      />
    );
  }
}

export default Photosynthesis;
