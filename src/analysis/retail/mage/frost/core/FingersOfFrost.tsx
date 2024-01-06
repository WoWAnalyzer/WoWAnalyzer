import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  CastEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  ApplyBuffStackEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SHATTER_DEBUFFS } from '../../shared';

class FingersOfFrost extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  fingers: {
    apply: ApplyBuffEvent | ApplyBuffStackEvent;
    remove: RemoveBuffEvent | undefined;
    spender: CastEvent | undefined;
    expired: boolean;
    munched: boolean;
    spendDelay: number | undefined;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FINGERS_OF_FROST_BUFF),
      this.onFingersProc,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.FINGERS_OF_FROST_BUFF),
      this.onFingersProc,
    );
  }

  onFingersProc(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    const remove: RemoveBuffEvent | undefined = GetRelatedEvent(event, 'BuffRemove');
    const spender: CastEvent | undefined = remove && GetRelatedEvent(remove, 'SpellCast');
    const damage: DamageEvent | undefined = spender && GetRelatedEvent(spender, 'SpellDamage');
    const enemy = damage && this.enemies.getEntity(damage);
    this.fingers.push({
      apply: event,
      remove: remove,
      spender: spender,
      expired: !spender,
      munched:
        SHATTER_DEBUFFS.some((effect) => enemy?.hasBuff(effect.id, damage?.timestamp)) || false,
      spendDelay: spender && spender.timestamp - event.timestamp,
    });
  }

  get expiredProcs() {
    return this.fingers.filter((f) => f.expired).length;
  }

  get averageSpendDelaySeconds() {
    let spendDelay = 0;
    this.fingers.forEach((f) => f.spendDelay && (spendDelay += f.spendDelay));
    return spendDelay / this.fingers.filter((f) => f.spendDelay).length / 1000;
  }

  get usedFingersProcs() {
    return this.totalProcs - this.expiredProcs;
  }

  get munchedProcs() {
    return this.fingers.filter((f) => f.munched).length;
  }

  get totalProcs() {
    return this.fingers.length;
  }

  get munchedPercent() {
    return this.munchedProcs / this.totalProcs;
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

  get fingersProcUtilizationThresholds() {
    return {
      actual: 1 - this.expiredProcs / this.totalProcs || 0,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.munchedProcsThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You wasted (munched) {this.munchedProcs}{' '}
          <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} /> procs (
          {formatPercentage(this.munchedPercent)}% of total procs). Because of the way{' '}
          <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} /> works, this is sometimes unavoidable
          (i.e. you get a proc while you are using a{' '}
          <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} /> proc), but if you have both a{' '}
          <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} /> proc and a{' '}
          <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} /> proc, you should make sure you use
          the <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} /> procs first before you start
          casting <SpellLink spell={SPELLS.FROSTBOLT} /> and{' '}
          <SpellLink spell={TALENTS.FLURRY_TALENT} /> to minimize the number of wasted/munched
          procs.
        </>,
      )
        .icon(TALENTS.FINGERS_OF_FROST_TALENT.icon)
        .actual(`${formatPercentage(actual)}% procs wasted`)
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
        <BoringSpellValueText spell={TALENTS.FINGERS_OF_FROST_TALENT}>
          {formatPercentage(this.munchedPercent, 0)}% <small>Munched Fingers of Frost procs</small>
          <br />
          {formatNumber(this.averageSpendDelaySeconds)}s <small>Avg. delay to spend procs</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FingersOfFrost;
