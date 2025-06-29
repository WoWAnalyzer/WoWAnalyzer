import { defineMessage } from '@lingui/core/macro';
import RageTracker from 'analysis/retail/warrior/shared/modules/core/RageTracker';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_WARRIOR } from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from '../features/SpellUsable';

import { addInefficientCastReason } from 'parser/core/EventMetaLib';

class Whirlwind extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    rageTracker: RageTracker,
  };

  wwCast = 0;
  badWWCast = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.WHIRLWIND_FURY_CAST, SPELLS.THUNDER_CLAP]),
      this.onCast,
    );
  }

  get threshold() {
    return this.badWWCast / this.wwCast;
  }

  get suggestionThresholds() {
    return {
      actual: this.threshold,
      isGreaterThan: {
        minor: 0.05,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onCast(event: CastEvent) {
    this.wwCast += 1;

    const wwBuffStacks = this.selectedCombatant.getBuffStacks(SPELLS.WHIRLWIND_BUFF);

    if (wwBuffStacks > 0) {
      this.badWWCast += 1;
      addInefficientCastReason(
        event,
        'Not all stacks of the Whirlwind buff were used before refreshing stacks',
      );
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to only cast <SpellLink spell={SPELLS.WHIRLWIND_FURY_CAST} /> when you have already
          used all of your stacks of the{' '}
          <SpellLink spell={TALENTS_WARRIOR.IMPROVED_WHIRLWIND_TALENT} /> buff.{' '}
          <SpellLink spell={SPELLS.WHIRLWIND_FURY_CAST} /> does very little damage by itself, so you
          don't want to use it more than you have to.
        </>,
      )
        .icon(SPELLS.WHIRLWIND.icon)
        .actual(
          defineMessage({
            id: 'warrior.fury.suggestions.whirlwind.badCasts',
            message: `${formatPercentage(actual)}% of Whirlwind casts were early`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default Whirlwind;
