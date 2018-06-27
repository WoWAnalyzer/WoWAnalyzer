import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import Abilities from '../Abilities';

const HOLY_WORD_REDUCERS = {
  [SPELLS.GREATER_HEAL.id]: 6000,
  [SPELLS.FLASH_HEAL.id]: 6000,
  [SPELLS.BINDING_HEAL_TALENT.id]: 3000,
  [SPELLS.RENEW.id]: 2000,
  [SPELLS.PRAYER_OF_HEALING.id]: 4000,
  [SPELLS.HOLY_WORD_SERENITY.id]: 30000,
  [SPELLS.HOLY_WORD_SANCTIFY.id]: 30000,
  [SPELLS.SMITE.id]: 4000,
};
const APOTHEOSIS_MULTIPLIER = 3;
/* easier to read
const SANCTIFY = [
  SPELLS.GREATER_HEAL.id,
  SPELLS.FLASH_HEAL.id,
];*/
const SANCTIFY = SPELLS.HOLY_WORD_SANCTIFY.id;
const SERENITY = SPELLS.HOLY_WORD_SERENITY.id;
const SALVATION = SPELLS.HOLY_WORD_SALVATION_TALENT.id;
const CHASTICE = SPELLS.HOLY_WORD_CHASTICE.id;

class HolyWords extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  rawReduction = {
    [SPELLS.HOLY_WORD_SANCTIFY.id]: 0,
    [SPELLS.HOLY_WORD_SERENITY.id]: 0,
    [SPELLS.HOLY_WORD_SALVATION_TALENT.id]: 0,
    [SPELLS.HOLY_WORD_CHASTICE.id]: 0,
  };
  overcast = {
    ...this.rawReduction,
  }
  reductionMultiplier = 1;
  reductionAdditions = 0;
  firstSalvationCast = true;
  hasSalvation = false;

  constructor(...args) {
    super(...args);
    const hasLotN = this.selectedCombatant.hasTalent(SPELLS.LIGHT_OF_THE_NAARU_TALENT.id);
    this.reductionMultiplier = hasLotN ? this.reductionMultiplier + (1/3) : this.reductionMultiplier;
    this.hasApotheosis = this.selectedCombatant.hasTalent(SPELLS.APOTHEOSIS_TALENT.id);
    this.hasSalvation = this.selectedCombatant.hasTalent(SPELLS.HOLY_WORD_SALVATION_TALENT.id);
    // has t20 2p
    // reduction Additions
    if (this.selectedCombatant.hasBuff(SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF)) {
      this.reductionAdditions += 1000;
      this.holy_t20_2p_active = true;
    }
  }

  // add apotheosis

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    // test spellUsable here and replace the serendipity files?
    // maybe use variables instead, do the switch, test spellusable for serendipity function and then reduce it

    switch(spellId) {
      case SPELLS.GREATER_HEAL.id:
      case SPELLS.FLASH_HEAL.id:
        this.reduceHolyWordCooldown(SERENITY, spellId); //automatically let it know what to reduce
        return;
      case SPELLS.BINDING_HEAL_TALENT.id:
        this.reduceHolyWordCooldown(SERENITY, spellId);
        this.reduceHolyWordCooldown(SANCTIFY, spellId);
        return;
      case SPELLS.RENEW.id:
      case SPELLS.PRAYER_OF_HEALING.id:
        this.reduceHolyWordCooldown(SANCTIFY, spellId);
        return;
      case SPELLS.SMITE.id:
        this.reduceHolyWordCooldown(CHASTICE, spellId);
        return;
      default:
        break;
    }

    if(this.hasSalvation) {
      switch(spellId) {
        case SERENITY:
        case SANCTIFY:
          this.reduceHolyWordCooldown(SALVATION, spellId);
          break;
        // as Salvation is not a rotational spell, we should only count everything after the first cast
        case SALVATION:
          if(this.firstSalvationCast) {
            this.overcast[SALVATION] = 0;
            this.rawReduction[SALVATION] = 0;
            this.firstSalvationCast = false;
          }
          break;
        default:
          break;
      }
    }
  }

  reduceHolyWordCooldown(holyWord, spellId) {
    let reduction = (HOLY_WORD_REDUCERS[spellId] + this.reductionAdditions) * this.reductionMultiplier;
    if(this.hasApotheosis) {
      const apotheosisActive = this.selectedCombatant.hasBuff(SPELLS.APOTHEOSIS_TALENT.id);
      if(apotheosisActive) {
        reduction *= APOTHEOSIS_MULTIPLIER;
      }
    }
    this.rawReduction[holyWord] += reduction;

    if (this.spellUsable.isOnCooldown(holyWord)) {
      this.spellUsable.reduceCooldown(holyWord, reduction);
    } else {
      this.overcast[holyWord] += reduction;
    }
    this.error(holyWord);
  }

  get totalWastedPercentage() {
    const totalOvercast = Object.values(this.overcast).reduce((total, reduction) => total + reduction);
    const totalRawReduction = Object.values(this.rawReduction).reduce((total, reduction) => total + reduction);
    return totalOvercast / totalRawReduction;
  }

  statistic() {
    let tooltip = `
      ${formatNumber(this.overcast[SERENITY] / 1000)}s wasted Serenity reduction (of ${formatNumber(this.rawReduction[SERENITY] / 1000)}s total)<br/>
      ${formatNumber(this.overcast[SANCTIFY] / 1000)}s wasted Sanctify reduction (of ${formatNumber(this.rawReduction[SANCTIFY] / 1000)}s total)<br/>`;
    if(this.hasSalvation) {
      tooltip += `${formatNumber(this.overcast[SALVATION] / 1000)}s wasted Salvation reduction (of ${formatNumber(this.rawReduction[SALVATION] / 1000)}s total)<br/>`;
    }
    if(this.overcast[CHASTICE] > 0 || this.rawReduction[CHASTICE] > 0) {
      tooltip += `${formatNumber(this.overcast[CHASTICE] / 1000)}s wasted Chastice reduction (of ${formatNumber(this.rawReduction[CHASTICE] / 1000)}s total)<br/>`;
    }
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HOLY_WORDS.id} />}
        value={`${formatPercentage(this.totalWastedPercentage)}%`}
        label="Wasted Holy Words cooldown reduction"
        tooltip={tooltip}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default HolyWords;
