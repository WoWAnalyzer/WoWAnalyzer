import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const LEGENDARY_VELENS_HEAL_SPELL_ID = 235967;
const LEGENDARY_VELENS_HEALING_INCREASE = 0.15;

class Velens extends Module {
  healing = 0;


  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id);
    }
  }

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

    if (!this.owner.selectedCombatant.hasBuff(SPELLS.VELENS_FUTURE_SIGHT.id, event.timestamp)) {
      return;
    }

    // Rewriting the effectiveHealing function here, to remove the final step of removing the raw overheal from the effective healing of the trinket.
    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    // const overheal = event.overheal || 0;
    const raw = amount + absorbed /*+ overheal*/;
    const relativeHealingIncreaseFactor = 1 + LEGENDARY_VELENS_HEALING_INCREASE;
    const healingIncrease = raw - raw / relativeHealingIncreaseFactor;
    const effectiveHealing = healingIncrease;
    //const effectiveHealing = raw * 0.1304;

    this.healing += Math.max(0, effectiveHealing);
  }

  // Beacon transfer is included in `ABILITIES_AFFECTED_BY_HEALING_INCREASES`
}

export default Velens;
