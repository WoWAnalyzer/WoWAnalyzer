import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  FightEndEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class WakeofAshes extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  protected abilityTracker!: AbilityTracker;

  totalHits = 0;
  badCasts = 0;
  wakeCast = false;
  wasteHP = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.WAKE_OF_ASHES_TALENT),
      this.onWakeofAshesDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.WAKE_OF_ASHES_TALENT),
      this.onWakeofAshesCast,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.WAKE_OF_ASHES_TALENT),
      this.onWakeofAshesEnergize,
    );
    this.addEventListener(Events.fightend, this.onFinished);
  }

  onWakeofAshesDamage(event: DamageEvent) {
    this.totalHits += 1;
    this.wakeCast = false;
  }

  onWakeofAshesEnergize(event: ResourceChangeEvent) {
    if (event.waste > 0) {
      this.wasteHP = true;
    }
  }

  onWakeofAshesCast(event: CastEvent) {
    if (this.wakeCast) {
      this.badCasts += 1;
    }
    this.wakeCast = true;
    if (this.wasteHP) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason =
        '1 Holy Power or more wasted. You should be at 2 Holy Power or less before using Wake.';
      this.wasteHP = false;
    }
  }

  onFinished(event: FightEndEvent) {
    if (this.wakeCast) {
      this.badCasts += 1;
    }
  }

  get averageHitPerCast() {
    return this.totalHits / this.abilityTracker.getAbility(TALENTS.WAKE_OF_ASHES_TALENT.id).casts;
  }

  get badCastsThresholds() {
    return {
      actual: this.badCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.badCastsThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          <SpellLink spell={TALENTS.WAKE_OF_ASHES_TALENT} /> hit 0 targets {actual} time(s).{' '}
          <SpellLink spell={SPELLS.BLADE_OF_JUSTICE} /> has the same range of 12yds. You can use
          this as a guideline to tell if targets will be in range.
        </>,
      )
        .icon(TALENTS.WAKE_OF_ASHES_TALENT.icon)
        .actual(
          t({
            id: 'paladin.retribution.suggestions.wakeOfAshes.efficiency',
            message: `${actual} casts with no targets hit.`,
          }),
        )
        .recommended(`${recommended} is recommended`),
    );
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE()}
        icon={<SpellIcon spell={TALENTS.WAKE_OF_ASHES_TALENT} />}
        value={
          <>
            {this.averageHitPerCast.toFixed(2)} Average
            <br />
            {`${this.badCasts > 0 ? `${this.badCasts} Missed` : ''} `}
          </>
        }
        label="Targets Hit"
        tooltip={`You averaged ${this.averageHitPerCast.toFixed(
          2,
        )} hits per cast of Wake of Ashes. ${
          this.badCasts > 0
            ? `Additionally, you cast Wake of Ashes ${this.badCasts} time(s) without hitting anything.`
            : ''
        }`}
      />
    );
  }
}

export default WakeofAshes;
