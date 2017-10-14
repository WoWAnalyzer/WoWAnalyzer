import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

class StormEarthAndFire extends Module{
  static dependencies = {
    combatants: Combatants,
  };

  get traitsCDReduction() {
    let traitsCDReduction = 0;
    const player = this.combatants.selected;
    const splitPersonalityRank = player.traitsBySpellId[SPELLS.SPLIT_PERSONALITY.id];
    //Calculates the reduction in cooldown/recharge on Serenity/Storm, Earth and Fire, based on the rank of the Personality Trait
    if (splitPersonalityRank < 5) {
      traitsCDReduction = splitPersonalityRank * 5;
    }
    else {
      switch (splitPersonalityRank) {
        case 5:
          traitsCDReduction = 24;
          break;
        case 6:
          traitsCDReduction = 28;
          break;
        case 7:
          traitsCDReduction = 31;
          break;
        default:
          break;
      }
      return traitsCDReduction;
    }
  }

  get reducedCooldownWithTraits() {
    const reducedCooldownWithTraits = 90 - this.traitsCDReduction();
    return reducedCooldownWithTraits;
  }
}

export default StormEarthAndFire;
