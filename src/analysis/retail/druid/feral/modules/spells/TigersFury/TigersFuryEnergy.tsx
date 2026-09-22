import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';

import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';

class TigersFuryEnergy extends Analyzer {
  energyGenerated = 0;
  energyWasted = 0;
  energyTotal = 0;

  energyGeneratedNoConvoke = 0;
  energyWastedNoConvoke = 0;
  energyTotalNoConvoke = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.TIGERS_FURY),
      this.onTigersFuryEnergize,
    );
  }

  onTigersFuryEnergize(event: ResourceChangeEvent) {
    const total = event.resourceChange;
    const waste = event.waste;

    this.energyGenerated += total - waste;
    this.energyWasted += waste;
    this.energyTotal += total;

    if (!isConvoking(this.selectedCombatant)) {
      this.energyGeneratedNoConvoke += total - waste;
      this.energyWastedNoConvoke += waste;
      this.energyTotalNoConvoke += total;
    }
  }

  get percentWastedNoConvoke() {
    return this.energyWastedNoConvoke / this.energyTotalNoConvoke || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentWastedNoConvoke,
      isGreaterThan: {
        minor: 0,
        average: 0.1,
        major: 0.25,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default TigersFuryEnergy;
