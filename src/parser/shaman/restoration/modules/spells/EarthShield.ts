import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';

import EarthShieldCore from '../../../shared/talents/EarthShield';
import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

class EarthShield extends EarthShieldCore {
  static dependencies = {
    ...EarthShieldCore.dependencies,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  protected cooldownThroughputTracker!: CooldownThroughputTracker;
  prepullApplication = false;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL), this.earthShieldPrepullCheck);
  }

  earthShieldPrepullCheck(event: ApplyBuffEvent) {
    if (event.prepull) {
      this.prepullApplication = true;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: .9,
        average: .85,
        major: .8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsPrepull() {
    return {
      actual: this.prepullApplication,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  getFeeding() {
    return this.cooldownThroughputTracker.getIndirectHealing(SPELLS.EARTH_SHIELD_HEAL.id);
  }
}

export default EarthShield;
