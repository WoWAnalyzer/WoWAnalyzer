import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { EndChannelEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import SpellUsable from '../features/SpellUsable';
import ExecuteRangeTracker from './Execute/ExecuteRange';

interface CurrentCast {
  event: CastEvent | null;
  enemiesHit: string[];
  text: string | null;
}

const RAGE_STARVED_AMOUNT = 50;
const AVATAR_FORGIVENESS = 4000; // Milliseconds
const WARBREAKER_FOREGIVENESS = 4000;
const SWEEPING_STRIKES_FORGIVENESS = 2000;

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

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLADESTORM_DAMAGE),
      this._onBladestormDamage,
    );

    this.addEventListener(
      Events.EndChannel.by(SELECTED_PLAYER).spell(SPELLS.BLADESTORM),
      this._onBladestormEnd,
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.badCasts / this.totalCasts,
      isGreaterThan: {
        minor: 0,
        average: 0.2,
        major: 0.5,
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
  }

  _onBladestormDamage(event: DamageEvent) {
    const enemy = `${event.targetID} ${event.targetInstance || 0}`;

    if (!this.currentCast.enemiesHit.includes(enemy)) {
      this.currentCast.enemiesHit.push(enemy);
    }
  }

  _onBladestormEnd(event: EndChannelEvent) {
    this.wasValidBladestorm();
  }

  wasValidBladestorm() {
    if (this.currentCast.enemiesHit.length > 1) {
      this.checkMultiTargetRequirements();
    } else {
      this.checkSingleTargetRequirements();
    }
  }

  checkSingleTargetRequirements() {
    if (!this.currentCast.event) {
      return;
    }

    // Bladestorm should only be used when rage starved
    const rage =
      this.currentCast.event.classResources &&
      this.currentCast.event.classResources.find((e) => e.type === RESOURCE_TYPES.RAGE.id);
    if (rage && rage.amount > RAGE_STARVED_AMOUNT) {
      this.badCasts += 1;
      this.currentCast.event.meta = this.currentCast.event.meta || {};
      this.currentCast.event.meta.isInefficientCast = true;
      this.currentCast.event.meta.inefficientCastReason =
        'Bladestorm was used while you still had rage to use on higher priority abilities during a single target situation';
    }
  }

  checkMultiTargetRequirements() {
    if (this.currentCast.event === null) {
      return;
    }

    let badCast = false;

    // Bladestorm shouldn't overlap with Sweeping Strikes
    const sweepingStrikesBuff = this.selectedCombatant.getBuff(
      SPELLS.SWEEPING_STRIKES.id,
      this.currentCast.event.timestamp,
    );
    if (sweepingStrikesBuff && sweepingStrikesBuff.end) {
      badCast =
        sweepingStrikesBuff.end - this.currentCast.event.timestamp < SWEEPING_STRIKES_FORGIVENESS;
    }

    if (badCast && !this.currentCast.text) {
      this.currentCast.text =
        'Since Bladestorm does not benefit from Sweeping Strikes, you should not have both up at the same time during mutli-target situations.';
    }

    // Bladestorm should be aligned with Warbreaker
    badCast =
      badCast ||
      (this.selectedCombatant.hasTalent(TALENTS.WARBREAKER_TALENT) &&
        this.spellUsable.isAvailable(TALENTS.WARBREAKER_TALENT.id)) ||
      this.spellUsable.cooldownRemaining(TALENTS.WARBREAKER_TALENT.id) < WARBREAKER_FOREGIVENESS;

    if (badCast && !this.currentCast.text) {
      this.currentCast.text =
        'Bladestorm was used while you had Warbreaker available or about to become available in a multi-target situation.';
    }

    // Bladestorm should be aligned with Avatar
    badCast =
      badCast ||
      (this.selectedCombatant.hasTalent(TALENTS.AVATAR_TALENT) &&
        this.spellUsable.isAvailable(TALENTS.AVATAR_TALENT.id)) ||
      this.spellUsable.cooldownRemaining(TALENTS.AVATAR_TALENT.id) < AVATAR_FORGIVENESS;

    if (badCast && !this.currentCast.text) {
      this.currentCast.text =
        'Bladestorm was used while you had Avatar available or about to become available in a multi-target situation.';
    }

    if (badCast) {
      this.badCasts += 1;
      this.currentCast.event.meta = this.currentCast.event.meta || {};
      this.currentCast.event.meta.isInefficientCast = true;
      this.currentCast.event.meta.inefficientCastReason = this.currentCast.text;
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Do not cast <SpellLink id={SPELLS.BLADESTORM.id} /> when you have rage to spend during
          single target fights. In multi-target situations, Bladestorm should not overlap with{' '}
          <SpellLink id={SPELLS.SWEEPING_STRIKES.id} /> and you should try to align Bladestorm with
          cooldowns such as <SpellLink id={TALENTS.AVATAR_TALENT.id} /> and{' '}
          <SpellLink id={TALENTS.WARBREAKER_TALENT.id} />
        </>,
      )
        .icon(SPELLS.BLADESTORM.icon)
        .actual(
          t({
            id: 'warrior.arms.suggestions.bladestorm.efficiency',
            message: `Bladestorm was used incorrectly  ${formatPercentage(actual)}% of the time.`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default Bladestorm;
