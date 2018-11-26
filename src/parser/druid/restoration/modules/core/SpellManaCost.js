import CoreSpellManaCost from 'parser/shared/modules/SpellManaCost';
import SPELLS from 'common/SPELLS/index';

const MS_BUFFER=200;
const ABUNDANCE_MANA_REDUCTION = 0.06;
const TOL_REJUVENATION_REDUCTION = 0.3;

class SpellManaCost extends CoreSpellManaCost {
  getResourceCost(event) {
    const spellId = event.ability.guid;
    let cost = super.getResourceCost(event);
    if (cost === 0) {
      return cost;
    }

    if(this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id, event.timestamp, MS_BUFFER, 0, event.sourceId) && spellId === SPELLS.REGROWTH.id) {
      return 0;
    }

    // Mana is not adjusted for ToL
    if(this.selectedCombatant.hasBuff(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id, event.timestamp, 0, 0, event.sourceId) && (spellId === SPELLS.REJUVENATION.id || spellId === SPELLS.REJUVENATION_GERMINATION)) {
      cost = cost - (cost * TOL_REJUVENATION_REDUCTION);
    }

    // Mana is not adjusted for Regrowth + abundance
    if(spellId === SPELLS.REGROWTH.id) {
      const abundanceBuff = this.selectedCombatant.getBuff(SPELLS.ABUNDANCE_BUFF.id, event.timestamp, MS_BUFFER);
      if (abundanceBuff != null) {
        return cost - (cost * abundanceBuff.stacks * ABUNDANCE_MANA_REDUCTION);
      }
    }

    return cost;
  }
}

export default SpellManaCost;
