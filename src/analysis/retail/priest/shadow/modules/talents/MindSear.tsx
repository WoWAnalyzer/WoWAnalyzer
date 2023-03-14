import { t } from '@lingui/macro';
import AbilityTracker from 'analysis/retail/priest/shadow/modules/core/AbilityTracker';
import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Enemies from 'parser/shared/modules/Enemies';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

class MindSear extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };
  protected enemies!: Enemies;
  protected abilityTracker!: AbilityTracker;

  /** Box row entry for each MS cast */
  castEntries: BoxRowEntry[] = [];

  damage = 0;
  hits = 0;
  ticks = 0;
  time = 0;
  checkTime = 0;
  totalCasts = 0;

  recentMSTimestamp: number = 0;
  recentTicks = 0;
  recentHits = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MIND_SEAR_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_SEAR_TALENT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.MIND_SEAR_TALENT),
      this.onCast,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onFightEnd() {
    this._tallyLastCast(); // make sure the last cast is closed out
  }

  onCast(event: CastEvent) {
    this._tallyLastCast(); // make sure the previous cast is closed out
    this._trackNewCast(event);
  }

  private _trackNewCast(event: CastEvent) {
    this.recentTicks = 0;
    this.recentHits = 0;
    this.recentMSTimestamp = event.timestamp;
  }

  onDamage(event: DamageEvent) {
    //Every Mind Sear cast can be one to four damage events per target.
    //By counting the number of unique timestamps, we can get the number of damage events.
    //By counting the damage events done we can calculate the average number of targets hit per tick, instead of per cast.

    this.hits += 1;
    this.recentHits += 1;

    this.damage += event.amount + (event.absorbed || 0);

    this.checkTime = event.timestamp;
    const timeDiff = Math.abs(this.time - this.checkTime);
    // Sometimes there can be a slight difference in timestamp even for the same ticks. This gives a plenty of tolerance while never risking catching the next set.
    if (timeDiff > 100) {
      this.ticks += 1;
      this.recentTicks += 1;
    }

    this.time = this.checkTime;
  }

  private _tallyLastCast() {
    this.totalCasts += 1;
    if (this.totalCasts === 1) {
      return; // there is no last cast
    }

    const averageHits = this.recentHits / this.recentTicks || 0;

    // add cast perf entry
    const value = averageHits >= 3 ? QualitativePerformance.Good : QualitativePerformance.Fail;
    const tooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(this.recentMSTimestamp)}</strong>, Hits:{' '}
        <strong>{averageHits.toFixed(1)}</strong>
      </>
    );
    this.castEntries.push({ value, tooltip });
  }

  get averageTargetsHit() {
    return this.hits / this.ticks || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageTargetsHit,
      isLessThan: {
        minor: 3,
        average: 2.5,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You hit an average of {formatNumber(actual)} targets with{' '}
          <SpellLink id={TALENTS.MIND_SEAR_TALENT.id} />. Using{' '}
          <SpellLink id={TALENTS.MIND_SEAR_TALENT.id} /> below {formatNumber(recommended)} targets
          is not worth it and you will get more damage value from your insanity with{' '}
          <SpellLink id={TALENTS.DEVOURING_PLAGUE_TALENT.id} />.
        </>,
      )
        .icon(TALENTS.MIND_SEAR_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.MIND_SEAR.efficiency',
            message: `Hit an average of ${formatNumber(actual)} targets with Mind Sear.`,
          }),
        )
        .recommended(`>=${recommended} is recommended.`),
    );
  }

  statistic() {
    if (this.damage !== 0) {
      return (
        <Statistic
          category={STATISTIC_CATEGORY.TALENTS}
          size="flexible"
          tooltip={`Average targets hit: ${this.averageTargetsHit.toFixed(1)}`}
        >
          <BoringSpellValueText spellId={TALENTS.MIND_SEAR_TALENT.id}>
            <>
              <ItemDamageDone amount={this.damage} />
            </>
          </BoringSpellValueText>
        </Statistic>
      );
    }
  }

  get guideSubsection(): JSX.Element {
    if (this.damage === 0) {
      //if mindsear doesn't deal damage, this section isn't needed.
      return <br />;
    }

    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS.MIND_SEAR_TALENT.id} /> is your best insanity spending spell on
          multiple targets.
        </b>
        <br />
        Use <SpellLink id={TALENTS.MIND_SEAR_TALENT.id} /> over{' '}
        <SpellLink id={TALENTS.DEVOURING_PLAGUE_TALENT.id} /> if there are at least 3 stacked
        targets (or two targets with the <SpellLink id={TALENTS.MIND_DEVOURER_TALENT.id} /> buff).
        Remember that only targets within 10 yds of the primary target will be hit.
      </p>
    );

    const data = (
      <div>
        <strong>Mind Sear Casts</strong>
        <small>
          {' '}
          - Green is a good cast, Red was effective on fewer than three targets. Mouseover boxes for
          details.
        </small>
        <PerformanceBoxRow values={this.castEntries} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default MindSear;
