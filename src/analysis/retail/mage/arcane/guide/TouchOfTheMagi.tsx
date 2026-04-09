import type { JSX } from 'react';
import { formatPercentage, formatNumber, formatDurationMillisMinSec } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { EventType } from 'parser/core/Events';
import Analyzer from 'parser/core/Analyzer';
import TouchOfTheMagi, { TouchOfTheMagiData } from '../analyzers/TouchOfTheMagi';
import GuideSection from 'interface/guide/components/GuideSection';
import { type CastEvaluation } from 'interface/guide/components/CastSummary';
import {
  SpellSequence,
  type CastSequenceEntry,
  type CastInSequence,
} from 'interface/guide/components/CastSequence';
import CastOverview from 'interface/guide/components/CastOverview';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';

import EventHistory from 'parser/shared/modules/EventHistory';

const TOUCH_WINDOW_BUFFER_MS = 7500; // 7.5 seconds before and after

class TouchOfTheMagiGuide extends Analyzer {
  static dependencies = {
    touchOfTheMagi: TouchOfTheMagi,
    eventHistory: EventHistory,
  };

  protected touchOfTheMagi!: TouchOfTheMagi;
  protected eventHistory!: EventHistory;

  isSunfury: boolean = this.selectedCombatant.hasTalent(TALENTS.MEMORY_OF_ALAR_TALENT);
  isSpellslinger: boolean = this.selectedCombatant.hasTalent(TALENTS.SPLINTERSTORM_TALENT);

  private evaluateTouchCast(cast: TouchOfTheMagiData): CastEvaluation {
    const noCharges = cast.charges === 0;
    const activeTime = cast.activeTime || 0;
    const activeTimePerf = this.touchOfTheMagi.activeTimeUtil(activeTime) as QualitativePerformance;

    // Fail conditions (highest priority)
    if (this.isSpellslinger && !noCharges) {
      return {
        timestamp: cast.applied,
        performance: QualitativePerformance.Fail,
        reason: `You had ${cast.charges} Arcane Charges. You should cast Arcane Barrage to dump your charges just before Touch of the Magi.`,
      };
    }

    if (activeTimePerf === QualitativePerformance.Fail) {
      return {
        timestamp: cast.applied,
        performance: QualitativePerformance.Fail,
        reason: `Very low active time during Touch of the Magi(${formatPercentage(activeTime, 1)}%)`,
      };
    }

    if (cast.surgeCD < 40000) {
      return {
        timestamp: cast.applied,
        performance: QualitativePerformance.Fail,
        reason: `Arcane Surge available soon (${formatDurationMillisMinSec(cast.surgeCD)} remaining)`,
      };
    }

    // Perfect conditions
    if (activeTimePerf === QualitativePerformance.Perfect) {
      return {
        timestamp: cast.applied,
        performance: QualitativePerformance.Perfect,
        reason: `Excellent uptime during Touch of the Magi(${formatPercentage(activeTime, 1)}%)`,
      };
    }

    // Good conditions
    if (activeTimePerf === QualitativePerformance.Good) {
      return {
        timestamp: cast.applied,
        performance: QualitativePerformance.Good,
        reason: `Good uptime during Touch of the Magi(${formatPercentage(activeTime, 1)}%)`,
      };
    }

    // Ok conditions
    if (activeTimePerf === QualitativePerformance.Ok) {
      return {
        timestamp: cast.applied,
        performance: QualitativePerformance.Ok,
        reason: `Low uptime during Touch of the Magi (${formatPercentage(activeTime, 1)}%)`,
      };
    }

    // Default fallback
    return {
      timestamp: cast.applied,
      performance: QualitativePerformance.Fail,
      reason: `Unknown performance condition. Please report this!`,
    };
  }

  get guideSubsection(): JSX.Element {
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;
    const arcaneSurge = <SpellLink spell={TALENTS.ARCANE_SURGE_TALENT} />;
    const sunfuryExecution = <SpellLink spell={TALENTS.SUNFURY_EXECUTION_TALENT} />;

    const explanation = (
      <>
        <b>{touchOfTheMagi}</b> is a short debuff available for each burn phase and grants you 4{' '}
        {arcaneCharge}s and accumulates 20% of your damage for the duration. When the debuff expires
        it explodes dealing damage to the target and reduced damage to nearby targets. Following the
        below guidelines will help you get the most out of the debuff:
        <ul>
          {this.isSpellslinger && (
            <li>
              Just before casting {touchOfTheMagi}, you should cast {arcaneBarrage} to expend all of
              your {arcaneCharge}s and then cast {touchOfTheMagi} while {arcaneBarrage} is in the
              air.
            </li>
          )}
          {this.isSunfury && (
            <li>
              Instead of using {arcaneBarrage} just before {touchOfTheMagi}, you should use it
              immediately after to buff the damage of the {arcaneBarrage} via {sunfuryExecution}
            </li>
          )}
          <li>
            If {arcaneSurge} will be available within the next 40 seconds, you should hold{' '}
            {touchOfTheMagi} to ensure {arcaneSurge} can be used while the {touchOfTheMagi} debuff
            is active.
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

    const activeTimePerf = this.touchOfTheMagi.activeTimeUtil(
      this.touchOfTheMagi.averageActiveTime,
    );

    const averageDamageTooltip = (
      <>
        {formatNumber(this.touchOfTheMagi.averageDamage)} average damage per Touch of the Magi cast.
      </>
    );

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
    const perCastData: PerCastData[] = this.touchOfTheMagi.touchData.map((cast, index) => {
      const evaluation = this.evaluateTouchCast(cast);
      const sequenceEntry = touchSequenceEvents[index];

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
          {
            value: formatDurationMillisMinSec(cast.surgeCD),
            label: 'Surge CD',
            tooltip: <>Arcane Surge Remaining Cooldown.</>,
          },
        ],
        details: evaluation.reason,
        additionalContent: sequenceEntry
          ? {
              title: 'Cast Sequence',
              content: <SpellSequence casts={sequenceEntry.casts} iconSize={40} />,
            }
          : undefined,
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
          ]}
        />
        <CastDetail title="Touch of the Magi Casts" casts={perCastData} />
      </GuideSection>
    );
  }
}

export default TouchOfTheMagiGuide;
