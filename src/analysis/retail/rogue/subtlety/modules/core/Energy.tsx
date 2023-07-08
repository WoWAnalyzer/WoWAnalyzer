import { EnergyTracker, EnergyCapTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import resourceSuggest from 'parser/shared/modules/resources/resourcetracker/ResourceSuggest';

class Energy extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
    energyCapTracker: EnergyCapTracker,
  };

  protected energyTracker!: EnergyTracker;
  protected energyCapTracker!: EnergyCapTracker;

  get energyThresholds() {
    return {
      actual: this.energyTracker.wasted / this.energyTracker.generated,
      isGreaterThan: {
        minor: 0.033,
        average: 0.066,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    resourceSuggest(when, this.energyTracker, {
      spell: SPELLS.SYMBOLS_OF_DEATH,
      minor: 0.1,
      avg: 0.2,
      major: 0.5,
      extraSuggestion: (
        <>
          Try to spend energy before using <SpellLink spell={SPELLS.SYMBOLS_OF_DEATH} />, but do not
          delay it to avoid waste!{' '}
        </>
      ),
    });

    resourceSuggest(when, this.energyTracker, {
      spell: SPELLS.RELENTLESS_STRIKES,
      minor: 0.15,
      avg: 0.25,
      major: 0.4,
      extraSuggestion: (
        <>
          {' '}
          You are wasting more energy then normal. You may be pooling too much energy or not casting
          enough spenders.{' '}
        </>
      ),
    });
  }
}

export default Energy;
