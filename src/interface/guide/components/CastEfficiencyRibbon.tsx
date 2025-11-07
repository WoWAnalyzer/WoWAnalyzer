import styled from '@emotion/styled';
import { SpellLink, Tooltip } from 'interface';
import { useAnalyzer, useInfo, useEvents } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Abilities from 'parser/core/modules/Abilities';
import EventHistory from 'parser/shared/modules/EventHistory';
import { formatPercentage, formatDuration } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import { StatCard, StatValue, StatLabel, HelperText } from './GuideDivs';
import GuideDataWrapper from './GuideDataWrapper';
import { EventType, UpdateSpellUsableEvent, UpdateSpellUsableType } from 'parser/core/Events';
import BulletGraph, { PerformanceRange } from './BulletGraph';
import { CooldownWindow } from 'parser/ui/CooldownBar';
import SegmentedTimeline, { TimelineSegment, TimelineMarker } from './SegmentedTimeline';
import { BAD_COLOR, getSpecColor } from 'interface/guide/colors';

// Styled Components
const RibbonContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 8px;
`;

const TimelineWrapper = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
`;

// Helper functions to convert combat log events to timeline segments/markers
function createCooldownSegments(
  spellId: number,
  events: ReturnType<typeof useEvents>,
  windows: CooldownWindow[],
  cooldownColor: string,
): TimelineSegment[] {
  const segments: TimelineSegment[] = [];

  windows.forEach((window) => {
    // Get cooldown end events for this window
    const endCooldowns: UpdateSpellUsableEvent[] = events
      .filter(
        (event): event is UpdateSpellUsableEvent =>
          event.type === EventType.UpdateSpellUsable &&
          event.ability.guid === spellId &&
          event.updateType === UpdateSpellUsableType.EndCooldown &&
          event.overallStartTimestamp < window.endTime &&
          event.timestamp > window.startTime,
      )
      .sort((a, b) => a.overallStartTimestamp - b.overallStartTimestamp);

    const beginCooldowns: UpdateSpellUsableEvent[] = events.filter(
      (event): event is UpdateSpellUsableEvent =>
        event.type === EventType.UpdateSpellUsable &&
        event.ability.guid === spellId &&
        event.updateType === UpdateSpellUsableType.BeginCooldown &&
        event.timestamp >= window.startTime &&
        event.timestamp <= window.endTime,
    );

    // Create cooldown segments
    endCooldowns.forEach((cd) => {
      const cdStart = Math.max(cd.overallStartTimestamp, window.startTime);
      const cdEnd = Math.min(cd.timestamp, window.endTime);

      segments.push({
        start: cdStart,
        end: cdEnd,
        color: cooldownColor,
        opacity: 1,
        label: `On Cooldown: ${formatDuration(cdStart - window.startTime)} - ${formatDuration(cdEnd - window.startTime)}`,
      });
    });

    // Handle final cooldown that started but didn't end
    if (beginCooldowns.length > endCooldowns.length) {
      const lastBegin = beginCooldowns[beginCooldowns.length - 1];
      if (lastBegin.overallStartTimestamp < window.endTime) {
        segments.push({
          start: lastBegin.overallStartTimestamp,
          end: window.endTime,
          color: cooldownColor,
          opacity: 1,
          label: `On Cooldown: ${formatDuration(lastBegin.overallStartTimestamp - window.startTime)} - ${formatDuration(window.endTime - window.startTime)}`,
        });
      }
    }

    // Create "available" highlight segments (high visibility red areas where spell wasn't cast)
    let lastCdEnd = window.startTime;

    endCooldowns.forEach((cd) => {
      if (cd.overallStartTimestamp > lastCdEnd) {
        segments.push({
          start: lastCdEnd,
          end: cd.overallStartTimestamp,
          color: BAD_COLOR,
          opacity: 1,
          label: `Available: ${formatDuration(lastCdEnd - window.startTime)} - ${formatDuration(cd.overallStartTimestamp - window.startTime)}`,
        });
      }
      lastCdEnd = Math.min(cd.timestamp, window.endTime);
    });

    // Check final gap to window end
    const finalCdEnd = beginCooldowns.length > endCooldowns.length ? window.endTime : lastCdEnd;
    if (finalCdEnd < window.endTime) {
      segments.push({
        start: finalCdEnd,
        end: window.endTime,
        color: BAD_COLOR,
        opacity: 1,
        label: `Available: ${formatDuration(finalCdEnd - window.startTime)} - ${formatDuration(window.endTime - window.startTime)}`,
      });
    }
  });

  return segments;
}

function createCastMarkers(
  spellId: number,
  events: ReturnType<typeof useEvents>,
  windows: CooldownWindow[],
): TimelineMarker[] {
  const markers: TimelineMarker[] = [];

  windows.forEach((window) => {
    // Get cast events for this window
    const casts = events.filter(
      (event) =>
        event.type === EventType.Cast &&
        event.ability.guid === spellId &&
        event.timestamp >= window.startTime &&
        event.timestamp <= window.endTime,
    );

    casts.forEach((cast) => {
      markers.push({
        timestamp: cast.timestamp,
        label: `Cast at ${formatDuration(cast.timestamp - window.startTime)}`,
        color: '#FFF',
      });
    });
  });

  return markers;
}

interface Props {
  /** The spell to show cooldown bars for - this must match the ID of the spell's cast event */
  spell: Spell;
  /** If provided, shows explanatory text above the cooldown bar */
  showExplanation?: boolean;
  /** Color to use for the efficiency stat card. If not provided, uses white. */
  efficiencyColor?: string;
  /** If true, uses a compact inline layout */
  compactLayout?: boolean;
  /**
   * Windows where the spell is actually usable. Useful for execute spells or phase-specific abilities.
   * If not specified, defaults to the whole fight.
   */
  activeWindows?: CooldownWindow[];
}

/**
 * Unified component for displaying cast efficiency as a ribbon visualization.
 * Automatically handles both charge-based and cooldown-based abilities.
 * Colors are automatically determined based on the player's spec.
 *
 * - For charge abilities: Shows a horizontal bar with filled/empty segments
 * - For cooldown abilities: Shows a ribbon timeline with gaps showing availability
 *
 * @param spell - The spell to show cooldown bars for (must match cast event ID)
 * @param showExplanation - If true, shows explanatory text above the cooldown bar (default: false)
 * @param efficiencyColor - Color for efficiency stat card (default: white)
 * @param compactLayout - If true, uses compact inline layout (default: false)
 * @param activeWindows - Time windows when spell is usable (default: whole fight)
 */
export default function CastEfficiencyRibbon({
  spell,
  showExplanation = false,
  efficiencyColor = 'white',
  compactLayout = false,
  activeWindows,
}: Props): JSX.Element | null {
  const castEfficiency = useAnalyzer(CastEfficiency);
  const abilities = useAnalyzer(Abilities);
  const eventHistory = useAnalyzer(EventHistory);
  const info = useInfo();
  const events = useEvents();

  if (!castEfficiency || !info || !abilities || !events) {
    return null;
  }

  // Auto-detect spec color
  const specColor = getSpecColor(info.combatant.spec?.id);

  const ability = abilities.getAbility(spell.id);
  const hasCharges = (ability?.charges ?? 1) > 1;

  // Charge-based rendering requires EventHistory
  if (hasCharges && !eventHistory) {
    const errorContent = (
      <HelperText>
        <strong>EventHistory module is not available.</strong> Chart cannot be rendered.
      </HelperText>
    );

    return (
      <GuideDataWrapper title={`${spell.name} - Error`} compact={compactLayout}>
        {errorContent}
      </GuideDataWrapper>
    );
  }

  const maxCharges = ability?.charges || 1;
  const { fightStart, fightEnd } = info;
  const windows = activeWindows ?? [{ startTime: fightStart, endTime: fightEnd }];
  const spellCasts = castEfficiency.getCastEfficiencyForSpellId(spell.id);
  const efficiency = spellCasts?.efficiency ?? 0;
  const actualCasts = spellCasts?.casts ?? 0;
  const possibleCasts = spellCasts?.maxCasts ?? 0;

  // Determine stat card color based on efficiency thresholds
  const getEfficiencyColor = (): string => {
    if (efficiencyColor !== 'white') {
      // If a specific color was provided, use it
      return efficiencyColor;
    }

    if (!spellCasts) {
      return 'white';
    }

    const { majorIssueEfficiency, averageIssueEfficiency, recommendedEfficiency } = spellCasts;

    // Color based on efficiency thresholds
    if (efficiency < majorIssueEfficiency) {
      return '#dc2626'; // Red - major issue
    } else if (efficiency < averageIssueEfficiency) {
      return '#fb923c'; // Orange - average issue
    } else if (efficiency < recommendedEfficiency) {
      return '#fbbf24'; // Yellow - minor issue
    } else {
      return '#22c55e'; // Green - good
    }
  };

  const statColor = getEfficiencyColor();

  // Calculate performance ranges from abilities thresholds
  // Only show performance ranges if we have actual threshold data
  const performanceRanges: PerformanceRange[] | undefined = spellCasts
    ? [
        {
          width: spellCasts.majorIssueEfficiency * 100,
          color: 'rgba(220, 38, 38, 0.15)',
        }, // Bad (red)
        {
          width: (spellCasts.averageIssueEfficiency - spellCasts.majorIssueEfficiency) * 100,
          color: 'rgba(251, 191, 36, 0.15)',
        }, // Mediocre (yellow)
        {
          width: (spellCasts.recommendedEfficiency - spellCasts.averageIssueEfficiency) * 100,
          color: 'rgba(251, 146, 60, 0.15)',
        }, // Ok (orange)
        {
          width: (1 - spellCasts.recommendedEfficiency) * 100,
          color: 'rgba(34, 197, 94, 0.15)',
        }, // Good (green)
      ].filter((range) => range.width > 0)
    : undefined;

  // Calculate time spent capped at max charges (for charge-based abilities)
  const calculateWastedTime = (): number => {
    if (!hasCharges || !eventHistory) return 0;

    // Helper to check if event is a charge use
    const isChargeUse = (updateType: UpdateSpellUsableType) =>
      updateType === UpdateSpellUsableType.UseCharge ||
      updateType === UpdateSpellUsableType.BeginCooldown;

    // Helper to check if event is a charge restore
    const isChargeRestore = (updateType: UpdateSpellUsableType) =>
      updateType === UpdateSpellUsableType.RestoreCharge ||
      updateType === UpdateSpellUsableType.EndCooldown;

    let wastedTime = 0;

    windows.forEach((window) => {
      const windowStart = window.startTime;
      const windowEnd = window.endTime;

      const updateEvents: UpdateSpellUsableEvent[] = eventHistory.getEvents(
        EventType.UpdateSpellUsable,
        { spell: spell, searchBackwards: false },
      );

      updateEvents.sort((a, b) => {
        if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
        const orderA = isChargeUse(a.updateType) ? 0 : 1;
        const orderB = isChargeUse(b.updateType) ? 0 : 1;
        return orderA - orderB;
      });

      // Filter out simultaneous use/restore events
      const filteredEvents: UpdateSpellUsableEvent[] = [];
      for (let i = 0; i < updateEvents.length; i++) {
        const event = updateEvents[i];
        const nextEvent = updateEvents[i + 1];

        if (
          nextEvent &&
          event.timestamp === nextEvent.timestamp &&
          isChargeUse(event.updateType) &&
          isChargeRestore(nextEvent.updateType)
        ) {
          i++;
          continue;
        }

        filteredEvents.push(event);
      }

      // Calculate initial charges before window
      let currentCharges = maxCharges;
      filteredEvents.forEach((event) => {
        if (event.timestamp < windowStart) {
          if (isChargeUse(event.updateType)) {
            currentCharges = Math.max(0, currentCharges - 1);
          } else if (event.updateType === UpdateSpellUsableType.RestoreCharge) {
            currentCharges = Math.min(maxCharges, currentCharges + 1);
          } else if (event.updateType === UpdateSpellUsableType.EndCooldown) {
            currentCharges = maxCharges;
          }
        }
      });

      const chargeEvents = filteredEvents.filter(
        (e) => e.timestamp >= windowStart && e.timestamp <= windowEnd,
      );

      let chargesAvailable = currentCharges;
      let segmentStart = windowStart;
      let wasCapped = chargesAvailable === maxCharges;

      chargeEvents.forEach((event) => {
        if (wasCapped && event.timestamp > segmentStart) {
          wastedTime += event.timestamp - segmentStart;
        }

        if (isChargeUse(event.updateType)) {
          chargesAvailable = Math.max(0, chargesAvailable - 1);
        } else if (event.updateType === UpdateSpellUsableType.RestoreCharge) {
          chargesAvailable = Math.min(maxCharges, chargesAvailable + 1);
        } else if (event.updateType === UpdateSpellUsableType.EndCooldown) {
          chargesAvailable = maxCharges;
        }

        wasCapped = chargesAvailable === maxCharges;
        segmentStart = event.timestamp;
      });

      if (wasCapped && windowEnd > segmentStart) {
        wastedTime += windowEnd - segmentStart;
      }
    });

    return wastedTime;
  };

  const wastedTime = calculateWastedTime();
  const wastedSeconds = Math.round(wastedTime / 1000);

  // Generate explanation text
  const explanation = hasCharges ? (
    <HelperText>
      Shows charges of <SpellLink spell={spell} /> used vs possible. Time capped shows how long you
      were at maximum charges.
    </HelperText>
  ) : (
    <HelperText>
      Shows cast efficiency for <SpellLink spell={spell} />. Red highlighted areas indicate times
      when the spell was available but not cast.
    </HelperText>
  );

  // Build stats cards
  const statCards = hasCharges ? (
    <>
      <Tooltip content={`Cast ${actualCasts} out of ${possibleCasts} possible times`}>
        <StatCard color={statColor}>
          <StatValue>{formatPercentage(efficiency, 0)}%</StatValue>
          <StatLabel>Efficiency</StatLabel>
        </StatCard>
      </Tooltip>
      <Tooltip content={`Time spent at maximum charges: ${formatDuration(wastedTime)}`}>
        <StatCard color={specColor}>
          <StatValue>{wastedSeconds}s</StatValue>
          <StatLabel>Time Capped</StatLabel>
        </StatCard>
      </Tooltip>
    </>
  ) : (
    <Tooltip content={`Cast ${actualCasts} out of ${possibleCasts} possible times`}>
      <StatCard color={statColor}>
        <StatValue>{formatPercentage(efficiency, 0)}%</StatValue>
        <StatLabel>Efficiency</StatLabel>
      </StatCard>
    </Tooltip>
  );

  const ribbon = hasCharges ? (
    <BulletGraph
      actual={actualCasts}
      maximum={possibleCasts}
      actualLabel={`${actualCasts} casts`}
      maximumLabel={`Max ${possibleCasts}`}
      barColor={specColor}
      performanceRanges={performanceRanges}
    />
  ) : (
    <TimelineWrapper>
      <SegmentedTimeline
        windows={windows}
        segments={createCooldownSegments(spell.id, events, windows, specColor)}
        markers={createCastMarkers(spell.id, events, windows)}
      />
    </TimelineWrapper>
  );

  // Build title - just spell name for both modes
  const title = spell.name;

  // Render with GuideDataWrapper
  return (
    <GuideDataWrapper
      title={title}
      subtitle={hasCharges ? 'Charge Usage' : 'Cast Efficiency'}
      stats={statCards}
      helperText={showExplanation ? explanation : undefined}
      compact={compactLayout}
    >
      {compactLayout ? ribbon : <RibbonContainer>{ribbon}</RibbonContainer>}
    </GuideDataWrapper>
  );
}
