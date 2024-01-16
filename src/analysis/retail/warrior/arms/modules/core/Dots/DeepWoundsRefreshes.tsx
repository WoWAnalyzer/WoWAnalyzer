import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EarlyDotRefreshesCore from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshes';
import Enemies from 'parser/shared/modules/Enemies';

import ExecuteRangeTracker from '../Execute/ExecuteRange';

const DOTS = [
  {
    name: 'Deepwounds',
    debuffId: SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF.id,
    castId: SPELLS.MORTAL_STRIKE.id,
    duration: 12000,
  },
];

const MINOR_THRESHOLD = 0.9;
const AVERAGE_THRESHOLD = 0.8;
const MAJOR_THRESHOLD = 0.6;

class EarlyDotRefresh extends EarlyDotRefreshesCore {
  get suggestionThresholdsDeepwoundsEfficiency() {
    return {
      spell: SPELLS.MORTAL_STRIKE,
      count: this.casts[DOTS[0].castId].badCasts,
      wastedDuration: this.casts[DOTS[0].castId].wastedDuration,
      actual: this.badCastsEffectivePercent(DOTS[0].castId),
      isLessThan: {
        minor: MINOR_THRESHOLD,
        average: AVERAGE_THRESHOLD,
        major: MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    ...EarlyDotRefreshesCore.dependencies,
    enemies: Enemies,
    abilityTracker: AbilityTracker,
    executeRange: ExecuteRangeTracker,
  };

  protected executeRange!: ExecuteRangeTracker;

  static dots = DOTS;

  isLastCastBad(event: CastEvent) {
    const dot = this.getDotByCast(event.ability.guid);
    if (!dot) {
      return;
    }

    // Refreshes from Colossus Smash/Warbreaker/Bladestorm dont count against you
    if (
      dot.castId === SPELLS.BLADESTORM.id ||
      dot.castId === TALENTS.WARBREAKER_TALENT.id ||
      dot.castId === SPELLS.COLOSSUS_SMASH.id
    ) {
      this.lastCastGoodExtension = true;
    }

    // We only check if Mortal Strike has been cast during the execution phase.
    // With Enduring Blow, this Mortal Strike is acceptable during execution phase with two stacks of Overpower.
    if (
      dot &&
      dot.castId === SPELLS.MORTAL_STRIKE.id &&
      (!this.executeRange.isTargetInExecuteRange(event.targetID || 0, event.targetInstance || 0) ||
        (this.executeRange.isTargetInExecuteRange(event.targetID || 0, event.targetInstance || 0) &&
          false &&
          this.hasTwoOverpowerStacks()))
    ) {
      this.lastCastGoodExtension = true;
    }
  }

  hasTwoOverpowerStacks() {
    const overpower = this.selectedCombatant.getBuff(SPELLS.OVERPOWER.id);
    if (overpower && overpower.stacks !== 2) {
      return false;
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholdsDeepwoundsEfficiency).addSuggestion(
      (suggest, actual, recommended) =>
        suggest(
          <>
            You refreshed <SpellLink spell={SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF} icon /> early{' '}
            {this.suggestionThresholdsDeepwoundsEfficiency.count} times on a target in{' '}
            <SpellLink spell={SPELLS.EXECUTE} icon /> range. Try to prioritize{' '}
            <SpellLink spell={SPELLS.EXECUTE} icon /> as it deals more damage than{' '}
            <SpellLink spell={SPELLS.MORTAL_STRIKE} icon /> unless you have the
            <SpellLink spell={SPELLS.OVERPOWER} icon />.
          </>,
        )
          .icon(SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF.icon)
          .actual(
            defineMessage({
              id: 'shared.suggestions.dots.badDeepWoundsRefreshes',
              message: `${formatPercentage(actual)}% of good Deep Wounds refreshes.`,
            }),
          )
          .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default EarlyDotRefresh;
