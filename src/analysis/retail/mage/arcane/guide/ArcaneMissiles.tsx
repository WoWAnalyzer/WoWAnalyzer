import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatDurationMillisMinSec } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import CastSummary, { type CastEvaluation } from 'interface/guide/components/CastSummary';
import GuideSection from 'interface/guide/components/GuideSection';
import CastOverview from 'interface/guide/components/CastOverview';
import { evaluateQualitativePerformanceByThreshold } from 'parser/ui/QualitativePerformance';

import ArcaneMissiles, { ArcaneMissilesData } from '../analyzers/ArcaneMissiles';

const MISSILE_EARLY_CLIP_DELAY = 200;

class ArcaneMissilesGuide extends Analyzer {
  static dependencies = {
    arcaneMissiles: ArcaneMissiles,
  };

  protected arcaneMissiles!: ArcaneMissiles;

  hasAetherAttunement: boolean = this.selectedCombatant.hasTalent(TALENTS.AETHER_ATTUNEMENT_TALENT);

  channelDelayUtil(delay: number) {
    const thresholds = this.arcaneMissiles.channelDelayThresholds.isGreaterThan;
    return evaluateQualitativePerformanceByThreshold({
      actual: delay,
      isGreaterThan: {
        perfect: thresholds.minor,
        good: thresholds.average,
        ok: thresholds.major,
        fail: 0,
      },
    });
  }

  /**
   * Evaluates a single Arcane Missiles cast for CastSummary.
   * Returns performance and reason for tooltip display.
   *
   * Evaluation priority: fail → perfect → good → ok → default
   */
  private evaluateMissilesCast(am: ArcaneMissilesData): CastEvaluation {
    const clippedBeforeGCD =
      am.channelEnd && am.gcdEnd && am.gcdEnd - am.channelEnd > MISSILE_EARLY_CLIP_DELAY;
    const hasValidTiming = am.channelEndDelay !== undefined && am.nextCast !== undefined;
    const goodChannelDelay =
      hasValidTiming &&
      (this.channelDelayUtil(am.channelEndDelay!) === QualitativePerformance.Good ||
        this.channelDelayUtil(am.channelEndDelay!) === QualitativePerformance.Perfect);

    // Fail conditions (highest priority)
    if (clippedBeforeGCD) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: 'Clipped Missiles before GCD ended - significant DPS loss',
      };
    }

    if (!hasValidTiming) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: 'Cannot determine channel timing - likely data issue',
      };
    }

    // Perfect conditions
    if (am.clearcastingCapped) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: 'Perfect - avoided munching Clearcasting charges by using when capped',
      };
    }

    if (this.hasAetherAttunement && am.aetherAttunement && am.clipped && goodChannelDelay) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: 'Perfect clip timing with Aether Attunement and good delay',
      };
    }

    // Good conditions
    if (this.hasAetherAttunement && am.aetherAttunement && am.clipped) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: 'Good clip timing with Aether Attunement',
      };
    }

    if (!this.hasAetherAttunement && !am.aetherAttunement && !am.clipped) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: 'Good - full channel without Aether Attunement (optimal without talent)',
      };
    }

    if (goodChannelDelay) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Good timing - ${am.channelEndDelay ? formatDurationMillisMinSec(am.channelEndDelay, 3) : '???'} delay to next cast`,
      };
    }

    // Ok conditions
    if (!am.aetherAttunement && !am.clipped) {
      return {
        timestamp: am.cast.timestamp,
        performance: QualitativePerformance.Ok,
        reason: 'Full channel - not clipped but could be optimized with Aether Attunement',
      };
    }

    // Default
    return {
      timestamp: am.cast.timestamp,
      performance: QualitativePerformance.Ok,
      reason: am.channelEndDelay
        ? `Standard usage - ${formatDurationMillisMinSec(am.channelEndDelay, 3)} delay to next cast`
        : 'Standard Arcane Missiles usage',
    };
  }

  get guideSubsection(): JSX.Element {
    const arcaneMissiles = <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const aetherAttunement = <SpellLink spell={TALENTS.AETHER_ATTUNEMENT_TALENT} />;

    const explanation = (
      <>
        Ensure you are spending your <b>{clearcasting}</b> procs effectively with {arcaneMissiles}.
        <ul>
          <li>
            Cast {arcaneMissiles} immediately if capped on {clearcasting} charges, ignoring any of
            the below items, to avoid munching procs (gaining a charge while capped).
          </li>
          <li>Do not cast {arcaneMissiles} if you have .</li>
          <li>
            If you don't have {aetherAttunement}, you can optionally clip your {arcaneMissiles} cast
            once the GCD ends for a small damage boost.
          </li>
        </ul>
      </>
    );

    const averageDelayTooltip = (
      <>
        {formatDurationMillisMinSec(this.arcaneMissiles.averageChannelDelay, 3)} Average Delay from
        End Channel to Next Cast.
      </>
    );

    const averageDelayPerf = this.channelDelayUtil(this.arcaneMissiles.averageChannelDelay);

    const totalCasts = this.arcaneMissiles.missileData.length;
    const totalCastsTooltip = <>Total number of Arcane Missiles casts during the encounter.</>;

    const castsWithoutNextCast = this.arcaneMissiles.castsWithoutNextCast;
    const castsWithoutNextCastTooltip = (
      <>
        Number of Arcane Missiles casts where no follow-up cast was detected (typically at end of
        fight).
      </>
    );

    const clippedCasts = this.arcaneMissiles.missileData.filter((m) => m.clipped).length;
    const clippedCastsTooltip = (
      <>Number of Arcane Missiles casts that were clipped (didn't reach full channel duration).</>
    );

    const cappedCasts = this.arcaneMissiles.missileData.filter((m) => m.clearcastingCapped).length;
    const cappedCastsTooltip = (
      <>
        Number of Arcane Missiles casts made while at maximum Clearcasting stacks (avoiding munched
        procs).
      </>
    );

    const aetherAttunementCasts = this.arcaneMissiles.missileData.filter(
      (m) => m.aetherAttunement,
    ).length;
    const aetherAttunementTooltip = (
      <>Number of Arcane Missiles casts made with the Aether Attunement buff active.</>
    );

    const averageTicks =
      this.arcaneMissiles.missileData.reduce((sum, m) => sum + m.ticks, 0) / totalCasts;
    const averageTicksTooltip = <>Average number of damage ticks per Arcane Missiles cast.</>;

    return (
      <GuideSection spell={TALENTS.ARCANE_MISSILES_TALENT} explanation={explanation}>
        <CastOverview
          spell={TALENTS.ARCANE_MISSILES_TALENT}
          stats={[
            {
              value: formatDurationMillisMinSec(this.arcaneMissiles.averageChannelDelay, 3),
              label: 'Avg Delay from Channel End',
              tooltip: averageDelayTooltip,
              performance: averageDelayPerf,
            },
            {
              value: `${totalCasts}`,
              label: 'Total Casts',
              tooltip: totalCastsTooltip,
            },
            {
              value: `${castsWithoutNextCast}`,
              label: 'Casts Without Follow-up',
              tooltip: castsWithoutNextCastTooltip,
            },
            {
              value: `${clippedCasts}`,
              label: 'Clipped Casts',
              tooltip: clippedCastsTooltip,
            },
            {
              value: `${cappedCasts}`,
              label: 'Casts While Capped',
              tooltip: cappedCastsTooltip,
            },
            {
              value: `${aetherAttunementCasts}`,
              label: 'Aether Attunement Casts',
              tooltip: aetherAttunementTooltip,
            },
            {
              value: averageTicks.toFixed(1),
              label: 'Average Ticks',
              tooltip: averageTicksTooltip,
            },
          ]}
        />
        <CastSummary
          spell={TALENTS.ARCANE_MISSILES_TALENT}
          casts={this.arcaneMissiles.missileData.map((cast) => this.evaluateMissilesCast(cast))}
          showBreakdown
        />
      </GuideSection>
    );
  }
}

export default ArcaneMissilesGuide;
