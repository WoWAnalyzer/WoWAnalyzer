import SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import { PerformanceMark } from 'interface/guide';
import { TipBox } from 'interface/guide/components';
import CastDetail, { PerCastData } from 'interface/guide/components/CastDetail';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import EmbeddedTimeline from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import SpellUsable from '../core/SpellUsable';

// Review tolerances, not rotation-guide thresholds. DT is off the GCD.
// https://www.wowhead.com/guide/classes/death-knight/unholy/rotation-cooldowns-pve-dps
const PERFECT_GAP_MS = 500;
const GOOD_GAP_MS = 1000;
const OK_GAP_MS = 1500;
const PERFORMANCES = [
  QualitativePerformance.Perfect,
  QualitativePerformance.Good,
  QualitativePerformance.Ok,
  QualitativePerformance.Fail,
];
const AURAS = [SPELLS.DARK_TRANSFORMATION_BUFF, SPELLS.FORBIDDEN_KNOWLEDGE_BUFF];

class ArmyDarkTransformation extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  private readonly armyCasts: {
    timestamp: number;
    dtCooldownRemaining: number;
    dtWasActive: boolean;
  }[] = [];
  private readonly dtCasts: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.COMMANDER_OF_THE_DEAD_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.ARMY_OF_THE_DEAD_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.DARK_TRANSFORMATION_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ARMY_OF_THE_DEAD_TALENT),
      this.onArmy,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DARK_TRANSFORMATION_TALENT),
      this.onDT,
    );
  }

  private onArmy(event: CastEvent) {
    this.armyCasts.push({
      timestamp: event.timestamp,
      dtCooldownRemaining: Math.max(
        0,
        this.deps.spellUsable.cooldownRemaining(
          TALENTS.DARK_TRANSFORMATION_TALENT.id,
          event.timestamp,
        ),
      ),
      dtWasActive: this.selectedCombatant.hasBuff(SPELLS.DARK_TRANSFORMATION_BUFF),
    });
  }

  private onDT(event: CastEvent) {
    this.dtCasts.push(event.timestamp);
  }

  private get assessments() {
    return this.armyCasts.map((army) => {
      const nearest = this.dtCasts.reduce<number | null>(
        (best, timestamp) =>
          best === null || Math.abs(timestamp - army.timestamp) < Math.abs(best - army.timestamp)
            ? timestamp
            : best,
        null,
      );
      const gap = nearest === null ? null : nearest - army.timestamp;
      // An already-active DT without its cast in the log does not establish its start time.
      const unknown =
        army.dtWasActive &&
        (gap === null || Math.abs(gap) > PERFECT_GAP_MS) &&
        !this.dtCasts.some((timestamp) => timestamp <= army.timestamp);
      const performance =
        gap !== null && Math.abs(gap) <= PERFECT_GAP_MS
          ? QualitativePerformance.Perfect
          : gap !== null && Math.abs(gap) <= GOOD_GAP_MS
            ? QualitativePerformance.Good
            : gap !== null && Math.abs(gap) <= OK_GAP_MS
              ? QualitativePerformance.Ok
              : QualitativePerformance.Fail;
      return { ...army, nearest, gap, performance, unknown };
    });
  }

  get guideSubsection() {
    if (!this.active) {
      return null;
    }
    const assessments = this.assessments;
    const casts: PerCastData[] = assessments
      .filter((entry) => !entry.unknown)
      .map((entry) => {
        const gapLabel =
          entry.gap === null
            ? 'No DT cast recorded'
            : entry.gap === 0
              ? 'Same time'
              : `${Math.abs(entry.gap) / 1000}s ${entry.gap < 0 ? 'before' : 'after'} Army`;
        const range = {
          start: Math.max(this.owner.fight.start_time, entry.timestamp - 10000),
          end: Math.min(this.owner.fight.end_time, entry.timestamp + 15000),
        };
        return {
          timestamp: this.owner.formatTimestamp(entry.timestamp),
          performance: entry.performance,
          tooltip: `Nearest Dark Transformation: ${gapLabel}.`,
          stats: [
            {
              value: entry.gap === null ? 'None' : `${Math.abs(entry.gap) / 1000}s`,
              label:
                entry.gap === null
                  ? 'DT cast recorded'
                  : entry.gap < 0
                    ? 'DT before Army'
                    : 'DT after Army',
              ungraded: true,
            },
          ],
          details:
            entry.performance === QualitativePerformance.Perfect
              ? 'You activated Army and Dark Transformation together. Keep pairing them to align Commander of the Dead with your Army summons.'
              : entry.performance === QualitativePerformance.Good
                ? 'Army and Dark Transformation were close together. Activate them together next time to align more of the summon window.'
                : entry.performance === QualitativePerformance.Ok
                  ? 'Army and Dark Transformation were up to 1.5 seconds apart. Dark Transformation is off the global cooldown, so activate them together instead of waiting for another global.'
                  : entry.gap !== null && entry.gap < 0
                    ? 'Dark Transformation was activated too early relative to Army. Activate it alongside Army next time to align Commander of the Dead with your summons.'
                    : entry.dtCooldownRemaining === 0
                      ? 'Dark Transformation was available when you cast Army. Activate both together next time to buff your Army summons with Commander of the Dead.'
                      : `Dark Transformation still had ${(entry.dtCooldownRemaining / 1000).toFixed(1)}s on its cooldown when you cast Army. Keep earlier DT uses on schedule so it is ready alongside Army; review encounter downtime before delaying either cooldown.`,
          additionalContent:
            range.end > range.start
              ? {
                  content: (
                    <details>
                      <summary>Review this Army window</summary>
                      <p>
                        The highlighted cast is Army of the Dead. Shaded areas show active buffs.
                        Hover for details and drag horizontally to see more.
                      </p>
                      <EmbeddedTimeline
                        range={range}
                        auras={AURAS}
                        highlightedCasts={[
                          {
                            timestamp: entry.timestamp,
                            spellId: TALENTS.ARMY_OF_THE_DEAD_TALENT.id,
                            selected: true,
                            label: `Army of the Dead, nearest DT: ${gapLabel}.`,
                          },
                        ]}
                      />
                    </details>
                  ),
                }
              : undefined,
        };
      });
    return explanationAndDataSubsection(
      <>
        <p>
          With <SpellLink spell={TALENTS.COMMANDER_OF_THE_DEAD_TALENT} />, activate{' '}
          <SpellLink spell={TALENTS.DARK_TRANSFORMATION_TALENT} /> alongside{' '}
          <SpellLink spell={TALENTS.ARMY_OF_THE_DEAD_TALENT} /> to buff your Army summons. Continue
          using DT between Army casts; those intervening uses are not penalized here.
        </p>
        <p>
          This review compares cast times, not whether the buffs have identical durations. Plan the
          pair together while keeping your cooldowns on schedule.
        </p>
        <TipBox hideIcon>
          <div>
            <PerformanceMark perf={QualitativePerformance.Perfect} /> <strong>Perfect</strong>:
            within 0.5s.
          </div>
          <div>
            <PerformanceMark perf={QualitativePerformance.Good} /> <strong>Good</strong>: more than
            0.5s, up to 1s.
          </div>
          <div>
            <PerformanceMark perf={QualitativePerformance.Ok} /> <strong>OK</strong>: more than 1s,
            up to 1.5s.
          </div>
          <div>
            <PerformanceMark perf={QualitativePerformance.Fail} /> <strong>Bad</strong>: more than
            1.5s apart, or no DT cast.
          </div>
        </TipBox>
      </>,
      <div style={{ minWidth: 0 }}>
        {this.armyCasts.length === 0 ? (
          <p>No Army of the Dead casts recorded.</p>
        ) : (
          casts.length > 0 && (
            <CastDetail
              title="Army / DT alignment"
              casts={casts}
              possiblePerformances={PERFORMANCES}
            />
          )
        )}
        {assessments.some((entry) => entry.unknown) && (
          <p>
            Some Army casts occurred with DT already active but its activation was not recorded.
            Those casts are ungraded.
          </p>
        )}
      </div>,
      40,
      'Army / Dark Transformation alignment',
    );
  }
}

export default ArmyDarkTransformation;
