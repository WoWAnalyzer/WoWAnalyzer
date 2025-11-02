import { ComboPointTracker } from 'analysis/retail/rogue/shared';
import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';

class ComboPoints extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };

  protected comboPointTracker!: ComboPointTracker;

  get comboPointThresholds() {
    return {
      actual: this.comboPointTracker.wasted / this.comboPointTracker.generated,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.15,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  makeExtraSuggestion(spell: Spell) {
    return (
      <>
        Avoid wasting combo points when casting <SpellLink spell={spell} />{' '}
      </>
    );
  }
}

export default ComboPoints;
