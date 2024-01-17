import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  ApplyDebuffEvent,
  RemoveDebuffEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';
import Enemies from 'parser/shared/modules/Enemies';
import { highlightInefficientCast } from 'interface/report/Results/Timeline/Casts';

const TOUCH_OF_THE_MAGI_DURATION_SEC = 12;

class TouchOfTheMagi extends Analyzer {
  static dependencies = {
    chargeTracker: ArcaneChargeTracker,
    enemies: Enemies,
  };
  protected chargeTracker!: ArcaneChargeTracker;
  protected enemies!: Enemies;

  hasRadiantSpark: boolean = this.selectedCombatant.hasTalent(TALENTS.RADIANT_SPARK_TALENT);
  hasTouchOfTheMagi: boolean = this.selectedCombatant.hasTalent(TALENTS.TOUCH_OF_THE_MAGI_TALENT);

  touch: {
    cast: CastEvent;
    charges: number;
    debuffApply: ApplyDebuffEvent | undefined;
    debuffRemove: RemoveDebuffEvent | undefined;
    duringSpark: boolean;
    sparkRemoved: number | undefined;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.hasRadiantSpark && this.hasTouchOfTheMagi;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.TOUCH_OF_THE_MAGI_TALENT),
      this.onTouch,
    );
  }

  onTouch(event: CastEvent) {
    const debuffApply: ApplyDebuffEvent | undefined = GetRelatedEvent(event, 'DebuffApply');
    const debuffRemove: RemoveDebuffEvent | undefined = GetRelatedEvent(event, 'DebuffRemove');
    const enemy = debuffApply && this.enemies.getEntity(debuffApply);
    const sparkRemoved: RemoveDebuffEvent | undefined = GetRelatedEvent(event, 'SparkRemoved');

    this.touch.push({
      cast: event,
      charges: this.chargeTracker.charges,
      debuffApply: debuffApply,
      debuffRemove: debuffRemove,
      duringSpark: enemy && enemy.hasBuff(TALENTS.RADIANT_SPARK_TALENT.id) ? true : false,
      sparkRemoved: sparkRemoved?.timestamp || undefined,
    });
  }

  badCasts = () => {
    //Count the number of casts that were bad
    let badCasts = 0;
    this.touch.forEach((t) => {
      if (t.charges !== 0 || !t.duringSpark) {
        badCasts += 1;
      }
    });

    //Get the number of casts where the player did not have 0 Arcane Charges
    //Highlight the timeline
    const chargesTooltip =
      'Touch of the Magi was cast without clearing your Arcane Charges. Touch of the Magi gives you 4 charges instantly, so use Barrage to clear your charges and then Touch of the Magi while Barrage is in the air to refresh your charges.';
    this.hasCharges.forEach((b) => highlightInefficientCast(b.cast, chargesTooltip));

    //Get the number of casts that were not cast into Radiant Spark
    //Highlight the timeline
    const sparkTooltip =
      'Touch of the Magi was cast without Radiant Spark being applied to the target. Touch of the Magi should be used in each of your burns (major and minor), and can be used to barrage into Radiant Spark, refresh your charges, and continue casting into Radiant Spark.';
    this.noSpark.forEach((s) => highlightInefficientCast(s.cast, sparkTooltip));

    return badCasts;
  };

  sparkOverlapMS = () => {
    let activeTime = 0;
    this.touch.forEach((t) => {
      if (!t.debuffRemove || !t.sparkRemoved) {
        return;
      }
      const start = t.cast.timestamp;
      const end = Math.min(t.debuffRemove.timestamp, t.sparkRemoved);
      activeTime += end - start;
    });
    return activeTime;
  };

  get hasCharges() {
    return this.touch.filter((t) => t.charges !== 0);
  }

  get noSpark() {
    return this.touch.filter((t) => !t.duringSpark);
  }

  get utilizationPercent() {
    return 1 - this.badCasts() / this.touch.length;
  }

  get averageOverlapSeconds() {
    return this.sparkOverlapMS() / this.touch.length / 1000;
  }

  get averageOverlapPercent() {
    return this.averageOverlapSeconds / TOUCH_OF_THE_MAGI_DURATION_SEC;
  }

  get touchOfTheMagiUtilization() {
    return {
      actual: this.utilizationPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get touchOfTheMagiOverlap() {
    return {
      actual: this.averageOverlapPercent,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.touchOfTheMagiUtilization).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> poorly {this.badCasts()}{' '}
          times. Of those, {this.hasCharges.length} were cast without clearing your{' '}
          <SpellLink spell={SPELLS.ARCANE_CHARGE} />s first, and {this.noSpark.length} were cast
          outside of <SpellLink spell={TALENTS.RADIANT_SPARK_TALENT} />. Since it will be available
          for every burn phase (major and minor), you should use{' '}
          <SpellLink spell={SPELLS.ARCANE_BARRAGE} /> to dump your charges into{' '}
          <SpellLink spell={TALENTS.RADIANT_SPARK_TALENT} /> and then use{' '}
          <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> to replenish your charges and
          continue casting into <SpellLink spell={TALENTS.RADIANT_SPARK_TALENT} />.
        </>,
      )
        .icon(TALENTS.TOUCH_OF_THE_MAGI_TALENT.icon)
        .actual(`${formatPercentage(actual, 0)}% utilization`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
    when(this.touchOfTheMagiOverlap).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          On average, your <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> debuff overlapped
          with <SpellLink spell={TALENTS.RADIANT_SPARK_TALENT} />{' '}
          {formatNumber(this.averageOverlapSeconds)}s ({formatPercentage(actual)}%) per cast of{' '}
          <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />. Because{' '}
          <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> deals a percentage of the damage
          done throughout it's duration, you want to stack it with{' '}
          <SpellLink spell={TALENTS.RADIANT_SPARK_TALENT} /> so your spells deal more damage and
          thus make <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> deal more damage as well.
          Typically you will do this by casting <SpellLink spell={TALENTS.RADIANT_SPARK_TALENT} />{' '}
          {'>'} <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} /> {'>'}{' '}
          <SpellLink spell={SPELLS.ARCANE_BARRAGE} /> {'>'}{' '}
          <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> during your major burn phase, or{' '}
          <SpellLink spell={TALENTS.RADIANT_SPARK_TALENT} /> {'>'}{' '}
          <SpellLink spell={SPELLS.ARCANE_BARRAGE} /> {'>'}{' '}
          <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> for your mini burn.
        </>,
      )
        .icon(TALENTS.TOUCH_OF_THE_MAGI_TALENT.icon)
        .actual(`${formatPercentage(actual, 0)}% overlap`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default TouchOfTheMagi;
