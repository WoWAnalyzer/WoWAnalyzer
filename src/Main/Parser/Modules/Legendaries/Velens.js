import Module from 'Main/Parser/Module';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'Main/Parser/Constants';
import calculateEffectiveHealing from 'Main/Parser/calculateEffectiveHealing';

export const VELENS_ITEM_ID = 144258;
const LEGENDARY_VELENS_BUFF_SPELL_ID = 235966;
const LEGENDARY_VELENS_HEAL_SPELL_ID = 235967;
const LEGENDARY_VELENS_HEALING_INCREASE = 0.15;

class Velens extends Module {
  healing = 0;
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1 && spellId !== LEGENDARY_VELENS_HEAL_SPELL_ID) {
      return;
    }

    if (spellId === LEGENDARY_VELENS_HEAL_SPELL_ID) {
      // This is the overhealing part of Velen's Future Sight, just include its amount and we're done
      this.healing += event.amount;
      return;
    }

    if (!this.owner.selectedCombatant.hasBuff(LEGENDARY_VELENS_BUFF_SPELL_ID)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, LEGENDARY_VELENS_HEALING_INCREASE);
  }
  
  // Beacon transfer is included in `ABILITIES_AFFECTED_BY_HEALING_INCREASES`
}

export default Velens;
