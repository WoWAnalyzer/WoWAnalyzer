import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatNumber } from 'common/format';

// dependencies
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

const HOLY_WORD_SPELL_IDS = [
  SPELLS.HOLY_WORD_SERENITY.id,
  SPELLS.HOLY_WORD_SANCTIFY.id,
];

// This module might contain too much information but to rewrite some of the output
// in this file would entail a lot of redundant copying (aka violating the "DRY"
// coding mindset). Let me @enragednuke if you think I should move stuff out.

// Currently contains:
// - "Wasted Serendipity" statistic
// - "Fully missed holy word casts (via Serendipity)" suggestion
// - "Holy Priest T20 2P Bonus" item
class Serendipity extends Module {
  static dependencies = {
    combatants: Combatants,
  }

  // Holy Word reduction spells (aka things that apply Serendipity)
  serendipityProccers = {
    [SPELLS.GREATER_HEAL.id]: SPELLS.HOLY_WORD_SERENITY.id,
    [SPELLS.FLASH_HEAL.id]: SPELLS.HOLY_WORD_SERENITY.id,
    [SPELLS.PRAYER_OF_HEALING.id]: SPELLS.HOLY_WORD_SANCTIFY.id,
  }

  getAffectedSpell(spellId) {
    if (Object.keys(this.serendipityProccers).indexOf(spellId.toString()) === -1) {
      return -1;
    }
    return this.serendipityProccers[spellId];
  }

  // CD tracker
  holyWordCooldowns = {
    [SPELLS.HOLY_WORD_SERENITY.id]: 0,
    [SPELLS.HOLY_WORD_SANCTIFY.id]: 0,
  }

  // Cooldowns for Holy Words
  holyWordMaxCooldown = {
    [SPELLS.HOLY_WORD_SERENITY.id]: 60,
    [SPELLS.HOLY_WORD_SANCTIFY.id]: 0, // modified in on_initialized
  }

  // Serendipity amount (modified accordingly in on_initialized)
  serendipityReduction = 6.0


  //   Output values

  holy2PsetValue = 0.0

  // Overall wasted serendipity
  overcast = {
    [SPELLS.HOLY_WORD_SERENITY.id]: 0.0,
    [SPELLS.HOLY_WORD_SANCTIFY.id]: 0.0,
  }
  // Cast tracker
  casts = {
    [SPELLS.HOLY_WORD_SERENITY.id]: 0,
    [SPELLS.HOLY_WORD_SANCTIFY.id]: 0,
  }
  // How many full casts were missed (i.e. 60s of consecutive wasted Serendipity on Serenity)
  fullOvercast = {
    [SPELLS.HOLY_WORD_SERENITY.id]: 0,
    [SPELLS.HOLY_WORD_SANCTIFY.id]: 0,
  }
  // Tracker of how much wasted overcast between each holy word cast
  _tempOvercast = {
    [SPELLS.HOLY_WORD_SERENITY.id]: 0.0,
    [SPELLS.HOLY_WORD_SANCTIFY.id]: 0.0,
  }

  on_initialized() {
    // Set up proper serendipity reduction values
    if (this.combatants.selected.hasTalent(SPELLS.LIGHT_OF_THE_NAARU_TALENT.id)) {
      this.serendipityReduction += 2.0;
    }
    if (this.combatants.selected.hasBuff(SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF)) {
      this.serendipityReduction += 1.0;
    }

    // Check for Piety for serendipityProccers
    if (this.combatants.selected.hasTalent(SPELLS.PIETY_TALENT.id)) {
      this.serendipityProccers[SPELLS.PRAYER_OF_MENDING_CAST.id] = SPELLS.HOLY_WORD_SANCTIFY.id;
    }

    // Modify Sanctify CD based on trait
    this.holyWordMaxCooldown[SPELLS.HOLY_WORD_SANCTIFY.id] = 60 - ((this.combatants.selected.traitsBySpellId[SPELLS.HALLOWED_GROUND_TRAIT.id] || 0) * SPELLS.HALLOWED_GROUND_TRAIT.coeff);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (HOLY_WORD_SPELL_IDS.indexOf(spellId) !== -1) {
      this.holyWordCooldowns[spellId] = event.timestamp + this.holyWordMaxCooldown[spellId] * 1000;
      this.casts[spellId] += 1;

      // We are giving a buffer of 75% of CD due to the fact that the large
      // majority of players would intentionally use spells to push holy words
      // off cooldown if needed. This is a feelycraft metric that is open for
      // modification or outright removal depending on opinions.
      this.fullOvercast[spellId] += Math.floor(this._tempOvercast[spellId] / 1000 / (this.holyWordMaxCooldown[spellId] * 0.75));
      this._tempOvercast[spellId] = 0.0;
    }

    const affectedSpellId = this.getAffectedSpell(spellId);
    if (affectedSpellId !== -1) {
      const difference = this.holyWordCooldowns[affectedSpellId] - event.timestamp;
      if (difference < this.serendipityReduction * 1000) {
        const overlap = Math.min(
          this.serendipityReduction * 1000,
          Math.abs((this.serendipityReduction * 1000) - difference)
        );
        this.overcast[affectedSpellId] += overlap;
        this._tempOvercast[affectedSpellId] += overlap;
      }

      // Logic for determining Holy Priest 2P Set Bonus gain
      if (difference > (this.serendipityReduction - SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF.coeff) * 1000) {
        this.holy2PsetValue += Math.min(1, difference - (this.serendipityReduction - SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF.coeff) * 1000);
      }
      this.holyWordCooldowns[affectedSpellId] -= this.serendipityReduction * 1000;
    }

    // Because Binding Heal is weird (applies to both holy words and at half
    // effectiveness), we should really have separate logic for it that does it
    // manually.
    if (spellId === SPELLS.BINDING_HEAL_TALENT.id) {
      const differenceSerenity = this.holyWordCooldowns[SPELLS.HOLY_WORD_SERENITY.id] - event.timestamp;
      const differenceSanctify = this.holyWordCooldowns[SPELLS.HOLY_WORD_SANCTIFY.id] - event.timestamp;

      if (differenceSerenity < this.serendipityReduction * 500) {
        const overlap = Math.min(
          this.serendipityReduction * 500,
          Math.abs((this.serendipityReduction * 500) - differenceSerenity)
        );
        this.overcast[SPELLS.HOLY_WORD_SERENITY.id] += overlap;
        this._tempOvercast[SPELLS.HOLY_WORD_SERENITY.id] += overlap;
      }

      if (differenceSanctify < this.serendipityReduction * 500) {
        const overlap = Math.min(
          this.serendipityReduction * 500,
          Math.abs((this.serendipityReduction * 500) - differenceSanctify)
        );
        this.overcast[SPELLS.HOLY_WORD_SANCTIFY.id] += overlap;
        this._tempOvercast[SPELLS.HOLY_WORD_SANCTIFY.id] += overlap;
      }

      // Logic for determining Holy Priest 2P Set Bonus gain
      if (differenceSerenity > (this.serendipityReduction - SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF.coeff) * 500) {
        this.holy2PsetValue += Math.min(0.5, differenceSerenity - (this.serendipityReduction - SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF.coeff) * 500);
      }
      if (differenceSanctify > (this.serendipityReduction - SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF.coeff) * 500) {
        this.holy2PsetValue += Math.min(0.5, differenceSanctify - (this.serendipityReduction - SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF.coeff) * 500);
      }

      this.holyWordCooldowns[SPELLS.HOLY_WORD_SERENITY.id] -= this.serendipityReduction * 500;
      this.holyWordCooldowns[SPELLS.HOLY_WORD_SANCTIFY.id] -= this.serendipityReduction * 500;
    }
  }

  statistic() {
    const combinedOvercast = (this.overcast[SPELLS.HOLY_WORD_SERENITY.id] + this.overcast[SPELLS.HOLY_WORD_SANCTIFY.id]) / 1000;
    const formattedOvercastSerenity = formatNumber(this.overcast[SPELLS.HOLY_WORD_SERENITY.id] / 1000);
    const formattedOvercastSanctify = formatNumber(this.overcast[SPELLS.HOLY_WORD_SANCTIFY.id] / 1000);

    const overcastAsCastsSerenity = (this.overcast[SPELLS.HOLY_WORD_SERENITY.id] / 1000) / this.holyWordMaxCooldown[SPELLS.HOLY_WORD_SERENITY.id];
    const overcastAsCastsSanctify = (this.overcast[SPELLS.HOLY_WORD_SANCTIFY.id] / 1000) / this.holyWordMaxCooldown[SPELLS.HOLY_WORD_SANCTIFY.id];
    const overcastAsPercCasts = (
      (overcastAsCastsSerenity + overcastAsCastsSanctify) / (this.casts[SPELLS.HOLY_WORD_SERENITY.id] + this.casts[SPELLS.HOLY_WORD_SANCTIFY.id] + overcastAsCastsSanctify + overcastAsCastsSerenity)
    );

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SERENDIPITY.id} />}
        value={`${formatNumber(combinedOvercast)}s`}
        label="Wasted Serendipity"
        tooltip={`${formattedOvercastSerenity} wasted Serenity CD and ${formattedOvercastSanctify} wasted Sanctify CD. This is effectively ${formatPercentage(overcastAsPercCasts)}% of your potential Holy Word casts missed from solely wasted Serendipity.`}
      />
    );
  }

  suggestions(when) {
    const totalFullOvercast = this.fullOvercast[SPELLS.HOLY_WORD_SERENITY.id] + this.fullOvercast[SPELLS.HOLY_WORD_SANCTIFY.id];

    when(totalFullOvercast).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        // This wording is somewhat poor but I can't figure out a good alternative for it.
        return suggest('You held onto Holy Words too long. Try to cast Holy Words if you think you won\'t need them before they come up again instead of using filler heals.')
          .icon(SPELLS.SERENDIPITY.icon)
          .actual(`${totalFullOvercast} missed casts.`)
          .recommended('It is recommended to miss none.')
          .regular(recommended + 1).major(recommended + 2);
      });
  }

  item() {
    return {
      id: `spell-${SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`Effective gain from the 2-piece bonus. This filters out wasted Serendipity.`}>
          {this.holy2PsetValue} seconds of additional Holy Word cooldown reduction
        </dfn>
      ),
    };
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}


export default Serendipity;
