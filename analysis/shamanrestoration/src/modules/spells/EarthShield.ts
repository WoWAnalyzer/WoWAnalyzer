import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';

import { EarthShield as EarthShieldCore } from '@wowanalyzer/shaman';

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

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_TALENT),
      this.earthShieldPrepullCheck,
    );
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
        minor: 0.9,
        average: 0.85,
        major: 0.8,
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
}

export default EarthShield;
