import SPELLS from 'common/SPELLS/index';

import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const HOLY_WORD_REDUCERS = {
  [SPELLS.GREATER_HEAL.id]: 6000,
  [SPELLS.FLASH_HEAL.id]: 6000,
  [SPELLS.BINDING_HEAL_TALENT.id]: 3000,
  [SPELLS.RENEW.id]: 2000,
  [SPELLS.PRAYER_OF_HEALING.id]: 6000,
  [SPELLS.HOLY_WORD_SERENITY.id]: 30000,
  [SPELLS.HOLY_WORD_SANCTIFY.id]: 30000,
  [SPELLS.SMITE.id]: 4000,
};
const APOTHEOSIS_MULTIPLIER = 3;
const LIGHT_OF_THE_NAARU_MULTIPLIER_ADDITION = 1/3;

/**
 * This module reduces the cooldowns of Holy Word spells.
 * Feel free to combine this and the Serendipity module as they both are about the same mechanic,
 * the Serindipity one is finding out the wasted reduction while this module simply reduces them.
 */
class HolyWordsReduction extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  reductionMultiplier = 1;
  reductionAdditions = 0;
  hasSalvation = false;

  reductionAmountBySpell = {};

  constructor(...args) {
    super(...args);
    const hasLotN = this.selectedCombatant.hasTalent(SPELLS.LIGHT_OF_THE_NAARU_TALENT.id);
    this.hasApotheosis = this.selectedCombatant.hasTalent(SPELLS.APOTHEOSIS_TALENT.id);
    this.hasSalvation = this.selectedCombatant.hasTalent(SPELLS.HOLY_WORD_SALVATION_TALENT.id);

    if(hasLotN) {
      this.reductionMultiplier += LIGHT_OF_THE_NAARU_MULTIPLIER_ADDITION;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const spellName = event.ability.name;

    switch(spellId) {
      case SPELLS.GREATER_HEAL.id:
      case SPELLS.FLASH_HEAL.id:
        this.reduceHolyWordCooldown(SPELLS.HOLY_WORD_SERENITY.id, spellId, spellName);
        return;
      case SPELLS.BINDING_HEAL_TALENT.id:
        this.reduceHolyWordCooldown(SPELLS.HOLY_WORD_SERENITY.id, spellId, spellName);
        this.reduceHolyWordCooldown(SPELLS.HOLY_WORD_SANCTIFY.id, spellId, spellName);
        return;
      case SPELLS.RENEW.id:
      case SPELLS.PRAYER_OF_HEALING.id:
        this.reduceHolyWordCooldown(SPELLS.HOLY_WORD_SANCTIFY.id, spellId, spellName);
        return;
      case SPELLS.SMITE.id:
        this.reduceHolyWordCooldown(SPELLS.HOLY_WORD_CHASTICE.id, spellId, spellName);
        return;
      default:
        break;
    }

    if(!this.hasSalvation) {
      return;
    }

    if(spellId === SPELLS.HOLY_WORD_SERENITY.id || spellId === SPELLS.HOLY_WORD_SANCTIFY.id) {
      this.reduceHolyWordCooldown(SPELLS.HOLY_WORD_SALVATION_TALENT.id, spellId, spellName);
    }
  }

  reduceHolyWordCooldown(holyWord, spellId, spellName) {
    if (!this.reductionAmountBySpell[spellId]) {
      this.reductionAmountBySpell[spellId] = {
        name: spellName,
        amount: 0,
      };
    }
    if (!this.spellUsable.isOnCooldown(holyWord)) {
      return;
    }

    let reduction = HOLY_WORD_REDUCERS[spellId] * this.reductionMultiplier;
    if(this.hasApotheosis) {
      const apotheosisActive = this.selectedCombatant.hasBuff(SPELLS.APOTHEOSIS_TALENT.id);
      if(apotheosisActive) {
        reduction *= APOTHEOSIS_MULTIPLIER;
      }
    }

    this.spellUsable.reduceCooldown(holyWord, reduction);

    this.reductionAmountBySpell[spellId].amount += reduction;
  }
}

export default HolyWordsReduction;
