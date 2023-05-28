import {
  STEADY_SHOT_FOCUS_REGEN,
  TRUESHOT_FOCUS_INCREASE,
} from 'analysis/retail/hunter/marksmanship/constants';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class SteadyShot extends Analyzer {
  effectiveFocusGain = 0;
  focusWasted = 0;
  additionalFocusFromTrueshot = 0;
  possibleAdditionalFocusFromTrueshot = 0;

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
    const hasTrueshot = this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id);
    if (hasTrueshot) {
      this.additionalFocusFromTrueshot +=
        event.resourceChange * (1 - 1 / (1 + TRUESHOT_FOCUS_INCREASE)) -
        Math.max(event.waste - STEADY_SHOT_FOCUS_REGEN, 0);
      this.possibleAdditionalFocusFromTrueshot += STEADY_SHOT_FOCUS_REGEN * TRUESHOT_FOCUS_INCREASE;
    }
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(2)} size="flexible">
        <BoringSpellValueText spellId={SPELLS.STEADY_SHOT.id}>
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
