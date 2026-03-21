import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber, formatSeconds } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import CastDetail, {
  type PerCastData,
  type PerCastStat,
} from 'interface/guide/components/CastDetail';
import CastOverview from 'interface/guide/components/CastOverview';
import GuideSection from 'interface/guide/components/GuideSection';
import ResourceLink from 'interface/ResourceLink';
import Events, {
  CastEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import MaelstromTracker from '../resources/MaelstromTracker';
import MaelstromSpenderInfo from '../core/MaelstromSpenderInfo';
import {
  evaluateQualitativePerformanceByThreshold,
  getLowestPerf,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { type JSX, type ReactNode } from 'react';

interface SpenderCast {
  event: CastEvent;
  hasMoTE: boolean;
  currentMaelstrom: number;
  lavaBurstAvailableDuration: number;
  wasteSinceLastSpender: number;
}

const LAVA_BURST_AVAILABLE_GRACE_MS = 10;
const LAVA_BURST_PERFECT_MS = 2000;
const LAVA_BURST_GOOD_MS = 3500;
const LAVA_BURST_OK_MS = 5000;
const SIGNIFICANT_OVERCAP_WASTE = 25;

class MaelstromSpenders extends Analyzer.withDependencies({
  maelstromTracker: MaelstromTracker,
  spenderInfo: MaelstromSpenderInfo,
  spellUsable: SpellUsable,
}) {
  spenderCasts: SpenderCast[] = [];

  enabledTalents: {
    masterOfTheElements: boolean;
  };

  oneChargeLavaBurstTimestamp: number | null = this.owner.fight.start_time;
  lastRecordedTotalWaste = 0;

  constructor(options: Options) {
    super(options);

    this.enabledTalents = {
      masterOfTheElements: this.selectedCombatant.hasTalent(TALENTS.MASTER_OF_THE_ELEMENTS_TALENT),
    };

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.deps.spenderInfo.maelstromSpenders),
      this.onSpenderCast,
    );

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(TALENTS.LAVA_BURST_TALENT),
      this.onLavaBustUsable,
    );
  }

  /**
   * Get the maelstrom cap for the selected combatant, taking into account any talents that modify it.
   */
  get maelstromCap(): number {
    let cap = 100;
    if (this.selectedCombatant.hasTalent(TALENTS.SWELLING_MAELSTROM_TALENT)) {
      cap += 50;
    }
    if (this.selectedCombatant.hasTalent(TALENTS.PRIMORDIAL_CAPACITY_TALENT)) {
      cap += 25;
    }
    return cap;
  }

  onLavaBustUsable(event: UpdateSpellUsableEvent) {
    if (event.updateType === UpdateSpellUsableType.RestoreCharge && event.chargesAvailable === 1) {
      this.oneChargeLavaBurstTimestamp = event.timestamp;
    }

    if (event.updateType === UpdateSpellUsableType.UseCharge && event.chargesAvailable === 0) {
      this.oneChargeLavaBurstTimestamp = null;
    }
  }

  onSpenderCast(event: CastEvent) {
    const totalWaste = this.deps.maelstromTracker.wasted;
    const wasteSinceLastSpender = Math.max(totalWaste - this.lastRecordedTotalWaste, 0);
    this.lastRecordedTotalWaste = totalWaste;

    const cast: SpenderCast = {
      event: event,
      hasMoTE:
        this.enabledTalents.masterOfTheElements &&
        this.selectedCombatant.hasBuff(SPELLS.MASTER_OF_THE_ELEMENTS_BUFF.id, event.timestamp),
      currentMaelstrom:
        this.deps.maelstromTracker.current +
        (this.deps.maelstromTracker.lastSpenderInfo?.amount ?? 0),
      lavaBurstAvailableDuration: this.oneChargeLavaBurstTimestamp
        ? event.timestamp - this.oneChargeLavaBurstTimestamp
        : 0,
      wasteSinceLastSpender,
    };
    this.spenderCasts.push(cast);
  }

  private getLavaBurstOpportunityPerformance(cast: SpenderCast): QualitativePerformance {
    if (!this.enabledTalents.masterOfTheElements || cast.hasMoTE) {
      return QualitativePerformance.Perfect;
    }

    return evaluateQualitativePerformanceByThreshold({
      actual: cast.lavaBurstAvailableDuration,
      isLessThan: {
        perfect: LAVA_BURST_PERFECT_MS,
        good: LAVA_BURST_GOOD_MS,
        ok: LAVA_BURST_OK_MS,
      },
    });
  }

  private isMoteRelevant(cast: SpenderCast): boolean {
    return (
      this.enabledTalents.masterOfTheElements &&
      (cast.hasMoTE || cast.lavaBurstAvailableDuration >= LAVA_BURST_AVAILABLE_GRACE_MS)
    );
  }

  private getWasteSinceLastSpender(cast: SpenderCast): number {
    return Math.max(cast.wasteSinceLastSpender, 0);
  }

  private isSignificantOvercap(cast: SpenderCast): boolean {
    return this.getWasteSinceLastSpender(cast) > SIGNIFICANT_OVERCAP_WASTE;
  }

  private getWastePerformance(cast: SpenderCast): QualitativePerformance {
    if (this.getWasteSinceLastSpender(cast) <= 0) {
      return QualitativePerformance.Perfect;
    }

    if (this.isSignificantOvercap(cast)) {
      return QualitativePerformance.Fail;
    }

    return QualitativePerformance.Ok;
  }

  private getMaelstromStat(cast: SpenderCast): PerCastStat {
    return {
      value: `${formatNumber(cast.currentMaelstrom)}/${formatNumber(this.maelstromCap)}`,
      label: 'Maelstrom',
      performance: this.getWastePerformance(cast),
      tooltip: (
        <>
          Your <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> immediately before this spender.
        </>
      ),
    };
  }

  private getWasteSinceLastSpenderStat(cast: SpenderCast): PerCastStat {
    const wasteSinceLastSpender = this.getWasteSinceLastSpender(cast);

    return {
      value: formatNumber(wasteSinceLastSpender),
      label: 'Waste Since Last',
      performance: this.getWastePerformance(cast),
      tooltip: (
        <>
          Actual <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> lost to overcap since your
          previous spender cast.
        </>
      ),
    };
  }

  private getMoteStat(cast: SpenderCast): PerCastStat {
    return {
      value: cast.hasMoTE ? 'Yes' : 'No',
      label: 'MoTE',
      performance: cast.hasMoTE
        ? QualitativePerformance.Perfect
        : this.getLavaBurstOpportunityPerformance(cast),
      tooltip: (
        <>
          Whether <SpellLink spell={TALENTS.MASTER_OF_THE_ELEMENTS_TALENT} /> was active when this
          spender was cast.
        </>
      ),
    };
  }

  private getLavaBurstStat(cast: SpenderCast): PerCastStat {
    const performance = this.getLavaBurstOpportunityPerformance(cast);
    const value =
      cast.lavaBurstAvailableDuration < LAVA_BURST_AVAILABLE_GRACE_MS
        ? 'No'
        : `${formatSeconds(cast.lavaBurstAvailableDuration, 1)}s`;

    return {
      value: value,
      label: 'LvB Ready',
      performance: this.enabledTalents.masterOfTheElements ? performance : undefined,
      tooltip: (
        <>
          Time that <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> had at least one charge ready
          before this spender cast.
        </>
      ),
    };
  }

  private getCastDetails(cast: SpenderCast): ReactNode {
    let recommendation: ReactNode | null = null;
    let context: ReactNode | null = null;
    const wasteSinceLastSpender = this.getWasteSinceLastSpender(cast);

    if (this.isSignificantOvercap(cast)) {
      context = (
        <div>
          You wasted <strong>{formatNumber(wasteSinceLastSpender)}</strong>{' '}
          <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> by not spending earlier. Wasting this
          much <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> is a significant mistake.
        </div>
      );
    } else if (wasteSinceLastSpender > 0) {
      context = (
        <div>
          You were at the <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> cap. Spend earlier to
          avoid overcapping and wasting <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} />.
        </div>
      );
    }

    if (
      this.enabledTalents.masterOfTheElements &&
      !cast.hasMoTE &&
      cast.lavaBurstAvailableDuration >= LAVA_BURST_AVAILABLE_GRACE_MS
    ) {
      if (cast.lavaBurstAvailableDuration < LAVA_BURST_PERFECT_MS) {
        recommendation = (
          <div>
            <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> was available for less than{' '}
            <strong>{formatSeconds(cast.lavaBurstAvailableDuration, 1)}s</strong>.
          </div>
        );
      } else {
        recommendation = (
          <div>
            One or more charges of <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> had been
            available for <strong>{formatSeconds(cast.lavaBurstAvailableDuration, 1)}s</strong> -
            you should have cast it earlier to have{' '}
            <SpellLink spell={TALENTS.MASTER_OF_THE_ELEMENTS_TALENT} /> active.
          </div>
        );
      }
    }

    return (
      <>
        <ul>
          <li>
            Spell Cast: <SpellLink spell={cast.event.ability.guid} />
          </li>
          {context && <li>{context}</li>}
          {recommendation && <li>{recommendation}</li>}
        </ul>
      </>
    );
  }

  private getCastStats(cast: SpenderCast): PerCastStat[] {
    const stats: PerCastStat[] = [this.getMaelstromStat(cast), this.getLavaBurstStat(cast)];

    if (this.getWasteSinceLastSpender(cast) > 0) {
      stats.push(this.getWasteSinceLastSpenderStat(cast));
    }

    if (this.isMoteRelevant(cast)) {
      stats.push(this.getMoteStat(cast));
    }

    return stats;
  }

  private buildPerCastData(): PerCastData[] {
    return this.spenderCasts.map((cast) => {
      const stats = this.getCastStats(cast);
      const statPerformances = stats.flatMap((stat) =>
        stat.performance === undefined || stat.label === 'Maelstrom' ? [] : [stat.performance],
      );

      return {
        performance: this.isSignificantOvercap(cast)
          ? QualitativePerformance.Fail
          : getLowestPerf(statPerformances),
        timestamp: this.owner.formatTimestamp(cast.event.timestamp),
        additionalContent: {
          title: 'Cast Details',
          content: this.getCastDetails(cast),
        },
        stats: stats,
      };
    });
  }

  private buildOverviewStats() {
    const totalCasts = this.spenderCasts.length;
    const castsWithMote = this.spenderCasts.filter((cast) => cast.hasMoTE).length;
    const lavaBurstReadyMisses = this.spenderCasts.filter(
      (cast) => !cast.hasMoTE && cast.lavaBurstAvailableDuration >= LAVA_BURST_OK_MS,
    ).length;
    const averageMaelstrom =
      totalCasts > 0
        ? this.spenderCasts.reduce((total, cast) => total + cast.currentMaelstrom, 0) / totalCasts
        : 0;

    return [
      {
        value: `${totalCasts}`,
        label: 'Total Spenders',
        tooltip: null,
      },
      {
        value: formatNumber(averageMaelstrom),
        label: 'Avg Maelstrom',
        tooltip: null,
      },
      ...(this.enabledTalents.masterOfTheElements
        ? [
            {
              value: `${castsWithMote}`,
              label: 'MoTE Casts',
              tooltip: null,
              performance:
                castsWithMote === totalCasts
                  ? QualitativePerformance.Perfect
                  : QualitativePerformance.Ok,
            },
            {
              value: `${lavaBurstReadyMisses}`,
              label: 'LvB-Ready Spends',
              tooltip: (
                <>
                  Spenders cast without <SpellLink spell={TALENTS.MASTER_OF_THE_ELEMENTS_TALENT} />{' '}
                  while <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> was already ready.
                </>
              ),
              performance:
                lavaBurstReadyMisses === 0
                  ? QualitativePerformance.Perfect
                  : QualitativePerformance.Fail,
            },
          ]
        : []),
    ];
  }

  get guideSubsection(): JSX.Element | null {
    if (this.spenderCasts.length === 0) {
      return null;
    }

    const explanation = (
      <>
        <p>
          <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> spenders are now often used earlier, so
          this section does not expect every cast to happen near cap.
        </p>
        {this.enabledTalents.masterOfTheElements ? (
          <p>
            The only casts flagged here are spenders used without{' '}
            <SpellLink spell={TALENTS.MASTER_OF_THE_ELEMENTS_TALENT} /> after{' '}
            <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> was already ready. If{' '}
            <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> was unavailable, spending early is
            treated as fine.
          </p>
        ) : (
          <p>These cards are informational and show when each spender was cast.</p>
        )}
      </>
    );

    return (
      <GuideSection
        spell={this.deps.spenderInfo.primarySpender}
        explanation={explanation}
        explanationPercent={30}
      >
        <CastOverview
          spell={this.deps.spenderInfo.primarySpender}
          stats={this.buildOverviewStats()}
        />
        <CastDetail title="Maelstrom Spender Casts" casts={this.buildPerCastData()} />
      </GuideSection>
    );
  }
}

export default MaelstromSpenders;
