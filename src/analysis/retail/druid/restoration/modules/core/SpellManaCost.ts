import SPELLS from 'common/SPELLS';
import { CastEvent } from 'parser/core/Events';
import CoreSpellManaCost from 'parser/shared/modules/SpellManaCost';
import { TALENTS_DRUID } from 'common/TALENTS';

const MS_BUFFER = 200;
const ABUNDANCE_MANA_REDUCTION = 0.06;
const TOL_REJUVENATION_REDUCTION = 0.3;

class SpellManaCost extends CoreSpellManaCost {
  getResourceCost(event: CastEvent) {
    const spellId = event.ability.guid;
    let cost = super.getResourceCost(event);
    if (cost === 0) {
      return cost;
    }

    if (
      this.selectedCombatant.hasBuff(
        SPELLS.CLEARCASTING_BUFF.id,
        event.timestamp,
        MS_BUFFER,
        0,
        event.sourceID,
      ) &&
      spellId === SPELLS.REGROWTH.id
    ) {
      return 0;
    }

    // Mana is not adjusted for ToL
    if (
      this.selectedCombatant.hasBuff(
        TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id,
        event.timestamp,
        0,
        0,
        event.sourceID,
      ) &&
      (spellId === SPELLS.REJUVENATION.id || spellId === SPELLS.REJUVENATION_GERMINATION.id)
    ) {
      cost = cost - cost * TOL_REJUVENATION_REDUCTION;
    }

    // Mana is not adjusted for Regrowth + abundance
    if (spellId === SPELLS.REGROWTH.id) {
      const abundanceBuff = this.selectedCombatant.getBuff(
        SPELLS.ABUNDANCE_BUFF.id,
        event.timestamp,
        MS_BUFFER,
      );
      if (abundanceBuff != null) {
        return cost - cost * abundanceBuff.stacks * ABUNDANCE_MANA_REDUCTION;
      }
    }

    return cost;
  }
}

export default SpellManaCost;
