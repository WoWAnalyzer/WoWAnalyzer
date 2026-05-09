import type { JSX } from 'react';
import talents from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent, FightEndEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { PerformanceMark } from 'interface/guide';

class BreathOfSindragosa extends Analyzer {
  beginTimestamp = 0;
  casts = 0;
  totalDuration = 0;
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
    }
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.breathActive = false;
    const duration = event.timestamp - this.beginTimestamp;
    this.totalDuration += duration;
    this.castTracker.push({
      timestamp: this.beginTimestamp,
      duration: duration / 1000,
      fightEnded: false,
    });
  }

  onFightEnd(event: FightEndEvent) {
    if (this.breathActive) {
      const duration = event.timestamp - this.beginTimestamp;
      this.castTracker.push({
        timestamp: this.beginTimestamp,
        duration: duration / 1000,
        fightEnded: true,
      });
    }
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
        is one of your most important cooldowns. You want to make sure to use it on cooldown and
        sustain it for as long as possible. The longer you can keep it up, the more value you get
        out of it. However, your rotation does not change during Breath, and you should not go out
        of your way to extend the duration.
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
        is one of your most important cooldowns. You want to make sure to use it on cooldown and
        sustain it for as long as possible. The longer you can keep it up, the more value you get
        out of it. However, your rotation does not change during Breath, and you should not go out
        of your way to extend the duration.
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

          checklistItems.push({
            label: 'Breath duration',
            result: <PerformanceMark perf={QualitativePerformance.Good} />,
            details: <>{cast.duration}s</>,
          });

          const overallPerf = QualitativePerformance.Good;

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
  duration: number;
  fightEnded: boolean;
}

export default BreathOfSindragosa;
