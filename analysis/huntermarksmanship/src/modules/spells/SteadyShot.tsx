import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EnergizeEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { STEADY_SHOT_FOCUS_REGEN, TRUESHOT_FOCUS_INCREASE } from '@wowanalyzer/hunter-marksmanship/src/constants';
import { NESINGWARY_FOCUS_GAIN_MULTIPLIER } from '@wowanalyzer/hunter';

class SteadyShot extends Analyzer {

  effectiveFocusGain = 0;
  focusWasted = 0;
  additionalFocusFromTrueshot = 0;
  possibleAdditionalFocusFromTrueshot = 0;
  additionalFocusFromNesingwary = 0;
  possibleAdditionalFocusFromNesingwary = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.STEADY_SHOT_FOCUS), this.onEnergize);
  }

  onEnergize(event: EnergizeEvent) {
    this.effectiveFocusGain += event.resourceChange - event.waste;
    this.focusWasted += event.waste;
    const hasTrueshot = this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id);
    const hasNesingwary = this.selectedCombatant.hasBuff(SPELLS.NESINGWARYS_TRAPPING_APPARATUS_ENERGIZE.id);
    if (hasTrueshot) {
      this.additionalFocusFromTrueshot += event.resourceChange * (1 - 1 / (1 + TRUESHOT_FOCUS_INCREASE)) - Math.max(event.waste - (STEADY_SHOT_FOCUS_REGEN * (hasNesingwary ? NESINGWARY_FOCUS_GAIN_MULTIPLIER : 1)), 0);
      this.possibleAdditionalFocusFromTrueshot += STEADY_SHOT_FOCUS_REGEN * TRUESHOT_FOCUS_INCREASE * (hasNesingwary ? NESINGWARY_FOCUS_GAIN_MULTIPLIER : 1);
    }
    if (hasNesingwary) {
      this.additionalFocusFromNesingwary += event.resourceChange * (1 - 1 / NESINGWARY_FOCUS_GAIN_MULTIPLIER) - Math.max(event.waste - (STEADY_SHOT_FOCUS_REGEN * (hasTrueshot ? (1 + TRUESHOT_FOCUS_INCREASE) : 1)), 0);
      this.possibleAdditionalFocusFromNesingwary += STEADY_SHOT_FOCUS_REGEN * (hasTrueshot ? (1 + TRUESHOT_FOCUS_INCREASE) : 1);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.STEADY_SHOT}>
          <>
            {this.effectiveFocusGain}/{this.focusWasted + this.effectiveFocusGain} <small>possible focus gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default SteadyShot;
