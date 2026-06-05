import SPELLS from 'common/SPELLS/shaman';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/shaman';
import SpellLink from 'interface/SpellLink';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import Events, { CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ReactNode } from 'react';
import { MaelstromWeaponTracker } from '../resourcetracker';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import {
  evaluateQualitativePerformanceByThreshold,
  getAveragePerf,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import GuideSection from 'interface/guide/components/GuideSection';
import CastOverview, { type StatisticData } from 'interface/guide/components/CastOverview';
import CastDetail, { PerCastStat, type PerCastData } from 'interface/guide/components/CastDetail';

interface MissedSundering {
  event: CastEvent;
  timestamp: number;
}

interface PrimordialStormCast extends CooldownTrigger<CastEvent> {
  details: {
    maelstromUsed: number;
    shouldHaveHadDoomwinds: boolean;
    hadDoomwinds: boolean;
    sunderingTimestamp: number | undefined;
    /** When hadDoomwinds is true: was the Sundering cast before the DW window started? null when not applicable. */
    sunderingBeforeDoomwinds: boolean | null;
  };
}

class PrimordialStorm extends MajorCooldown<PrimordialStormCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    resourceTracker: MaelstromWeaponTracker,
  };

  resourceTracker!: MaelstromWeaponTracker;

  /**
   * How many PStorm casts per DW/Ascendance cycle.
   * 0 = skip sync (DRE or no relevant talent), 2 = DW (60s/30s), 4 = Ascendance (120s/30s)
   */
  private readonly dwSyncRatio: number;
  /** Whether the build uses Ascendance (for labelling) */
  private readonly hasAscendance: boolean;

  /** Total Sundering talent casts (excludes Earthsurge procs) */
  private totalSunderings = 0;
  /** Currently pending Sundering waiting for a PStorm follow-up */
  private pendingSundering: { event: CastEvent; timestamp: number } | null = null;
  /** Sunderings that expired without a PStorm follow-up */
  private missedSunderings: MissedSundering[] = [];

  /** 1-indexed counter of PStorm casts for DW sync tracking */
  private pstormCastIndex = 0;

  constructor(options: Options) {
    super({ spell: TALENTS.PRIMORDIAL_STORM_TALENT }, options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PRIMORDIAL_STORM_TALENT);

    this.hasAscendance = this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT);

    if (this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT)) {
      this.dwSyncRatio = 0;
    } else if (this.hasAscendance) {
      this.dwSyncRatio = 4;
    } else if (this.selectedCombatant.hasTalent(TALENTS.DOOM_WINDS_TALENT)) {
      this.dwSyncRatio = 2;
    } else {
      this.dwSyncRatio = 0;
    }

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PRIMORDIAL_STORM_CAST),
      this.onPrimordialStormCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SUNDERING_TALENT),
      this.onSunderingCast,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PRIMORDIAL_STORM_USABLE),
      this.onPrimordialStormBuffExpired,
    );

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onSunderingCast(event: CastEvent) {
    // If there's already a pending Sundering that wasn't consumed, record it as missed
    if (this.pendingSundering) {
      this.missedSunderings.push(this.pendingSundering);
    }
    this.totalSunderings += 1;
    this.pendingSundering = { event, timestamp: event.timestamp };
  }

  private onPrimordialStormBuffExpired(_event: RemoveBuffEvent) {
    if (this.pendingSundering) {
      this.missedSunderings.push(this.pendingSundering);
      this.pendingSundering = null;
    }
  }

  private onFightEnd() {
    if (this.pendingSundering) {
      this.missedSunderings.push(this.pendingSundering);
      this.pendingSundering = null;
    }
  }

  private onPrimordialStormCast(event: CastEvent) {
    // Consume the pending Sundering
    const sunderingTimestamp = this.pendingSundering?.timestamp;
    this.pendingSundering = null;

    // DW sync: increment counter and check
    this.pstormCastIndex += 1;

    const hadDoomwinds =
      this.dwSyncRatio > 0 && this.selectedCombatant.hasBuff(this.windowBuff, event.timestamp);

    // Self-correct the counter when the sync window is active
    if (hadDoomwinds && this.dwSyncRatio > 0) {
      this.pstormCastIndex = Math.ceil(this.pstormCastIndex / this.dwSyncRatio) * this.dwSyncRatio;
    }

    const shouldHaveHadDoomwinds =
      this.dwSyncRatio > 0 && this.pstormCastIndex % this.dwSyncRatio === 0;

    const sunderingBeforeDoomwinds = this.computeSunderingBeforeDoomwinds(
      event.timestamp,
      hadDoomwinds,
      sunderingTimestamp,
    );

    const details: PrimordialStormCast['details'] = {
      shouldHaveHadDoomwinds,
      hadDoomwinds,
      maelstromUsed: this.resourceTracker.lastSpenderInfo?.amount ?? 0,
      sunderingTimestamp,
      sunderingBeforeDoomwinds,
    };

    const lis: ReactNode[] = [];

    if (details.shouldHaveHadDoomwinds && !details.hadDoomwinds) {
      lis.push(
        <>
          <SpellLink spell={this.syncSpell} /> was missing.
        </>,
      );
    }

    if (details.maelstromUsed < 10) {
      lis.push(
        <>
          Cast with less than 10 <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} />
        </>,
      );
    }

    if (details.sunderingBeforeDoomwinds === false) {
      lis.push(
        <>
          <SpellLink spell={TALENTS.SUNDERING_TALENT} /> should be cast before pressing{' '}
          <SpellLink spell={this.syncSpell} /> so this cast doesn't waste GCDs setting up.
        </>,
      );
    }

    if (lis.length === 1) {
      addInefficientCastReason(event, lis[0]);
    } else if (lis.length > 1) {
      addInefficientCastReason(
        event,
        <>
          Cast without the following conditions met:
          <ul>
            {lis.map((x, i) => {
              return <li key={i}>{x}</li>;
            })}
          </ul>
        </>,
      );
    }

    this.recordCooldown({ event, details });
  }

  /** The talent spell used for the DW sync window (for labels/links) */
  private get syncSpell(): Spell {
    return this.hasAscendance ? TALENTS.ASCENDANCE_ENHANCEMENT_TALENT : TALENTS.DOOM_WINDS_TALENT;
  }

  /** The buff spell to check for the sync window being active */
  private get windowBuff(): Spell {
    return this.hasAscendance ? TALENTS.ASCENDANCE_ENHANCEMENT_TALENT : SPELLS.DOOM_WINDS_BUFF;
  }

  /**
   * Was the Sundering that fed this PStorm cast before the DW window started?
   * Returns null when not applicable (no DW sync, no DW active, or no Sundering involved).
   */
  private computeSunderingBeforeDoomwinds(
    castTimestamp: number,
    hadDoomwinds: boolean,
    sunderingTimestamp: number | undefined,
  ): boolean | null {
    if (!hadDoomwinds || this.dwSyncRatio === 0 || sunderingTimestamp === undefined) {
      return null;
    }

    const buffHistory = this.selectedCombatant.getBuffHistory(this.windowBuff.id);
    const activeBuff = buffHistory.find(
      (b) => b.start <= castTimestamp && (b.end === null || b.end >= castTimestamp),
    );

    if (!activeBuff) {
      return null;
    }

    return sunderingTimestamp < activeBuff.start;
  }

  /** Label for "Every Nth" DW sync frequency */
  private get syncLabel(): string {
    if (this.dwSyncRatio === 2) {
      return 'Every 2nd';
    }
    if (this.dwSyncRatio === 4) {
      return 'Every 4th';
    }
    return '';
  }

  private get syncDescription(): ReactNode {
    return (
      <>
        {this.syncLabel} <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} /> cast should be paired
        with <SpellLink spell={this.syncSpell} />.
      </>
    );
  }

  private buildOverviewStats(): StatisticData[] {
    let totalMaelstromUsed = 0;
    let syncOpportunities = 0;
    let syncedCasts = 0;

    for (const cast of this.casts) {
      totalMaelstromUsed += cast.details.maelstromUsed ?? 0;

      if (!cast.details.shouldHaveHadDoomwinds) {
        continue;
      }

      syncOpportunities += 1;
      if (cast.details.hadDoomwinds) {
        syncedCasts += 1;
      }
    }

    const sunderingsConsumed = this.totalSunderings - this.missedSunderings.length;

    const stats: StatisticData[] = [
      {
        value: `${this.casts.length}`,
        label: 'Total Casts',
        tooltip: (
          <>
            Total <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} /> casts.
          </>
        ),
      },
      {
        value: `${sunderingsConsumed}/${this.totalSunderings}`,
        label: 'Sundering → PStorm',
        tooltip: (
          <>
            <SpellLink spell={TALENTS.SUNDERING_TALENT} /> casts followed by{' '}
            <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />.
          </>
        ),
        performance:
          this.totalSunderings === 0
            ? undefined
            : this.missedSunderings.length === 0
              ? QualitativePerformance.Perfect
              : this.missedSunderings.length / this.totalSunderings <= 0.2
                ? QualitativePerformance.Good
                : QualitativePerformance.Fail,
      },
      {
        value: this.casts.length > 0 ? (totalMaelstromUsed / this.casts.length).toFixed(1) : '0.0',
        label: 'Avg Maelstrom',
        tooltip: (
          <>
            Average <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} /> stacks spent on each{' '}
            <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} /> cast.
          </>
        ),
      },
    ];

    if (this.dwSyncRatio > 0) {
      stats.push({
        value: syncOpportunities > 0 ? `${syncedCasts}/${syncOpportunities}` : '0/0',
        label: `${this.syncSpell.name} Sync`,
        tooltip: this.syncDescription,
      });
    }

    return stats;
  }

  private buildPerCastData(): PerCastData[] {
    // Build PStorm cast entries
    const pstormEntries = this.casts.map((cast) => {
      const spellUse = this.explainPerformance(cast);
      const details = cast.details;

      const stats: PerCastStat[] = [
        {
          value: `${details.maelstromUsed}`,
          label: 'Maelstrom',
          tooltip: (
            <>
              <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} /> stacks spent.
            </>
          ),
          performance: spellUse.checklistItems.find((item) => item.check === 'maelstrom-weapon')
            ?.performance,
        },
      ];

      if (this.dwSyncRatio > 0) {
        stats.push({
          value: details.shouldHaveHadDoomwinds ? (details.hadDoomwinds ? 'Yes' : 'No') : 'N/A',
          label: this.syncSpell.name,
          tooltip: this.syncDescription,
          performance: spellUse.checklistItems.find((item) => item.check === 'doom-winds')
            ?.performance,
        });
      }

      if (details.sunderingBeforeDoomwinds !== null) {
        stats.push({
          value: details.sunderingBeforeDoomwinds ? 'Pre' : 'Inside',
          label: 'Setup',
          tooltip: (
            <>
              <SpellLink spell={TALENTS.SUNDERING_TALENT} /> should be cast before pressing{' '}
              <SpellLink spell={this.syncSpell} /> so{' '}
              <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} /> is ready.
            </>
          ),
          performance: spellUse.checklistItems.find((item) => item.check === 'sundering-setup')
            ?.performance,
        });
      }

      return {
        performance: spellUse.performance,
        timestamp: this.owner.formatTimestamp(cast.event.timestamp),
        sortTimestamp: cast.event.timestamp,
        detailsIcon: null,
        stats,
      };
    });

    // Build missed Sundering entries
    const missedEntries = this.missedSunderings.map((missed) => ({
      performance: QualitativePerformance.Fail,
      timestamp: this.owner.formatTimestamp(missed.timestamp),
      sortTimestamp: missed.timestamp,
      detailsIcon: null,
      tooltip: (
        <>
          <SpellLink spell={TALENTS.SUNDERING_TALENT} /> was cast without a follow-up{' '}
          <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />.
        </>
      ),
      stats: [
        {
          value: 'Missed',
          label: 'PStorm Not Cast',
          tooltip: (
            <>
              <SpellLink spell={TALENTS.SUNDERING_TALENT} /> was cast but no{' '}
              <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />.
            </>
          ),
          performance: QualitativePerformance.Fail,
        },
      ],
      details: (
        <div>
          <SpellLink spell={TALENTS.SUNDERING_TALENT} /> cast without a{' '}
          <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />.
        </div>
      ),
    }));

    // Merge and sort chronologically
    return [...pstormEntries, ...missedEntries].sort((a, b) => a.sortTimestamp - b.sortTimestamp);
  }

  get guideSubsection() {
    if (!this.active) {
      return null;
    }

    return (
      <GuideSection spell={TALENTS.PRIMORDIAL_STORM_TALENT} explanation={this.description()}>
        <CastOverview spell={TALENTS.PRIMORDIAL_STORM_TALENT} stats={this.buildOverviewStats()} />
        <CastDetail title="Primordial Storm Casts" casts={this.buildPerCastData()} />
      </GuideSection>
    );
  }

  description() {
    const pstorm = <SpellLink spell={TALENTS.PRIMORDIAL_STORM_TALENT} />;
    const msw = <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} />;

    return (
      <>
        <p>
          Each hit from {pstorm} is considered a Main-Hand attack, and can trigger{' '}
          <SpellLink spell={TALENTS.WINDFURY_WEAPON_TALENT} /> separately and are AoE. Each hit
          deals combination physical and spell damage.
        </p>
        <p>
          {pstorm} is currently the <strong>strongest</strong> {msw} spender, and you should always
          aim to cast it with 10 unless waiting would mean losing the cast. The {msw} spent
          double-dips and also increases the damage of the follow-up{' '}
          <SpellLink spell={SPELLS.LIGHTNING_BOLT} />/
          <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> that is automatically cast.
        </p>
        {this.dwSyncRatio > 0 && (
          <p>
            Cast <SpellLink spell={TALENTS.SUNDERING_TALENT} /> just before pressing{' '}
            <SpellLink spell={this.syncSpell} /> so {pstorm} is ready immediately. Casting{' '}
            <SpellLink spell={TALENTS.SUNDERING_TALENT} /> during{' '}
            <SpellLink spell={this.syncSpell} /> wastes setup GCDs.
          </p>
        )}
      </>
    );
  }

  explainPerformance(cast: PrimordialStormCast): SpellUse {
    const details = cast.details;
    const checklistItems: ChecklistUsageInfo[] = [];

    /**
     * Maelstrom Used
     */
    checklistItems.push({
      check: 'maelstrom-weapon',
      timestamp: cast.event.timestamp,
      performance: evaluateQualitativePerformanceByThreshold({
        actual: details.maelstromUsed,
        isGreaterThanOrEqual: {
          perfect: 10,
          good: 8,
          ok: 5,
        },
      }),
      summary: (
        <>
          <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} /> usage
        </>
      ),
      details: (
        <div>
          <strong>{details.maelstromUsed}</strong>{' '}
          <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} /> used.
        </div>
      ),
    });

    /**
     * Doom Winds / Ascendance Sync
     */
    if (details.shouldHaveHadDoomwinds) {
      checklistItems.push({
        check: 'doom-winds',
        timestamp: cast.event.timestamp,
        performance: details.hadDoomwinds
          ? QualitativePerformance.Perfect
          : QualitativePerformance.Fail,
        summary: (
          <>
            <SpellLink spell={this.syncSpell} /> {details.hadDoomwinds ? '' : 'not '}active
          </>
        ),
        details: (
          <div>
            <SpellLink spell={this.syncSpell} /> {details.hadDoomwinds ? '' : 'not '}active.
          </div>
        ),
      });
    }

    /**
     * Sundering Setup (only when this PStorm landed inside DW)
     */
    if (details.sunderingBeforeDoomwinds !== null) {
      checklistItems.push({
        check: 'sundering-setup',
        timestamp: cast.event.timestamp,
        performance: details.sunderingBeforeDoomwinds
          ? QualitativePerformance.Perfect
          : QualitativePerformance.Fail,
        summary: (
          <>
            <SpellLink spell={TALENTS.SUNDERING_TALENT} /> cast{' '}
            {details.sunderingBeforeDoomwinds ? 'before' : 'after'}{' '}
            <SpellLink spell={this.syncSpell} />
          </>
        ),
        details: (
          <div>
            <SpellLink spell={TALENTS.SUNDERING_TALENT} /> was cast{' '}
            {details.sunderingBeforeDoomwinds
              ? 'before the window opened'
              : 'inside the window, wasting setup GCDs'}
            .
          </div>
        ),
      });
    }

    return {
      event: cast.event,
      checklistItems,
      performance: getAveragePerf(checklistItems.map((c) => c.performance)),
    };
  }
}

export default PrimordialStorm;
