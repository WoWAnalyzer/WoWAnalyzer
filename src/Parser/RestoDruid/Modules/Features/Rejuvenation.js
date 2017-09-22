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
   * The total healing attributable to Rejuvenation
   */
  get totalRejuvHealing() {
    const rejuvTotals = this.mastery.getMultiMasteryHealing([SPELLS.REJUVENATION.id, SPELLS.REJUVENATION_GERMINATION.id]);
    return rejuvTotals + this.dreamwalkerHealing;
/*
    const rejuvDetails = this.mastery.getHealingDetails(SPELLS.REJUVENATION.id);
    const germDetails = this.mastery.getHealingDetails(SPELLS.REJUVENATION_GERMINATION.id);

    const rejuvDirect = rejuvDetails.direct;
    const rejuvMasteryWoGerm = Object.entries(rejuvDetails.mastery)
        .filter(entry => entry[0] !== SPELLS.REJUVENATION_GERMINATION.id)
        .reduce((s, v) => s + v, 0);
    const germDirect = germDetails.direct;
    const germMasteryWoRejuv = Object.entries(germDetails.mastery)
        .filter(entry => entry[0] !== SPELLS.REJUVENATION.id)
        .reduce((s, v) => s + v, 0);
*/
  }

  /*
   * The average healing caused per cast of Rejuvenation
   */
  get avgRejuvHealing() {
    return this.totalRejuvHealing / this.totalRejuvsCast;
  }

  get totalRejuvHealing() {
    // TODO Check the above FIXME and add mastery to this method
    // Should cultivation be added too?
    const rejuvDirect = this.mastery.getDirectHealing(SPELLS.REJUVENATION.id);
    const germDirect = this.mastery.getDirectHealing(SPELLS.REJUVENATION_GERMINATION.id);
    return rejuvDirect + germDirect + this.dreamwalkerHealing;
  }

  /*
   * The expected healing done by using the given amount of mana to fill with Rejuv casts
   */
  getRejuvFillHealing(mana) {
    return mana / (BASE_MANA / REJUV_COST) * this.avgRejuvHealing;
  }

}

export default Rejuvenation;
