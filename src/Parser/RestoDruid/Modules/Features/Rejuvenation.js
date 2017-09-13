import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

const BASE_MANA = 220000;
const REJUV_COST = 0.10; // % of base mana

/*
 * Backend module for calculating things about Rejuvenation, to be used by other modules.
 */
class Rejuvenation extends Module {

  totalRejuvHealing = 0;
  totalRejuvsCast = 0;
  totalRejuvsApplied = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const amount = event.amount + (event.absorbed === undefined ? 0 : event.absorbed);

    if (spellId === SPELLS.REJUVENATION.id || spellId === SPELLS.REJUVENATION_GERMINATION.id) {
      this.totalRejuvHealing += amount;
    } else if (this.hasGermination && SPELLS.REJUVENATION_GERMINATION.id === spellId) {
      this.totalRejuvHealing += amount;
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
    // TODO take into account dreamwalker etc.
    return this.totalRejuvsCast === 0 ? 0 : this.totalRejuvHealing / this.totalRejuvsCast;
  }

  /*
   * The expected healing done by using the given amount of mana to fill with Rejuv casts
   */
  getRejuvFillHealing(mana) {
    return mana / (BASE_MANA / REJUV_COST) * this.avgRejuvHealing;
  }

}

export default Rejuvenation;
