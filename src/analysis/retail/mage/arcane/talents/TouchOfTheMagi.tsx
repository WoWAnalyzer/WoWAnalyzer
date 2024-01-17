import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyDebuffEvent, GetRelatedEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';
import Enemies from 'parser/shared/modules/Enemies';
import { highlightInefficientCast } from 'interface/report/Results/Timeline/Casts';

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
    debuff: ApplyDebuffEvent | undefined;
    duringSpark: boolean;
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
    const debuff: ApplyDebuffEvent | undefined = GetRelatedEvent(event, 'DebuffApply');
    const enemy = debuff && this.enemies.getEntity(debuff);
    this.touch.push({
      cast: event,
      charges: this.chargeTracker.charges,
      debuff: debuff,
      duringSpark: enemy && enemy.hasBuff(TALENTS.RADIANT_SPARK_TALENT.id) ? true : false,
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

  get hasCharges() {
    return this.touch.filter((t) => t.charges !== 0);
  }

  get noSpark() {
    return this.touch.filter((t) => !t.duringSpark);
  }

  get utilizationPercent() {
    return 1 - this.badCasts() / this.touch.length;
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
  }
}

export default TouchOfTheMagi;
