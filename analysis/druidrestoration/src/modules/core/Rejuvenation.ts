import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';

import Mastery from './Mastery';

const BASE_MANA = 20000;
const REJUV_COST = 0.105; // % of base mana

/*
 * Backend module for calculating things about Rejuvenation, to be used by other modules.
 */
class Rejuvenation extends Analyzer {
  /*
   * The total healing attributable to Rejuvenation
   */
  get totalRejuvHealing() {
    return this.mastery.getMultiMasteryHealing([
      SPELLS.REJUVENATION.id,
      SPELLS.REJUVENATION_GERMINATION.id,
    ]);
  }

  /*
   * The average healing caused per cast of Rejuvenation
   */
  get avgRejuvHealing() {
    return this.totalRejuvHealing / this.totalRejuvsCast;
  }

  static dependencies = {
    healingDone: HealingDone,
    mastery: Mastery,
  };

  protected healingDone!: HealingDone;
  protected mastery!: Mastery;

  totalRejuvsCast = 0;

  constructor(options: Options) {
    super(options);
    // this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION),
      this.onRejuvCast,
    );
    // this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.onApplyBuff);
    // this.addEventListener(Events.fightend, this.onFightend);
  }

  // onHeal(event: HealEvent) {
  //   // TODO
  // }

  onRejuvCast() {
    this.totalRejuvsCast += 1;
  }

  // onApplyBuff(event: ApplyBuffEvent) {
  //   // TODO check for applications too?
  // }
  //
  // onFightend() {
  //   // TODO debug prints
  // }

  /*
   * The expected healing done by using the given amount of mana to fill with Rejuv casts
   */
  getRejuvFillHealing(mana: number) {
    return (mana / (BASE_MANA / REJUV_COST)) * this.avgRejuvHealing;
  }
}

export default Rejuvenation;
