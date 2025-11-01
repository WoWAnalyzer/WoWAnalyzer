import styled from '@emotion/styled';
import { SpellLink, Tooltip } from 'interface';
import { useAnalyzer, useInfo, useEvents } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Abilities from 'parser/core/modules/Abilities';
import EventHistory from 'parser/shared/modules/EventHistory';
import { formatPercentage } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import { StatCard, StatValue, StatLabel, HelperText } from './GuideDivs';
import GuideDataWrapper from './GuideDataWrapper';
import { EventType, UpdateSpellUsableEvent, UpdateSpellUsableType } from 'parser/core/Events';
import BulletGraph, { PerformanceRange } from './BulletGraph';
import { CooldownWindow } from 'parser/ui/CooldownBar';
import CooldownTimeline from './CooldownTimeline';

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

interface Props {
  /** The spell to show cooldown bars for - this must match the ID of the spell's cast event */
  spell: Spell;
  /** If provided, shows explanatory text above the cooldown bar */
  showExplanation?: boolean;
  /** Color to use for the efficiency stat card. If not provided, uses white. */
  efficiencyColor?: string;
  /** Color to use for cooldown windows (when spell is on CD). Defaults to #fab700 (orange). */
  cooldownColor?: string;
  /** Color to use for wasted time indicator (charge-based abilities). If not provided, uses cooldownColor. */
  wastedTimeColor?: string;
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
 *
 * - For charge abilities: Shows a horizontal bar with filled/empty segments
 * - For cooldown abilities: Shows a ribbon timeline with gaps showing availability
 */
export default function CastEfficiencyRibbon({
  spell,
  showExplanation = false,
  efficiencyColor = 'white',
  cooldownColor = '#fab700',
  wastedTimeColor,
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
  const { fightStart, fightEnd, fightDuration } = info;
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

  // Calculate performance ranges from ability efficiency thresholds
  const getPerformanceRanges = (): PerformanceRange[] => {
    if (!spellCasts) {
      // Default ranges if no cast efficiency data
      return [
        { width: 75, color: 'rgba(220, 38, 38, 0.15)' }, // Bad (red)
        { width: 15, color: 'rgba(251, 191, 36, 0.15)' }, // Mediocre (yellow)
        { width: 10, color: 'rgba(34, 197, 94, 0.15)' }, // Good (green)
      ];
    }

    const { majorIssueEfficiency, averageIssueEfficiency, recommendedEfficiency } = spellCasts;

    // Convert efficiency thresholds (0-1) to percentage widths
    // Ranges represent: [0 to majorIssue], [majorIssue to average], [average to recommended], [recommended to 100]
    const badWidth = majorIssueEfficiency * 100;
    const mediocreWidth = (averageIssueEfficiency - majorIssueEfficiency) * 100;
    const okWidth = (recommendedEfficiency - averageIssueEfficiency) * 100;
    const goodWidth = (1 - recommendedEfficiency) * 100;

    return [
      { width: badWidth, color: 'rgba(220, 38, 38, 0.15)' }, // Bad (red)
      { width: mediocreWidth, color: 'rgba(251, 191, 36, 0.15)' }, // Mediocre (yellow)
      { width: okWidth, color: 'rgba(251, 146, 60, 0.15)' }, // Ok (orange)
      { width: goodWidth, color: 'rgba(34, 197, 94, 0.15)' }, // Good (green)
    ].filter((range) => range.width > 0); // Filter out any zero-width ranges
  };

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
  const statCards = (
    <Tooltip
      content={
        hasCharges
          ? `Efficiency: ${formatPercentage(efficiency, 1)}%`
          : `Cast ${actualCasts} out of ${possibleCasts} possible times`
      }
    >
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
      barColor={cooldownColor}
      performanceRanges={getPerformanceRanges()}
      secondaryMetric={
        wastedSeconds > 0
          ? {
              value: (wastedTime / fightDuration) * 100,
              label: `${wastedSeconds}s capped`,
              color: wastedTimeColor || cooldownColor,
            }
          : undefined
      }
    />
  ) : (
    <TimelineWrapper>
      <CooldownTimeline
        spellId={spell.id}
        events={events}
        fightStart={fightStart}
        fightEnd={fightEnd}
        fightDuration={fightDuration}
        windows={windows}
        cooldownColor={cooldownColor}
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
