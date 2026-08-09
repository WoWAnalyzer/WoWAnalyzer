import { formatPercentage } from 'common/format';
import DK_SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import { PerformanceMark } from 'interface/guide';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { TipBox } from 'interface/guide/components';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import type { JSX } from 'react';

const FESTERING_SCYTHE_BUFF_DURATION = 25_000;
const PERFECT_REFRESH_WINDOW = 3_000;
const GOOD_REFRESH_WINDOW = 5_000;

interface FesteringScytheRecord {
  timestamp: number;
  performance: QualitativePerformance;
  remainingMs?: number;
  missingMs?: number;
  lesserGhoulStacks: number;
  eventType: 'refresh' | 'drop';
}

class FesteringScythe extends Analyzer {
  private lastBuffRemovedAt: number | null = null;

  private refreshCount = 0;
  private perfectRefreshes = 0;
  private goodRefreshes = 0;
  private droppedApplications = 0;

  private readonly records: FesteringScytheRecord[] = [];
  private castDetailsCache: PerCastData[] | null = null;

  private get buffSpellId() {
    return DK_SPELLS.FESTERING_SCYTHE_BUFF.id;
  }

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.FESTERING_SCYTHE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(DK_SPELLS.FESTERING_SCYTHE_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(DK_SPELLS.FESTERING_SCYTHE_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(DK_SPELLS.FESTERING_SCYTHE_BUFF),
      this.onRemoveBuff,
    );
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    if (this.lastBuffRemovedAt === null) {
      return;
    }

    const missingMs = Math.max(event.timestamp - this.lastBuffRemovedAt, 0);
    const lesserGhoulStacks = this.getLesserGhoulStacksBeforeScythe(event.timestamp);
    this.droppedApplications += 1;
    this.records.push({
      timestamp: event.timestamp,
      performance: QualitativePerformance.Fail,
      missingMs,
      lesserGhoulStacks,
      eventType: 'drop',
    });
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    this.lastBuffRemovedAt = event.timestamp;
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    const remainingMs = this.getRemainingTimeBeforeRefresh(event.timestamp);
    const lesserGhoulStacks = this.getLesserGhoulStacksBeforeScythe(event.timestamp);
    const value = this.getRefreshPerformance(remainingMs, lesserGhoulStacks);

    this.refreshCount += 1;
    this.records.push({
      timestamp: event.timestamp,
      performance: value,
      remainingMs,
      lesserGhoulStacks,
      eventType: 'refresh',
    });
  }

  private formatSeconds(durationMs: number) {
    return (durationMs / 1000).toFixed(1);
  }

  private getRefreshPerformance(remainingMs: number, lesserGhoulStacks: number) {
    if (remainingMs < PERFECT_REFRESH_WINDOW || lesserGhoulStacks <= 1) {
      this.perfectRefreshes += 1;
      return QualitativePerformance.Perfect;
    }

    if (remainingMs < GOOD_REFRESH_WINDOW) {
      this.goodRefreshes += 1;
      return QualitativePerformance.Good;
    }

    return QualitativePerformance.Ok;
  }

  private getLesserGhoulStacksBeforeScythe(timestamp: number): number {
    return this.selectedCombatant.getBuffStacks(DK_SPELLS.LESSER_GHOUL_BUFF.id);
  }

  private getRemainingTimeBeforeRefresh(timestamp: number): number {
    const currentBuff = this.selectedCombatant.getBuff(this.buffSpellId);

    if (!currentBuff) {
      return 0;
    }

    let previousApplicationTimestamp = currentBuff.start;
    for (let i = currentBuff.refreshHistory.length - 1; i >= 0; i -= 1) {
      const refreshTimestamp = currentBuff.refreshHistory[i];
      if (refreshTimestamp < timestamp) {
        previousApplicationTimestamp = refreshTimestamp;
        break;
      }
    }

    return Math.max(FESTERING_SCYTHE_BUFF_DURATION - (timestamp - previousApplicationTimestamp), 0);
  }

  private get goodOrPerfectRefreshRate() {
    const trackedRefreshOutcomes = this.refreshCount + this.droppedApplications;
    if (trackedRefreshOutcomes === 0) {
      return 1;
    }

    return (this.perfectRefreshes + this.goodRefreshes) / trackedRefreshOutcomes;
  }

  private get uptime() {
    return this.selectedCombatant.getBuffUptime(this.buffSpellId) / this.owner.fightDuration;
  }

  private buildCastDetails(): PerCastData[] {
    if (this.castDetailsCache) {
      return this.castDetailsCache;
    }

    this.castDetailsCache = this.records
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((record) => {
        if (record.eventType === 'drop') {
          return {
            performance: record.performance,
            timestamp: this.owner.formatTimestamp(record.timestamp),
            stats: [
              {
                value: `${this.formatSeconds(record.missingMs ?? 0)}s`,
                label: 'Missing time',
              },
              {
                value: record.lesserGhoulStacks,
                label: 'Lesser Ghoul stacks',
              },
            ],
            details: (
              <>
                <SpellLink spell={DK_SPELLS.FESTERING_SCYTHE_BUFF} /> fell off before you reapplied
                it. Avoid drops to keep disease haste active.
              </>
            ),
          };
        }

        const remainingSeconds = this.formatSeconds(record.remainingMs ?? 0);
        let details: JSX.Element;
        if (record.performance === QualitativePerformance.Perfect) {
          details = (
            <>
              You refreshed with {remainingSeconds}s left
              {record.lesserGhoulStacks <= 1 ? (
                <>
                  {' '}
                  while at ≤1 <SpellLink spell={DK_SPELLS.LESSER_GHOUL_BUFF} /> stack.
                </>
              ) : (
                ' (under 3s).'
              )}
            </>
          );
        } else if (record.performance === QualitativePerformance.Good) {
          details = <>Refreshed in the 3s to 5s window ({remainingSeconds}s remaining).</>;
        } else {
          details = (
            <>
              Refreshed too soon ({remainingSeconds}s remaining). Try to refresh later unless stack
              conditions force it.
            </>
          );
        }

        return {
          performance: record.performance,
          timestamp: this.owner.formatTimestamp(record.timestamp),
          stats: [
            {
              value: `${this.formatSeconds(record.remainingMs ?? 0)}s`,
              label: 'Remaining duration',
            },
            {
              value: record.lesserGhoulStacks,
              label: 'Lesser Ghoul stacks',
            },
          ],
          details,
        };
      });

    return this.castDetailsCache;
  }

  get guideSubsection(): JSX.Element {
    const legend = (
      <TipBox hideIcon>
        <div>
          <PerformanceMark perf={QualitativePerformance.Perfect} /> <strong>Perfect</strong> -
          Refreshed with under 3 seconds remaining, or with 1 or fewer{' '}
          <SpellLink spell={DK_SPELLS.LESSER_GHOUL_BUFF} /> stacks
        </div>
        <div>
          <PerformanceMark perf={QualitativePerformance.Good} /> <strong>Good</strong> - Refreshed
          in the 3 to 5 second window
        </div>
        <div>
          <PerformanceMark perf={QualitativePerformance.Ok} /> <strong>Ok</strong> - Refreshed
          safely, but earlier than the recommended window
        </div>
        <div>
          <PerformanceMark perf={QualitativePerformance.Fail} /> <strong>Fail</strong> - The buff
          fell off before you reapplied it
        </div>
      </TipBox>
    );

    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={DK_SPELLS.FESTERING_SCYTHE_BUFF} />
          </strong>{' '}
          is a high-value buff you want active for as much of the fight as possible. It hastens your
          diseases, which increases <SpellLink spell={TALENTS.SUDDEN_DOOM_TALENT} /> proc
          generation.
        </p>
        <p>
          Aim to maximize uptime while still refreshing efficiently: late refreshes are better than
          early ones, and the best refreshes are in the final seconds of the buff (or when your
          <SpellLink spell={DK_SPELLS.LESSER_GHOUL_BUFF} /> stack condition is met).
        </p>
        {legend}
      </>
    );

    const data = (
      <div>
        <div style={{ marginBottom: '6px' }}>
          <strong>
            <SpellLink spell={DK_SPELLS.FESTERING_SCYTHE} /> casts
          </strong>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <div>
            <strong>{formatPercentage(this.uptime, 1)}%</strong> <small>uptime</small>
          </div>
          <div>
            <strong>{formatPercentage(this.goodOrPerfectRefreshRate, 0)}%</strong>{' '}
            <small>good+perfect refreshes</small>
          </div>
          <div>
            <strong>{this.droppedApplications}</strong> <small>buff drops</small>
          </div>
        </div>
        <CastDetail title="Festering Scythe Timeline" casts={this.buildCastDetails()} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, 40);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={DK_SPELLS.FESTERING_SCYTHE_BUFF}>
          <div>
            {formatPercentage(this.uptime, 1)}% <small>uptime</small>
          </div>
          <div>
            {formatPercentage(this.goodOrPerfectRefreshRate, 0)}%{' '}
            <small>good+perfect refreshes</small>
          </div>
          <div>
            {this.droppedApplications} <small>buff drops</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FesteringScythe;
