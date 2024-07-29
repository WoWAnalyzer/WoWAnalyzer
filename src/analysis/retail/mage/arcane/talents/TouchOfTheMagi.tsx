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

  hasTouchOfTheMagi: boolean = this.selectedCombatant.hasTalent(TALENTS.TOUCH_OF_THE_MAGI_TALENT);

  touch: {
    cast: CastEvent;
    charges: number;
    debuffApply: ApplyDebuffEvent | undefined;
    debuffRemove: RemoveDebuffEvent | undefined;
    sparkRemoved: number | undefined;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.hasTouchOfTheMagi;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.TOUCH_OF_THE_MAGI_TALENT),
      this.onTouch,
    );
  }

  onTouch(event: CastEvent) {
    const debuffApply: ApplyDebuffEvent | undefined = GetRelatedEvent(event, 'DebuffApply');
    const debuffRemove: RemoveDebuffEvent | undefined = GetRelatedEvent(event, 'DebuffRemove');
    const sparkRemoved: RemoveDebuffEvent | undefined = GetRelatedEvent(event, 'SparkRemoved');

    this.touch.push({
      cast: event,
      charges: this.chargeTracker.charges,
      debuffApply: debuffApply,
      debuffRemove: debuffRemove,
      sparkRemoved: sparkRemoved?.timestamp || undefined,
    });
  }

  badCasts = () => {
    //Count the number of casts that were bad
    let badCasts = 0;
    this.touch.forEach((t) => {
      if (t.charges !== 0) {
        badCasts += 1;
      }
    });

    //Get the number of casts where the player did not have 0 Arcane Charges
    //Highlight the timeline
    const chargesTooltip =
      'Touch of the Magi was cast without clearing your Arcane Charges. Touch of the Magi gives you 4 charges instantly, so use Barrage to clear your charges and then Touch of the Magi while Barrage is in the air to refresh your charges.';
    this.hasCharges.forEach((b) => highlightInefficientCast(b.cast, chargesTooltip));

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
          <SpellLink spell={SPELLS.ARCANE_CHARGE} />s first, and were cast outside of Radiant Spark.
          Since it will be available for every burn phase (major and minor), you should use{' '}
          <SpellLink spell={SPELLS.ARCANE_BARRAGE} /> to dump your charges into Radiant Spark and
          then use <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> to replenish your charges
          and continue casting into Radiant Spark.
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
          with Radiant Spark {formatNumber(this.averageOverlapSeconds)}s ({formatPercentage(actual)}
          %) per cast of <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />. Because{' '}
          <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> deals a percentage of the damage
          done throughout it's duration, you want to stack it with Radiant Spark so your spells deal
          more damage and thus make <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> deal more
          damage as well. Typically you will do this by casting Radiant Spark {'>'}{' '}
          <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} /> {'>'}{' '}
          <SpellLink spell={SPELLS.ARCANE_BARRAGE} /> {'>'}{' '}
          <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} /> during your major burn phase, or{' '}
          Radiant Spark {'>'} <SpellLink spell={SPELLS.ARCANE_BARRAGE} /> {'>'}{' '}
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
