import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import {HOTS} from '../../Constants';

const ESSENCE_OF_GHANIR_HEALING_INCREASE = 1;

class EssenceOfGhanir extends Module {
  healingIncreaseHealing = 0;
  rejuvenation = 0;
  wildGrowth = 0;
  cenarionWard = 0;
  cultivation = 0;
  springBlossoms = 0;
  lifebloom = 0;
  regrowth = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if(this.owner.selectedCombatant.hasBuff(SPELLS.ESSENCE_OF_GHANIR.id) && HOTS.indexOf(spellId) !== -1){
      switch(spellId) {
        case SPELLS.REJUVENATION.id:
          this.rejuvenation += calculateEffectiveHealing(event, ESSENCE_OF_GHANIR_HEALING_INCREASE);
          break;
        case SPELLS.REJUVENATION_GERMINATION.id:
          this.rejuvenation += calculateEffectiveHealing(event, ESSENCE_OF_GHANIR_HEALING_INCREASE);
          break;
        case SPELLS.WILD_GROWTH.id:
          this.wildGrowth += calculateEffectiveHealing(event, ESSENCE_OF_GHANIR_HEALING_INCREASE);
          break;
        case SPELLS.CENARION_WARD.id:
          this.cenarionWard += calculateEffectiveHealing(event, ESSENCE_OF_GHANIR_HEALING_INCREASE);
          break;
        case SPELLS.CULTIVATION.id:
          this.cultivation += calculateEffectiveHealing(event, ESSENCE_OF_GHANIR_HEALING_INCREASE);
          break;
        case SPELLS.SPRING_BLOSSOMS.id:
          this.springBlossoms += calculateEffectiveHealing(event, ESSENCE_OF_GHANIR_HEALING_INCREASE);
          break;
        case SPELLS.LIFEBLOOM_HOT_HEAL.id:
          this.lifebloom += calculateEffectiveHealing(event, ESSENCE_OF_GHANIR_HEALING_INCREASE);
          break;
        case SPELLS.REGROWTH.id:
          if(event.tick === true){
            this.wildGrowth += calculateEffectiveHealing(event, ESSENCE_OF_GHANIR_HEALING_INCREASE);
          }
          break;
        default:
          console.error("EssenceOfGhanir: Error, could not identify this object as a HoT: %o", event);
      }

      if(SPELLS.REGROWTH.id === spellId && event.tick !== true) {
        return;
      }
      this.healingIncreaseHealing += calculateEffectiveHealing(event, ESSENCE_OF_GHANIR_HEALING_INCREASE);
    }
  }

}

export default EssenceOfGhanir;
