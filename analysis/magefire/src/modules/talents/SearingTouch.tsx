import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { SEARING_TOUCH_THRESHOLD, COMBUSTION_END_BUFFER } from '@wowanalyzer/mage';

export const DAMAGE_MODIFIER = 1.5;

const debug = false;

class SearingTouch extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;
  lastCastEvent?: CastEvent;

  fireballExecuteCasts = 0;
  totalNonExecuteCasts = 0;
  totalExecuteCasts = 0;
  healthPercent = 1;
  nonExecuteScorchCasts = 0;
  combustionEnded = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SEARING_TOUCH_TALENT.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.FIREBALL, SPELLS.SCORCH]),
      this.onCast,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.FIREBALL, SPELLS.SCORCH, SPELLS.PYROBLAST, SPELLS.FIRE_BLAST]),
      this.onDamage,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION),
      this.onCombustionEnd,
    );
  }

  onCast(event: CastEvent) {
    this.lastCastEvent = event;
  }

  onCombustionEnd(event: RemoveBuffEvent) {
    this.combustionEnded = event.timestamp;
  }

  //When the target is under 30% health, check to see if the player cast Fireball. If they do, count it as a mistake.
  onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (event.hitPoints && event.maxHitPoints && event.hitPoints > 0) {
      this.healthPercent = event.hitPoints / event.maxHitPoints;
      this.healthPercent < SEARING_TOUCH_THRESHOLD
        ? (this.totalExecuteCasts += 1)
        : (this.totalNonExecuteCasts += 1);
    }

    if (
      spellId === SPELLS.SCORCH.id &&
      this.healthPercent > SEARING_TOUCH_THRESHOLD &&
      !this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id) &&
      event.timestamp > this.combustionEnded + COMBUSTION_END_BUFFER
    ) {
      this.nonExecuteScorchCasts += 1;
    } else if (spellId === SPELLS.FIREBALL.id && this.healthPercent < SEARING_TOUCH_THRESHOLD) {
      this.fireballExecuteCasts += 1;
      if (this.lastCastEvent) {
        this.lastCastEvent.meta = this.lastCastEvent.meta || {};
        this.lastCastEvent.meta.isInefficientCast = true;
        this.lastCastEvent.meta.inefficientCastReason = `This Fireball was cast while the target was under ${formatPercentage(
          SEARING_TOUCH_THRESHOLD,
        )}% health. While talented into Searing Touch, ensure that you are casting Scorch instead of Fireball while the target is under 30% health since Scorch does ${formatPercentage(
          DAMAGE_MODIFIER,
        )}% additional damage.`;
        debug && this.log('Cast Fireball under 30% Health');
      }
    }
  }

  get executeUtil() {
    return 1 - this.fireballExecuteCasts / this.totalExecuteCasts;
  }

  get nonExecuteUtil() {
    return 1 - this.nonExecuteScorchCasts / this.totalNonExecuteCasts;
  }

  get executeSuggestionThreshold() {
    return {
      actual: this.executeUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get nonExecuteSuggestionThreshold() {
    return {
      actual: this.nonExecuteUtil,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.executeSuggestionThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={SPELLS.FIREBALL.id} /> instead of{' '}
          <SpellLink id={SPELLS.SCORCH.id} /> while the target was under 30% health{' '}
          {this.fireballExecuteCasts} times. When using{' '}
          <SpellLink id={SPELLS.SEARING_TOUCH_TALENT.id} /> always use Scorch instead of Fireball
          when the target is under 30% health since Scorch does 150% damage and is guaranteed to
          crit.
        </>,
      )
        .icon(SPELLS.SEARING_TOUCH_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.searingTouch.executeCasts">
            {formatPercentage(this.executeUtil)}% Utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)} is recommended`),
    );
    when(this.nonExecuteSuggestionThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={SPELLS.SCORCH.id} /> while the target was over 30% health{' '}
          {this.nonExecuteScorchCasts} times. While this is acceptable when you need to move, you
          should aim to minimize this by limiting your movement and using spells like{' '}
          <SpellLink id={SPELLS.BLINK.id} /> (or <SpellLink id={SPELLS.SHIMMER_TALENT.id} />) when
          possible or by using your instant abilities and procs.
        </>,
      )
        .icon(SPELLS.SEARING_TOUCH_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.searingTouch.nonExecuteScorchCasts">
            {formatPercentage(this.nonExecuteUtil)}% Utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            When the target is under 30% health, you should cast Scorch as your filler ability
            instead of Fireball so that you can take advantage of the damage buff that gets applied
            to Scorch. You cast Fireball instead of Scorch {this.fireballExecuteCasts} times.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.SEARING_TOUCH_TALENT.id}>
          <>
            {formatPercentage(this.executeUtil, 0)}% <small>Execute Utilization</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SearingTouch;
