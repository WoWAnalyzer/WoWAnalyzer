import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

class SEF extends Module{
  static dependencies = {
    combatants: Combatants,
  };

  sefCDReduction = 0;

  get reducedCooldownWithTraits() {
    const player = this.combatants.selected;
    const splitPersonalityRank = player.traitsBySpellId[SPELLS.SPLIT_PERSONALITY.id];

    //Calculates the reduction in cooldown/recharge on Serenity/Storm, Earth and Fire, based on the rank of the Personality Trait
    if (splitPersonalityRank < 5) {
      this.sefCDreduction = splitPersonalityRank * 5;
    }
    else {
      switch (splitPersonalityRank) {
        case 5:
          this.sefCDreduction = 24;
          break;
        case 6:
          this.sefCDreduction = 28;
          break;
        case 7:
          this.sefCDreduction = 31;
          break;
        default:
          break;
      }
    }
    const reducedCooldownWithTraits = 90 - this.sefCDreduction;
    return reducedCooldownWithTraits;
  }
}

export default SEF;
