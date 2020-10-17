import React from 'react';

import StatisticBox from 'interface/others/StatisticBox';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import { HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR } from '../../constants';
import Events from 'parser/core/Events';

const PHOTOSYNTHESIS_HOT_INCREASE = 0.2;
// Spring blossoms double dips, confirmed by Bastas
const PHOTOSYNTHESIS_SB_INCREASE = 0.44;
const BLOOM_BUFFER_MS = 100;

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
  increasedRateRejuvenationHealing = 0;
  increasedRateWildGrowthHealing = 0;
  increasedRateCenarionWardHealing = 0;
  increasedRateCultivationHealing = 0;
  increasedRateLifebloomHealing = 0;
  increasedRateRegrowthHealing = 0;
  increasedRateTranqHealing = 0;
  increasedRateSpringBlossomsHealing = 0;
  increasedRateEffloHealing = 0;
  increasedRateGroveTendingHealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PHOTOSYNTHESIS_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_HOT_HEAL), this.onCast);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_HOT_HEAL), this.onRemoveBuff);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.EFFLORESCENCE_HEAL, SPELLS.SPRING_BLOSSOMS, ...HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR]), this.onHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_BLOOM_HEAL), this.onLifebloomProc);
  }


  onCast(event) {
    this.lastRealBloomTimestamp = event.timestamp;
  }


  onRemoveBuff(event){
    this.lastRealBloomTimestamp = event.timestamp;
  }

  randomProccs = 0;
  naturalProccs = 0;

  onLifebloomProc(event){
    // Lifebloom random bloom procc
    if(this.lastRealBloomTimestamp === null || (event.timestamp - this.lastRealBloomTimestamp) > BLOOM_BUFFER_MS) {
      this.lifebloomIncrease += event.amount;
      this.randomProccs += 1;
    } else {
      this.naturalProccs += 1;
    }
  }

  onHeal(event) {
    const spellId = event.ability.guid;

    // Yes it actually buffs efflorescence, confirmed by Voulk and Bastas
    if(this.selectedCombatant.hasBuff(SPELLS.LIFEBLOOM_HOT_HEAL.id, null, 0, 0, this.selectedCombatant.sourceID)) {
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
        case SPELLS.GROVE_TENDING.id:
          this.increasedRateGroveTendingHealing += calculateEffectiveHealing(event, PHOTOSYNTHESIS_HOT_INCREASE);
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
          console.error('Photosynthesis: Error, could not identify this object as a HoT: %o', event);
      }
    }
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
      + this.increasedRateGroveTendingHealing
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
        label="Photosynthesis"
        tooltip={(
          <>
            Healing contribution
            <ul>
              <li>Rejuvenation: <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateRejuvenationHealing))} %</strong></li>
              <li>Wild Growth: <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateWildGrowthHealing))} %</strong></li>
              <li>Cenarion Ward: <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateCenarionWardHealing))} %</strong></li>
              <li>Cultivation: <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateCultivationHealing))} %</strong></li>
              <li>Lifebloom HoT: <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateLifebloomHealing))} %</strong></li>
              <li>Regrowth HoT: <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateRegrowthHealing))} %</strong></li>
              <li>Tranquility HoT: <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateTranqHealing))} %</strong></li>
              <li>Spring Blossoms: <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateSpringBlossomsHealing))} %</strong></li>
              <li>Efflorescence: <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateEffloHealing))} %</strong></li>
              <li>Grove Tending: <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateGroveTendingHealing))} %</strong></li>
              <hr />
              <li>Total HoT increase part: <strong>{formatPercentage(totalPercent-this.owner.getPercentageOfTotalHealingDone(this.lifebloomIncrease))} %</strong></li>
              <li>Lifebloom random bloom: <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.lifebloomIncrease))} %</strong> (Random proccs: {this.randomProccs}, Natural proccs: {this.naturalProccs})</li>
            </ul>
            Lifebloom uptime
            <ul>
              <li>On Self: <strong>{formatPercentage(selfUptime/ this.owner.fightDuration)} %</strong></li>
              <li>On Others: <strong>{formatPercentage((totalUptime - selfUptime) / this.owner.fightDuration)} %</strong></li>
            </ul>
          </>
        )}
      />
    );
  }
}

export default Photosynthesis;
