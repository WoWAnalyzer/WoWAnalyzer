import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

import Mastery from './Mastery';

const BASE_MANA = 220000;
const REJUV_COST = 0.10; // % of base mana

/*
 * Backend module for calculating things about Rejuvenation, to be used by other modules.
 */
class Rejuvenation extends Module {
  static dependencies = {
    mastery: Mastery,
  };

  totalRejuvsCast = 0;

  dreamwalkerHealing = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if(spellId === SPELLS.DREAMWALKER.id) {
      this.dreamwalkerHealing += event.amount + (event.absorbed || 0);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    // TODO make this account for procs / etc. that apply rejuv
    if (SPELLS.REJUVENATION.id === spellId) {
      this.totalRejuvsCast += 1;
    }
  }

  on_byPlayer_applybuff(event) {
    // TODO check for applications too?
  }


  on_finished() {
    // TODO debug prints
  }

  /*
   * The average healing caused per cast of Rejuvenation
   */
  get avgRejuvHealing() {
    const rejuvDirect = this.mastery.getDirectHealing(SPELLS.REJUVENATION.id);
    //const rejuvMastery = this.mastery.getMasteryHealing(SPELLS.REJUVENATION.id);
    const germDirect = this.mastery.getDirectHealing(SPELLS.REJUVENATION_GERMINATION.id);
    //const germMastery = this.mastery.getMasteryHealing(SPELLS.REJUVENATION_GERMINATION.id);
    const total = rejuvDirect + germDirect + this.dreamwalkerHealing;
    // FIXME adding the direct + mastery of both moderately overcounts, because when both rejuv and germ are on same target,
    //       there is a portion of double counting in rejuvDirect/germMastery and germDirect/rejuvMastery.
    //       Enhancements to the Mastery module may be required.

    return this.totalRejuvsCast === 0 ? 0 : total / this.totalRejuvsCast;
  }

  /*
   * The expected healing done by using the given amount of mana to fill with Rejuv casts
   */
  getRejuvFillHealing(mana) {
    return mana / (BASE_MANA / REJUV_COST) * this.avgRejuvHealing;
  }

}

export default Rejuvenation;
