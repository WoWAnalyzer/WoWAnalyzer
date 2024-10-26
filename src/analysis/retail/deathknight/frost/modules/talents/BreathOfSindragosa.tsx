import { defineMessage } from '@lingui/macro';
import talents from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent, FightEndEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { PerformanceMark } from 'interface/guide';

const GOOD_BREATH_DURATION_MS = 25000;

class BreathOfSindragosa extends Analyzer {
  beginTimestamp = 0;
  casts = 0;
  badCasts = 0;
  totalDuration = 0;
  startingRunicPower = 0;
  breathActive = false;

  castTracker: breathCast[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.BREATH_OF_SINDRAGOSA_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.BREATH_OF_SINDRAGOSA_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(talents.BREATH_OF_SINDRAGOSA_TALENT),
      this.onRemoveBuff,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onCast(event: CastEvent) {
    if (!this.breathActive) {
      this.casts += 1;
      this.beginTimestamp = event.timestamp;
      this.breathActive = true;
      this.startingRunicPower = event.classResources?.at(0)?.amount ?? 0;
    }
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.breathActive = false;
    const duration = event.timestamp - this.beginTimestamp;
    if (duration < GOOD_BREATH_DURATION_MS) {
      this.badCasts += 1;
    }
    this.totalDuration += duration;
    this.castTracker.push({
      timestamp: this.beginTimestamp,
      startingRunicPower: this.startingRunicPower / 10,
      duration: duration / 1000,
      fightEnded: false,
    });
  }

  onFightEnd(event: FightEndEvent) {
    if (this.breathActive) {
      const duration = event.timestamp - this.beginTimestamp;
      this.castTracker.push({
        timestamp: this.beginTimestamp,
        startingRunicPower: this.startingRunicPower / 10,
        duration: duration / 1000,
        fightEnded: true,
      });
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          {' '}
          You are not getting good uptime from your{' '}
          <SpellLink spell={talents.BREATH_OF_SINDRAGOSA_TALENT} /> casts. A good cast is one that
          lasts {GOOD_BREATH_DURATION_MS / 1000} seconds or more. To ensure a good duration, make
          sure you have 70+ Runic Power pooled and have less than 4 Runes available before you start
          the cast. Also make sure to use <SpellLink spell={talents.EMPOWER_RUNE_WEAPON_TALENT} />{' '}
          within a few seconds of casting Breath of Sindragosa. Pay close attention to your Runic
          Power and make sure you are not overcapping. {this.tickingOnFinishedString}
        </>,
      )
        .icon(talents.BREATH_OF_SINDRAGOSA_TALENT.icon)
        .actual(
          defineMessage({
            id: 'deathknight.frost.suggestions.breathOfSindragosa.uptime',
            message: `You averaged ${this.averageDuration.toFixed(1)} seconds of uptime per cast`,
          }),
        )
        .recommended(`>${recommended} seconds is recommended`),
    );
  }

  get tickingOnFinishedString() {
    return this.breathActive
      ? 'Your final cast was not counted in the average since it was still ticking when the fight ended'
      : '';
  }

  get averageDuration() {
    return (this.totalDuration / this.casts || 0) / 1000;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageDuration,
      isLessThan: {
        minor: 60.0,
        average: 50.5,
        major: 45.0,
      },
      style: ThresholdStyle.SECONDS,
      suffix: 'Average',
    };
  }

  statistic() {
    return (
      <Statistic
        tooltip={`You started a new Breath of Sindragosa ${
          this.casts
        } times for a combined total of ${(this.totalDuration / 1000).toFixed(1)} seconds.  ${
          this.badCasts
        } casts were under ${GOOD_BREATH_DURATION_MS / 1000} seconds.  ${
          this.tickingOnFinishedString
        }`}
        position={STATISTIC_ORDER.CORE(60)}
        size="flexible"
      >
        <BoringSpellValueText spell={talents.BREATH_OF_SINDRAGOSA_TALENT}>
          <>
            {this.averageDuration.toFixed(1)}s <small>average duration</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={talents.BREATH_OF_SINDRAGOSA_TALENT} />
        </b>{' '}
        is your most significant source of damage. Your goal is to maximize the duration of it by
        playing around mechanics and maximizing your rp generation.
      </p>
    );

    const data = (
      <div>
        <strong>GCDs in Pillar of Frost</strong>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  get guideCastBreakdown() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={talents.BREATH_OF_SINDRAGOSA_TALENT} />
        </strong>{' '}
        is your most important cooldown. To perform well with Frost, you need to make sure to
        sustain its duration as long as possible. To help with this, you want to cast it when you
        have enough resources pooled that you won't immediately drop it.
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.castTracker.map((cast, idx) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={talents.BREATH_OF_SINDRAGOSA_TALENT} />
            </>
          );
          const checklistItems: CooldownExpandableItem[] = [];

          let rpPoolingPerf = QualitativePerformance.Good;
          if (cast.startingRunicPower < 80) {
            rpPoolingPerf = QualitativePerformance.Ok;
          }
          if (cast.startingRunicPower < 65) {
            rpPoolingPerf = QualitativePerformance.Fail;
          }
          checklistItems.push({
            label: 'Runic Power Pooled',
            result: <PerformanceMark perf={rpPoolingPerf} />,
            details: <>{cast.startingRunicPower} RP</>,
          });

          let durationPerf = QualitativePerformance.Good;
          if (cast.duration * 1000 < GOOD_BREATH_DURATION_MS && !cast.fightEnded) {
            durationPerf = QualitativePerformance.Ok;
          }
          if (cast.duration * 1000 < GOOD_BREATH_DURATION_MS - 5000 && !cast.fightEnded) {
            durationPerf = QualitativePerformance.Fail;
          }
          checklistItems.push({
            label: 'Breath duration',
            result: <PerformanceMark perf={durationPerf} />,
            details: <>{cast.duration}s</>,
          });

          const overallPerf =
            cast.duration * 1000 > GOOD_BREATH_DURATION_MS || cast.fightEnded
              ? QualitativePerformance.Good
              : QualitativePerformance.Fail;

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={idx}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

interface breathCast {
  timestamp: number;
  startingRunicPower: number;
  duration: number;
  fightEnded: boolean;
}

export default BreathOfSindragosa;
