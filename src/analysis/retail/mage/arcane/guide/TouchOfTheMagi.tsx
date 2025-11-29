import type { JSX } from 'react';
import { formatPercentage, formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellSeq } from 'parser/ui/SpellSeq';
import { EventType } from 'parser/core/Events';
import Analyzer from 'parser/core/Analyzer';
import { evaluateQualitativePerformanceByThreshold } from 'parser/ui/QualitativePerformance';
import TouchOfTheMagi, { TouchOfTheMagiData } from '../analyzers/TouchOfTheMagi';
import GuideSection from 'interface/guide/components/GuideSection';
import { type CastEvaluation } from 'interface/guide/components/CastSummary';
import CastSequence, {
  type CastSequenceEntry,
  type CastInSequence,
} from 'interface/guide/components/CastSequence';
import CastOverview from 'interface/guide/components/CastOverview';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';

import EventHistory from 'parser/shared/modules/EventHistory';

const MAX_ARCANE_CHARGES = 4;
const TOUCH_WINDOW_BUFFER_MS = 7500; // 7.5 seconds before and after

class TouchOfTheMagiGuide extends Analyzer {
  static dependencies = {
    touchOfTheMagi: TouchOfTheMagi,
    eventHistory: EventHistory,
  };

  protected touchOfTheMagi!: TouchOfTheMagi;
  protected eventHistory!: EventHistory;

  activeTimeUtil(activePercent: number) {
    const thresholds = this.touchOfTheMagi.touchMagiActiveTimeThresholds.isLessThan;
    return evaluateQualitativePerformanceByThreshold({
      actual: activePercent,
      isGreaterThan: {
        perfect: thresholds.minor,
        good: thresholds.average,
        ok: thresholds.major,
        fail: 0,
      },
    });
  }

  /**
   * Evaluates a single Touch of the Magi cast.
   * Returns performance and reason for tooltip display.
   *
   * Evaluation priority: fail → perfect → good → ok → default
   */
  private evaluateTouchCast(cast: TouchOfTheMagiData): CastEvaluation {
    const noCharges = cast.charges === 0;
    const maxCharges = cast.charges === MAX_ARCANE_CHARGES;
    const activeTime = cast.activeTime || 0;
    const activeTimePerf = this.activeTimeUtil(activeTime) as QualitativePerformance;
    const correctCharges = noCharges || (maxCharges && cast.refundBuff);

    // Fail conditions (highest priority)
    if (!correctCharges) {
      return {
        timestamp: cast.applied,
        performance: QualitativePerformance.Fail,
        reason: `Wrong charge count (${cast.charges}) - should have 0 or 4 charges with refund buff`,
      };
    }

    if (activeTimePerf === QualitativePerformance.Fail) {
      return {
        timestamp: cast.applied,
        performance: QualitativePerformance.Fail,
        reason: `Very low active time (${formatPercentage(activeTime, 1)}%) - need to cast more during Touch window`,
      };
    }

    // Perfect conditions
    if (correctCharges && activeTimePerf === QualitativePerformance.Perfect) {
      return {
        timestamp: cast.applied,
        performance: QualitativePerformance.Perfect,
        reason: `Perfect usage: correct charges (${cast.charges}) + excellent active time (${formatPercentage(activeTime, 1)}%)`,
      };
    }

    // Good conditions
    if (correctCharges && activeTimePerf === QualitativePerformance.Good) {
      return {
        timestamp: cast.applied,
        performance: QualitativePerformance.Good,
        reason: `Good usage: correct charges (${cast.charges}) + good active time (${formatPercentage(activeTime, 1)}%)`,
      };
    }

    // Ok conditions
    if (correctCharges && activeTimePerf === QualitativePerformance.Ok) {
      return {
        timestamp: cast.applied,
        performance: QualitativePerformance.Ok,
        reason: `Acceptable: correct charges (${cast.charges}) but could improve active time (${formatPercentage(activeTime, 1)}%)`,
      };
    }

    // Default fallback
    return {
      timestamp: cast.applied,
      performance: QualitativePerformance.Fail,
      reason: `Suboptimal Touch usage: ${cast.charges} charges, ${formatPercentage(activeTime, 1)}% active time`,
    };
  }

  get guideSubsection(): JSX.Element {
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const arcaneOrb = <SpellLink spell={SPELLS.ARCANE_ORB} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const siphonStorm = <SpellLink spell={SPELLS.SIPHON_STORM_BUFF} />;
    const evocation = <SpellLink spell={TALENTS.EVOCATION_TALENT} />;
    const arcaneBlast = <SpellLink spell={SPELLS.ARCANE_BLAST} />;
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;
    const presenceOfMind = <SpellLink spell={TALENTS.PRESENCE_OF_MIND_TALENT} />;
    const burdenOfPower = <SpellLink spell={TALENTS.BURDEN_OF_POWER_TALENT} />;
    const gloriousIncandescence = <SpellLink spell={TALENTS.GLORIOUS_INCANDESCENCE_TALENT} />;

    const explanation = (
      <>
        <b>{touchOfTheMagi}</b> is a short debuff available for each burn phase and grants you 4{' '}
        {arcaneCharge}s and accumulates 20% of your damage for the duration. When the debuff expires
        it explodes dealing damage to the target and reduced damage to nearby targets.
        <ul>
          <li>
            Using the standard rotation, cast as many spells as possible at the debuffed target
            until the debuff expires.
          </li>
          <li>
            Spend your {arcaneCharge}s with {arcaneBarrage} and then cast {touchOfTheMagi} while{' '}
            {arcaneBarrage}
            is in the air for some extra damage. cast
            {touchOfTheMagi} while {arcaneBarrage} is in the air. This should be done even if your
            charges will be refunded anyway via {burdenOfPower}, {gloriousIncandescence}, or .
          </li>
          <li>
            Major Burn Phase: Ensure you have {siphonStorm} and . Your cast sequence would typically
            be{' '}
            <SpellSeq
              spells={[
                TALENTS.EVOCATION_TALENT,
                TALENTS.ARCANE_MISSILES_TALENT,
                TALENTS.ARCANE_SURGE_TALENT,
                SPELLS.ARCANE_BARRAGE,
                TALENTS.TOUCH_OF_THE_MAGI_TALENT,
              ]}
            />
            . If you don't have 4 {arcaneCharge}s, cast {arcaneOrb} before {arcaneSurge}.
          </li>
          <li>
            Minor Burn Phase: {evocation} and {arcaneSurge} will not be available, but if possible
            you should go into {touchOfTheMagi} with .
          </li>
          <li>
            Use {presenceOfMind} at the end of {touchOfTheMagi} to squeeze in a couple more{' '}
            {arcaneBlast} casts.
          </li>
        </ul>
      </>
    );

    const activeTimeTooltip = (
      <>
        {formatPercentage(this.touchOfTheMagi.averageActiveTime)}% average Active Time per Touch of
        the Magi cast.
      </>
    );

    const activeTimePerf = this.activeTimeUtil(this.touchOfTheMagi.averageActiveTime);

    const averageDamageTooltip = (
      <>
        {formatNumber(this.touchOfTheMagi.averageDamage)} average damage per Touch of the Magi cast.
      </>
    );

    const totalCasts = this.touchOfTheMagi.touchData.length;
    const totalCastsTooltip = <>Total number of Touch of the Magi casts during the encounter.</>;

    // Get cast sequences for each Touch of the Magi window
    const touchSequenceEvents: CastSequenceEntry<TouchOfTheMagiData>[] =
      this.touchOfTheMagi.touchData.map((cast) => {
        const windowStart = cast.applied - TOUCH_WINDOW_BUFFER_MS;
        const windowEnd = cast.applied + TOUCH_WINDOW_BUFFER_MS;

        // Filter for cast events during the Touch window
        const castEvents = this.eventHistory.getEvents([EventType.Cast], {
          searchBackwards: false,
          startTimestamp: windowStart,
          duration: windowEnd - windowStart,
        });

        // Convert to CastInSequence format
        const casts: CastInSequence[] = castEvents.map((event) => ({
          timestamp: event.timestamp,
          spellId: event.ability.guid,
          spellName: event.ability.name,
          icon: event.ability.abilityIcon.replace('.jpg', ''),
          performance: undefined, // Could add performance evaluation per cast if desired
        }));

        return {
          data: cast,
          start: windowStart,
          end: windowEnd,
          casts,
        };
      });

    // Prepare per-cast data for CastDetail
    const perCastData: PerCastData[] = this.touchOfTheMagi.touchData.map((cast) => {
      const evaluation = this.evaluateTouchCast(cast);

      return {
        performance: evaluation.performance,
        timestamp: this.owner.formatTimestamp(cast.applied),
        stats: [
          {
            value: `${cast.charges}`,
            label: 'Charges',
            tooltip: <>Arcane Charges before Touch of the Magi cast</>,
          },
          {
            value: `${formatPercentage(cast.activeTime || 0, 0)}%`,
            label: 'Active',
            tooltip: <>Percentage of time spent actively casting during the window</>,
          },
          {
            value: formatNumber(cast.totalDamage),
            label: 'Damage',
            tooltip: <>Total damage accumulated during this Touch of the Magi</>,
          },
        ],
        details: evaluation.reason,
      };
    });

    return (
      <GuideSection spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} explanation={explanation}>
        <CastOverview
          spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT}
          stats={[
            {
              value: `${formatPercentage(this.touchOfTheMagi.averageActiveTime)}%`,
              label: 'Average Active Time',
              tooltip: activeTimeTooltip,
              performance: activeTimePerf,
            },
            {
              value: formatNumber(this.touchOfTheMagi.averageDamage),
              label: 'Average Damage',
              tooltip: averageDamageTooltip,
            },
            {
              value: `${totalCasts}`,
              label: 'Total Casts',
              tooltip: totalCastsTooltip,
            },
          ]}
        />
        <CastDetail title="Touch of the Magi Casts" casts={perCastData} />
        <CastSequence
          spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT}
          sequences={touchSequenceEvents}
          castTimestamp={(data) => formatDuration(data.applied - this.owner.fight.start_time)}
        />
      </GuideSection>
    );
  }
}

export default TouchOfTheMagiGuide;
