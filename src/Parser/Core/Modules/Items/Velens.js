import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const LEGENDARY_VELENS_HEAL_SPELL_ID = 235967;
const LEGENDARY_VELENS_HEALING_INCREASE = 0.15;

class Velens extends Module {
  healingIncreaseHealing = 0;
  overhealHealing = 0;
  get healing() {
    return this.healingIncreaseHealing + this.overhealHealing;
  }

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id);
    }
  }

  on_byPlayer_heal(event) {
    this.registerHeal(event);
  }
  on_byPlayer_absorbed(event) {
    this.registerHeal(event);
  }
  registerHeal(event) {
    const spellId = event.ability.guid;
    if (this.owner.constructor.abilitiesAffectedByHealingIncreases.indexOf(spellId) === -1 && spellId !== LEGENDARY_VELENS_HEAL_SPELL_ID) {
      return;
    }

    if (spellId === LEGENDARY_VELENS_HEAL_SPELL_ID) {
      // This is the overhealing part of Velen's Future Sight, just include its amount and we're done
      this.overhealHealing += event.amount;
      return;
    }

    if (!this.owner.selectedCombatant.hasBuff(SPELLS.VELENS_FUTURE_SIGHT.id, event.timestamp)) {
      return;
    }

    this.healingIncreaseHealing += calculateEffectiveHealing(event, LEGENDARY_VELENS_HEALING_INCREASE);
  }
}

export default Velens;
