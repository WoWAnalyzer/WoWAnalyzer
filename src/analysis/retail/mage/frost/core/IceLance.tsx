import { Trans } from '@lingui/macro';
import { MS_BUFFER_100, SHATTER_DEBUFFS } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, ChangeBuffStackEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class IceLance extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    abilityTracker: AbilityTracker,
    eventHistory: EventHistory,
    spellUsable: SpellUsable,
  };
  protected enemies!: Enemies;
  protected abilityTracker!: AbilityTracker;
  protected eventHistory!: EventHistory;
  protected spellUsable!: SpellUsable;

  hadFingersProc = false;
  iceLanceTargetId = '';
  nonShatteredCasts = 0;

  iceLanceCastTimestamp = 0;
  totalFingersProcs = 0;
  overwrittenFingersProcs = 0;
  expiredFingersProcs = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ICE_LANCE_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ICE_LANCE_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FINGERS_OF_FROST_BUFF),
      this.onFingersStackChange,
    );
  }

  onCast(event: CastEvent) {
    this.iceLanceCastTimestamp = event.timestamp;
    if (event.targetID) {
      this.iceLanceTargetId = encodeTargetString(event.targetID, event.targetInstance);
    }
    this.hadFingersProc = false;
    if (this.selectedCombatant.hasBuff(SPELLS.FINGERS_OF_FROST_BUFF.id)) {
      this.hadFingersProc = true;
    }
  }

  onDamage(event: DamageEvent) {
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if (this.iceLanceTargetId !== damageTarget) {
      return;
    }

    const enemy = this.enemies.getEntity(event);
    if (
      enemy &&
      !SHATTER_DEBUFFS.some((effect) => enemy.hasBuff(effect.id, event.timestamp)) &&
      !this.hadFingersProc
    ) {
      this.nonShatteredCasts += 1;
    }
  }

  onFingersStackChange(event: ChangeBuffStackEvent) {
    // FoF overcaps don't show as a refreshbuff, instead they are a stack lost followed immediately by a gain
    const stackChange = event.stacksGained;
    if (stackChange > 0) {
      this.totalFingersProcs += stackChange;
    } else if (
      this.iceLanceCastTimestamp &&
      this.iceLanceCastTimestamp + MS_BUFFER_100 > event.timestamp
    ) {
      // just cast ice lance, so this stack removal probably a proc used
    } else if (event.newStacks === 0) {
      this.expiredFingersProcs += -stackChange; // stacks zero out, must be expiration
    } else {
      this.overwrittenFingersProcs += -stackChange; // stacks don't zero, this is an overwrite
    }
  }

  get wastedFingersProcs() {
    return this.expiredFingersProcs + this.overwrittenFingersProcs;
  }

  get usedFingersProcs() {
    return this.totalFingersProcs - this.wastedFingersProcs;
  }

  get shatteredPercent() {
    return (
      1 - this.nonShatteredCasts / this.abilityTracker.getAbility(TALENTS.ICE_LANCE_TALENT.id).casts
    );
  }

  get fingersProcUtilizationThresholds() {
    return {
      actual: 1 - this.wastedFingersProcs / this.totalFingersProcs || 0,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get nonShatteredIceLanceThresholds() {
    return {
      actual:
        this.nonShatteredCasts / this.abilityTracker.getAbility(TALENTS.ICE_LANCE_TALENT.id).casts,
      isGreaterThan: {
        minor: 0.05,
        average: 0.15,
        major: 0.25,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.nonShatteredIceLanceThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={TALENTS.ICE_LANCE_TALENT.id} /> {this.nonShatteredCasts} times (
          {formatPercentage(actual)}%) without <SpellLink id={TALENTS.SHATTER_TALENT.id} />. Make
          sure that you are only casting Ice Lance when the target has{' '}
          <SpellLink id={SPELLS.WINTERS_CHILL.id} /> (or other Shatter effects), if you have a{' '}
          <SpellLink id={TALENTS.FINGERS_OF_FROST_TALENT.id} /> proc, or if you are moving and you
          cant cast anything else.
        </>,
      )
        .icon(TALENTS.ICE_LANCE_TALENT.icon)
        .actual(
          <Trans id="mage.frost.suggestions.iceLance.nonShatterCasts">
            {formatPercentage(actual)}% missed
          </Trans>,
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip="This is the percentage of Ice Lance casts that were shattered. The only time it is acceptable to cast Ice Lance without Shatter is if you are moving and you cant use anything else."
      >
        <BoringSpellValueText spellId={TALENTS.ICE_LANCE_TALENT.id}>
          {`${formatPercentage(this.shatteredPercent, 0)}%`} <small>Casts shattered</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default IceLance;
