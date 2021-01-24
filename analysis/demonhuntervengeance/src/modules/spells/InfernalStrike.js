import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';

/*  When considering Infernal Strike, it is worth tracking how much time is spent overcapped on charges.
    Unless you are in a fight that requires quick back-to-back movement uses, it is best to use a charge of this before,
    or shortly after gaining a second use. */
class InfernalStrike extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };

  infernalCasts = 0;
  infernalCharges = 2;
  lastCastTimestamp = 0;
  currentCastTimestamp = 0;
  castsAtCap = 0;
  secsOverCap = 0;

  get percentCastsAtCap() {
    return this.castsAtCap / this.infernalCasts;
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: this.percentCastsAtCap,
      isLessThan: {
        minor: 0.8,
        average: 0.7,
        major: 0.6,
      },
      style: 'percentage',
    };
  }

  constructor(options) {
    super(options);
    /* TODO: Continue to monitor this if the logging ever gets fixed. Until then, this module won't work

        As of 12/28/2020 logging for infernal strikes is broken. Casts aren't recorded at all.
        Damage events are triggered, but this doesn't capture using the ability for mobility
    */

    this.addEventListener(Events.cast.spell(SPELLS.INFERNAL_STRIKE).by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event) {
    this.currentCastTimestamp = event.timestamp;

    // Track recharge
    if (this.currentCastTimestamp > this.lastCastTimestamp + 12000) {
      this.infernalCharges++;
    }
    this.infernalCasts++;

    // Track overcapped data
    if (this.infernalCharges === 2) {
      this.castsAtCap++;
      if (this.lastCastTimestamp > 0) {
        this.secsOverCap += (this.currentCastTimestamp - this.lastCastTimestamp - 1200) / 1000;
      }
    }

    this.infernalCharges--;

  }
}

export default InfernalStrike;
