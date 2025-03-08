import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import SpellUsable from '../features/SpellUsable';
import ExecuteRangeTracker from './Execute/ExecuteRange';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

interface CurrentCast {
  event: CastEvent | null;
  enemiesHit: string[];
  text: string | null;
}

const AVATAR_FORGIVENESS = 5000; // Milliseconds
const WARBREAKER_FORGIVENESS = 5000;

class Bladestorm extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    executeRange: ExecuteRangeTracker,
  };

  protected spellUsable!: SpellUsable;
  protected executeRange!: ExecuteRangeTracker;

  badCasts: number = 0;
  totalCasts: number = 0;

  currentCast: CurrentCast = {
    event: null,
    enemiesHit: [],
    text: null,
  };

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLADESTORM),
      this._onBladestormCast,
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.badCasts / this.totalCasts,
      isGreaterThan: {
        minor: 0,
        average: 0.1,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  _onBladestormCast(event: CastEvent) {
    this.totalCasts += 1;

    // Set the current cast
    this.currentCast = {
      event: event,
      enemiesHit: [],
      text: null,
    };

    this.wasValidBladestorm();
  }

  wasValidBladestorm() {
    if (this.currentCast.event === null) {
      return;
    }

    let badCast = false;
    badCast = this.checkColossusSmashAvailable();
    badCast = badCast || this.checkAvatarAvailable();

    if (badCast) {
      this.badCasts += 1;
      addInefficientCastReason(this.currentCast.event, this.currentCast.text);
    }
  }

  checkColossusSmashAvailable(): boolean {
    const warbreakerTalented = this.selectedCombatant.hasTalent(TALENTS.WARBREAKER_TALENT);
    const remainingCooldown = warbreakerTalented
      ? this.spellUsable.cooldownRemaining(TALENTS.WARBREAKER_TALENT.id)
      : this.spellUsable.cooldownRemaining(SPELLS.COLOSSUS_SMASH.id);

    const aligned = remainingCooldown < WARBREAKER_FORGIVENESS;
    if (aligned && !this.currentCast.text) {
      this.currentCast.text =
        'Bladestorm was used while you had Colossus Smash/Warbreaker available or about to become available.';
    }
    return aligned;
  }

  checkAvatarAvailable(): boolean {
    const remainingCooldown = this.spellUsable.cooldownRemaining(SPELLS.AVATAR_SHARED.id);

    const aligned = remainingCooldown < AVATAR_FORGIVENESS;
    if (aligned && !this.currentCast.text) {
      this.currentCast.text =
        'Bladestorm was used while you had Avatar available or about to become available.';
    }
    return aligned;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          It is worth delaying your <SpellLink spell={SPELLS.BLADESTORM} /> for up to 5 seconds to
          align with cooldowns such as <SpellLink spell={TALENTS.AVATAR_TALENT} /> and{' '}
          <SpellLink spell={SPELLS.COLOSSUS_SMASH} />, but it otherwise should be used as often as
          possible.
        </>,
      )
        .icon(SPELLS.BLADESTORM.icon)
        .actual(
          defineMessage({
            id: 'warrior.arms.suggestions.bladestorm.efficiency',
            message: `Bladestorm was used incorrectly  ${formatPercentage(actual)}% of the time.`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default Bladestorm;
