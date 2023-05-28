import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent, ApplyBuffEvent, ApplyBuffStackEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class MunchedProcs extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
    eventHistory: EventHistory,
  };
  protected abilityTracker!: AbilityTracker;
  protected eventHistory!: EventHistory;
  protected enemies!: Enemies;

  munchedProcs = 0;
  totalFingersProcs = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ICE_LANCE_DAMAGE),
      this.onIceLanceDamage,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FINGERS_OF_FROST_BUFF),
      this.onFingersProc,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.FINGERS_OF_FROST_BUFF),
      this.onFingersProc,
    );
  }

  onIceLanceDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
      return;
    }

    const iceLanceCast = this.eventHistory.last(
      1,
      undefined,
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ICE_LANCE_TALENT),
    )[0];
    if (this.selectedCombatant.hasBuff(SPELLS.FINGERS_OF_FROST_BUFF.id, iceLanceCast.timestamp)) {
      this.munchedProcs += 1;
    }
  }

  onFingersProc(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.totalFingersProcs += 1;
  }

  get munchedPercent() {
    return this.munchedProcs / this.totalFingersProcs;
  }

  get munchedProcsThresholds() {
    return {
      actual: this.munchedPercent,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.munchedProcsThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You wasted (munched) {this.munchedProcs}{' '}
          <SpellLink id={TALENTS.FINGERS_OF_FROST_TALENT.id} /> procs (
          {formatPercentage(this.munchedPercent)} of total procs). Because of the way{' '}
          <SpellLink id={TALENTS.FINGERS_OF_FROST_TALENT.id} /> works, this is sometimes unavoidable
          (i.e. you get a proc while you are using a{' '}
          <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> proc), but if you have both a{' '}
          <SpellLink id={TALENTS.BRAIN_FREEZE_TALENT.id} /> proc and a{' '}
          <SpellLink id={TALENTS.FINGERS_OF_FROST_TALENT.id} /> proc, you should make sure you use
          the <SpellLink id={TALENTS.FINGERS_OF_FROST_TALENT.id} /> procs first before you start
          casting <SpellLink id={SPELLS.FROSTBOLT.id} /> and{' '}
          <SpellLink id={TALENTS.FLURRY_TALENT.id} /> to minimize the number of wasted/munched
          procs.
        </>,
      )
        .icon(TALENTS.FINGERS_OF_FROST_TALENT.icon)
        .actual(
          <Trans id="mage.frost.suggestions.munchedProcs">
            {formatPercentage(actual)}% procs wasted
          </Trans>,
        )
        .recommended(formatPercentage(recommended)),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={
          <>
            "Munching" a proc refers to a situation where you have a Fingers of Frost proc at the
            same time that Winters Chill is on the target. This essentially leads to a wasted
            Fingers of Frost proc since Fingers of Frost and Winter's Chill both do the same thing,
            and casting Ice Lance will remove both a Fingers of Frost proc and a stack of Winter's
            Chill. This is sometimes unavoidable, but if you have both a Fingers of Frost proc and a
            Brain Freeze proc, you can minimize this by ensuring that you use the Fingers of Frost
            procs first before you start casting Frostbolt and Flurry to use the Brain Freeze proc.
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.FINGERS_OF_FROST_TALENT.id}>
          {formatPercentage(this.munchedPercent, 0)}% <small>Munched Fingers of Frost procs</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MunchedProcs;
