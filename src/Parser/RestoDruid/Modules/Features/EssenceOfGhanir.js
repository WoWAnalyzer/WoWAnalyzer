import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

import {HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR} from '../../Constants';

// This modules estimates Essence of G'hanir healing. Since the ability increases the tick rate of all HoTs by 100%
// we can assume that half of all the healing (from the HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR array) is contributed.
class EssenceOfGhanir extends Module {
  healingIncreaseHealing = 0;
  rejuvenation = 0;
  wildGrowth = 0;
  cenarionWard = 0;
  cultivation = 0;
  lifebloom = 0;
  regrowth = 0;
  dreamer = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (this.owner.modules.combatants.selected.hasBuff(SPELLS.ESSENCE_OF_GHANIR.id) && HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR.indexOf(spellId) !== -1) {
      switch (spellId) {
        case SPELLS.REJUVENATION.id:
          this.rejuvenation += event.amount / 2;
          break;
        case SPELLS.REJUVENATION_GERMINATION.id:
          this.rejuvenation += event.amount / 2;
          break;
        case SPELLS.WILD_GROWTH.id:
          this.wildGrowth += event.amount / 2;
          break;
        case SPELLS.CENARION_WARD.id:
          this.cenarionWard += event.amount / 2;
          break;
        case SPELLS.CULTIVATION.id:
          this.cultivation += event.amount / 2;
          break;
        case SPELLS.LIFEBLOOM_HOT_HEAL.id:
          this.lifebloom += event.amount / 2;
          break;
        case SPELLS.REGROWTH.id:
          if (event.tick === true) {
            this.wildGrowth += event.amount / 2;
          }
          break;
        case SPELLS.DREAMER.id:
          this.dreamer += event.amount / 2;
          break;
        default:
          console.error("EssenceOfGhanir: Error, could not identify this object as a HoT: %o", event);
      }

      if (SPELLS.REGROWTH.id === spellId && event.tick !== true) {
        return;
      }
      this.healingIncreaseHealing += event.amount / 2;
    }
  }
}

export default EssenceOfGhanir;
