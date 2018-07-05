import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

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

/**
 * This module reduces the cooldowns of Holy Word spells.
 * Feel free to combine this and the Serendipity module as they both are about the same mechanic,
 * the Serindipity one is finding out the wasted reduction while this module simply reduces them.
 */
class HolyWords extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  reductionMultiplier = 1;
  reductionAdditions = 0;
  hasSalvation = false;

  constructor(...args) {
    super(...args);
    const hasLotN = this.selectedCombatant.hasTalent(SPELLS.LIGHT_OF_THE_NAARU_TALENT.id);
    this.hasApotheosis = this.selectedCombatant.hasTalent(SPELLS.APOTHEOSIS_TALENT.id);
    this.hasSalvation = this.selectedCombatant.hasTalent(SPELLS.HOLY_WORD_SALVATION_TALENT.id);

    this.reductionMultiplier = hasLotN ? this.reductionMultiplier + (1/3) : this.reductionMultiplier;
    if (this.selectedCombatant.hasBuff(SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF)) {
      this.reductionAdditions += 1000;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    switch(spellId) {
      case SPELLS.GREATER_HEAL.id:
      case SPELLS.FLASH_HEAL.id:
        this.reduceHolyWordCooldown(SPELLS.HOLY_WORD_SERENITY.id, spellId);
        return;
      case SPELLS.BINDING_HEAL_TALENT.id:
        this.reduceHolyWordCooldown(SPELLS.HOLY_WORD_SERENITY.id, spellId);
        this.reduceHolyWordCooldown(SPELLS.HOLY_WORD_SANCTIFY.id, spellId);
        return;
      case SPELLS.RENEW.id:
      case SPELLS.PRAYER_OF_HEALING.id:
        this.reduceHolyWordCooldown(SPELLS.HOLY_WORD_SANCTIFY.id, spellId);
        return;
      case SPELLS.SMITE.id:
        this.reduceHolyWordCooldown(SPELLS.HOLY_WORD_CHASTICE.id, spellId);
        return;
      default:
        break;
    }

    if(!this.hasSalvation) {
      return;
    }

    if(spellId === SPELLS.HOLY_WORD_SERENITY.id || spellId === SPELLS.HOLY_WORD_SANCTIFY.id) {
      this.reduceHolyWordCooldown(SPELLS.HOLY_WORD_SALVATION_TALENT.id, spellId);
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

    if (this.spellUsable.isOnCooldown(holyWord)) {
      this.spellUsable.reduceCooldown(holyWord, reduction);
    }
  }
}

export default HolyWords;
