import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class SteadyShot extends Analyzer {
  effectiveFocusGain = 0;
  focusWasted = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.STEADY_SHOT_FOCUS),
      this.onEnergize,
    );
  }

  onEnergize(event: ResourceChangeEvent) {
    this.effectiveFocusGain += event.resourceChange - event.waste;
    this.focusWasted += event.waste;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(2)} size="flexible">
        <BoringSpellValueText spell={SPELLS.STEADY_SHOT}>
          <>
            {this.effectiveFocusGain}/{this.focusWasted + this.effectiveFocusGain}{' '}
            <small>possible focus gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SteadyShot;
