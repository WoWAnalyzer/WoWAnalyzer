import type { JSX } from 'react';
import styled from '@emotion/styled';
import { SpellLink, Tooltip } from 'interface';
import { useAnalyzer, useInfo, useEvents } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Abilities from 'parser/core/modules/Abilities';
import EventHistory from 'parser/shared/modules/EventHistory';
import { formatPercentage, formatDuration } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import GuideDataWrapper, { HelperText } from './GuideDataWrapper';
import { EventType, UpdateSpellUsableEvent, UpdateSpellUsableType } from 'parser/core/Events';
import BulletGraph, { PerformanceRange } from './BulletGraph';
import { CooldownWindow } from 'parser/ui/CooldownBar';
import SegmentedTimeline, { TimelineSegment, TimelineMarker } from './SegmentedTimeline';
import { BAD_COLOR, getSpecColor } from 'interface/guide/colors';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastDetail, {
  type PerCastData,
  StatCard,
  StatCardValue,
  StatCardDivider,
  StatCardLabel,
} from './CastDetail';

// Styled Components
const RibbonContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 8px;
`;

/** Slim overview timeline strip shown above the per-cast cards in detail view */
const MiniTimelineWrapper = styled.div`
  width: 100%;
  height: 28px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 4px 8px;
  box-sizing: border-box;
`;

/** Container for the main timeline + the waste bar beneath it in Option B */
const TimelineStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

/** Track for the waste bar */
const WasteBarTrack = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

/** Filled portion of the waste bar */
const WasteBarFill = styled.div<{ pct: number; color: string }>`
  height: 100%;
  width: ${(p) => p.pct}%;
  background: ${(p) => p.color};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const WasteBarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 2px;
`;

// ── Option C styled components ─────────────────────────────────────────────

/** Stacked list of phase rows */
const PhaseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
`;

/** Single phase row: label chip | timeline bar */
const PhaseRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

/** Left chip: phase number + cast count, colored by performance */
const PhaseChip = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid ${(p) => p.color}60;
  border-radius: 4px;
  background: ${(p) => p.color}18;
  flex-shrink: 0;
  width: 130px;
  overflow: hidden;
`;

const PhaseChipLabel = styled.div`
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.55);
  padding: 4px 8px;
  white-space: nowrap;
`;

const PhaseChipValue = styled.div<{ color: string }>`
  font-size: 1rem;
  font-weight: 700;
  color: ${(p) => p.color};
  padding: 4px 8px;
  border-right: 1px solid ${(p) => p.color}40;
  flex-shrink: 0;
`;

const PhaseChipDivider = styled.div<{ color: string }>`
  width: 1px;
  height: 55%;
  background: ${(p) => p.color}35;
  align-self: center;
`;

/** Timeline wrapper for a single phase row */
const PhaseTimelineWrapper = styled.div`
  flex: 1;
  height: 28px;
  display: flex;
  align-items: center;
`;

// ── Option D styled components ────────────────────────────────────────────

/** Outer track container — positions dots and dead-zone regions */
const DotTrack = styled.div`
  position: relative;
  width: 100%;
  height: 48px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  overflow: visible;
`;

/** Ticks along the bottom of the track showing time labels */
const TrackAxis = styled.div`
  position: relative;
  width: 100%;
  height: 18px;
  margin-top: 2px;
`;

/** A faint background strip over an availability gap (spell ready, not cast) */
const DeadZone = styled.div<{ left: number; width: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${(p) => p.left}%;
  width: ${(p) => p.width}%;
  background: rgba(220, 38, 38, 0.18);
  border-radius: 2px;
  pointer-events: none;
`;

/** A cast dot — circle colored by delay performance */
const CastDot = styled.div<{ left: number; color: string }>`
  position: absolute;
  top: 50%;
  left: ${(p) => p.left}%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${(p) => p.color};
  border: 2px solid rgba(0, 0, 0, 0.4);
  cursor: default;
  z-index: 1;
  transition: transform 0.1s ease;
  &:hover {
    transform: translate(-50%, -50%) scale(1.35);
    z-index: 2;
  }
`;

/** Small tick mark + label on the time axis */
const AxisTick = styled.div<{ left: number }>`
  position: absolute;
  left: ${(p) => p.left}%;
  top: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
`;

const AxisTickLine = styled.div`
  width: 1px;
  height: 5px;
  background: rgba(255, 255, 255, 0.2);
`;

const AxisTickLabel = styled.div`
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.3);
  white-space: nowrap;
`;

// ── Option A helpers ────────────────────────────────────────────────────────

/** Rate a cast-availability delay (ms) as a QualitativePerformance */
function delayPerformance(delayMs: number): QualitativePerformance {
  if (delayMs < 2000) return QualitativePerformance.Perfect;
  if (delayMs < 5000) return QualitativePerformance.Good;
  if (delayMs < 10000) return QualitativePerformance.Ok;
  return QualitativePerformance.Fail;
}

/** Human-readable description of the delay */
function delayDescription(delayMs: number, spellName: string): string {
  const d = formatDuration(delayMs);
  if (delayMs < 2000) {
    return `Cast immediately after ${spellName} became available — perfect timing.`;
  }
  if (delayMs < 5000) {
    return `Cast ${d} after ${spellName} became available — good, but a slight delay.`;
  }
  if (delayMs < 10000) {
    return `Cast ${d} after ${spellName} became available — noticeable delay, try to cast sooner.`;
  }
  return `Cast ${d} after ${spellName} became available — significant delay, this is a clear missed opportunity.`;
}

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
  /** If true, shows cast efficiency thresholds as a sub-bar (charge abilities only) */
  showThresholds?: boolean;
  /**
   * Windows where the spell is actually usable. Useful for execute spells or phase-specific abilities.
   * If not specified, defaults to the whole fight.
   */
  activeWindows?: CooldownWindow[];
  /**
   * Layout variant:
   * - 'ribbon'          (default) — horizontal timeline bar with stat card header
   * - 'detail'          (Option A) — mini overview bar + per-cast navigator with delay ratings
   * - 'waste-bar'       (Option B) — ribbon + total casts card + thin wasted-availability strip below
   * - 'phase-segmented' (Option C) — vertically stacked rows, one per active window, each with its own mini-timeline and cast chip
   * - 'dot-chart'       (Option D) — dot scatter on a fight-wide axis; dot color = cast delay rating
   * - 'dual-bar'               — main bar (yellow, on-cooldown) + slim subbar (red, available-not-cast)
   */
  layout?: 'ribbon' | 'detail' | 'waste-bar' | 'phase-segmented' | 'dot-chart' | 'dual-bar';
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
 * @param showThresholds - If true, shows efficiency thresholds as a sub-bar for charge abilities (default: false)
 * @param activeWindows - Time windows when spell is usable (default: whole fight)
 */
export default function CastEfficiencyRibbon({
  spell,
  showExplanation = false,
  efficiencyColor = 'white',
  compactLayout = false,
  showThresholds = false,
  activeWindows,
  layout = 'ribbon',
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
      <GuideDataWrapper bare title={`${spell.name} - Error`} compact={compactLayout}>
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
      return '#dc2626'; // Red - fail
    } else if (efficiency < averageIssueEfficiency) {
      return '#fbbf24'; // Yellow - ok
    } else if (efficiency <= recommendedEfficiency) {
      return '#22c55e'; // Green - good
    } else {
      return '#3b82f6'; // Blue - perfect
    }
  };

  const statColor = getEfficiencyColor();

  // Calculate performance ranges from abilities thresholds
  // Only show performance ranges if we have actual threshold data
  const performanceRanges: PerformanceRange[] | undefined = spellCasts
    ? [
        {
          width: spellCasts.majorIssueEfficiency * 100,
          color: 'rgba(220, 38, 38, 0.5)',
        }, // Fail (red)
        {
          width: (spellCasts.averageIssueEfficiency - spellCasts.majorIssueEfficiency) * 100,
          color: 'rgba(251, 191, 36, 0.5)',
        }, // OK (yellow)
        {
          width: (spellCasts.recommendedEfficiency - spellCasts.averageIssueEfficiency) * 100,
          color: 'rgba(34, 197, 94, 0.5)',
        }, // Good (green)
        {
          width: (1 - spellCasts.recommendedEfficiency) * 100,
          color: 'rgba(59, 130, 246, 0.5)',
        }, // Perfect (blue)
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
          <StatCardValue color={statColor}>{formatPercentage(efficiency, 0)}%</StatCardValue>
          <StatCardDivider color={statColor} />
          <StatCardLabel>Efficiency</StatCardLabel>
        </StatCard>
      </Tooltip>
      <Tooltip content={`Time spent at maximum charges: ${formatDuration(wastedTime)}`}>
        <StatCard color={specColor}>
          <StatCardValue color={specColor}>{wastedSeconds}s</StatCardValue>
          <StatCardDivider color={specColor} />
          <StatCardLabel>Time Capped</StatCardLabel>
        </StatCard>
      </Tooltip>
    </>
  ) : (
    <Tooltip content={`Cast ${actualCasts} out of ${possibleCasts} possible times`}>
      <StatCard color={statColor}>
        <StatCardValue color={statColor}>{formatPercentage(efficiency, 0)}%</StatCardValue>
        <StatCardDivider color={statColor} />
        <StatCardLabel>Efficiency</StatCardLabel>
      </StatCard>
    </Tooltip>
  );

  // ── Dual-bar SVG (default visualization for non-charge spells) ────────
  const DB_YELLOW = '#fbbf24';
  const DB_RED = '#ef4444';
  const DB_PIN_COLOR = '#00d9ff';
  const dbTotalMs = fightEnd - fightStart;
  const dbAllSegs = createCooldownSegments(spell.id, events, windows, DB_YELLOW);
  const dbCdSegs = dbAllSegs.filter((s) => s.color !== BAD_COLOR);
  const dbAvailSegs = dbAllSegs.filter((s) => s.color === BAD_COLOR);
  const dbCastTs = events
    .filter(
      (e) =>
        e.type === EventType.Cast &&
        e.ability.guid === spell.id &&
        windows.some((w) => e.timestamp >= w.startTime && e.timestamp <= w.endTime),
    )
    .map((e) => e.timestamp);

  const DB_MARKER_PAD = 8;
  const DB_MAIN_H = 14;
  const DB_SUB_H = 7;
  const DB_SVG_H = DB_MARKER_PAD + DB_MAIN_H + DB_SUB_H;
  const DB_MAIN_TOP = DB_MARKER_PAD;
  const DB_SUB_TOP = DB_MARKER_PAD + DB_MAIN_H;
  const DB_SVG_W = 100;
  const DB_PIN_W = 0.5;
  const DB_PIN_H = 9;
  const DB_PIN_OFF_Y = 3;

  const dbToX = (ts: number) => ((ts - fightStart) / dbTotalMs) * DB_SVG_W;

  const dbRenderSegs = (segs: typeof dbAllSegs, barY: number, barH: number, color: string) =>
    segs.map((seg, i) => {
      const x = dbToX(seg.start);
      const w = Math.max(0.2, dbToX(seg.end) - x);
      return (
        <rect key={i} x={x} y={barY} width={w} height={barH} fill={color}>
          <title>{seg.label ?? ''}</title>
        </rect>
      );
    });

  const dbPinElems = dbCastTs.map((ts, i) => {
    const mx = dbToX(ts);
    const teardrop = `
      M ${mx} ${DB_PIN_H + DB_PIN_OFF_Y}
      Q ${mx - DB_PIN_W} ${DB_PIN_H * 0.6 + DB_PIN_OFF_Y} ${mx - DB_PIN_W} ${DB_PIN_H * 0.3 + DB_PIN_OFF_Y}
      A ${DB_PIN_W} ${DB_PIN_H * 0.3} 0 1 1 ${mx + DB_PIN_W} ${DB_PIN_H * 0.3 + DB_PIN_OFF_Y}
      Q ${mx + DB_PIN_W} ${DB_PIN_H * 0.6 + DB_PIN_OFF_Y} ${mx} ${DB_PIN_H + DB_PIN_OFF_Y}
      Z
    `;
    const label = `Cast at ${formatDuration(ts - fightStart)}`;
    return (
      <g key={i}>
        <title>{label}</title>
        <path
          d={teardrop}
          fill={DB_PIN_COLOR}
          stroke="#006b80"
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          paintOrder="stroke"
        />
        <line
          x1={mx}
          y1={DB_PIN_H}
          x2={mx}
          y2={DB_SVG_H}
          stroke={DB_PIN_COLOR}
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
          opacity={1}
        />
      </g>
    );
  });

  const dualBarSvg = (
    <svg
      width="100%"
      height={DB_SVG_H}
      preserveAspectRatio="none"
      viewBox={`0 0 ${DB_SVG_W} ${DB_SVG_H}`}
      style={{ display: 'block' }}
    >
      <rect
        x={0}
        y={DB_MAIN_TOP}
        width={DB_SVG_W}
        height={DB_MAIN_H}
        fill="rgba(255,255,255,0.08)"
      />
      <rect x={0} y={DB_SUB_TOP} width={DB_SVG_W} height={DB_SUB_H} fill="rgba(255,255,255,0.05)" />
      {dbRenderSegs(dbCdSegs, DB_MAIN_TOP, DB_MAIN_H, DB_YELLOW)}
      {dbRenderSegs(dbAvailSegs, DB_SUB_TOP, DB_SUB_H, DB_RED)}
      {dbPinElems}
    </svg>
  );

  const ribbon = hasCharges ? (
    <BulletGraph
      actual={actualCasts}
      maximum={possibleCasts}
      actualLabel={
        showThresholds ? `${actualCasts}/${possibleCasts} casts` : `${actualCasts} casts`
      }
      maximumLabel={`Max ${possibleCasts}`}
      barColor={specColor}
      performanceRanges={performanceRanges}
      showThresholdBar={showThresholds}
      missedCasts={showThresholds ? possibleCasts - actualCasts : undefined}
    />
  ) : (
    dualBarSvg
  );
  // ── Dual-bar view (explicit layout prop — kept for backwards compat) ───
  if (layout === 'dual-bar') {
    const totalMs = fightEnd - fightStart;

    // Get all segments from the helper, then split by purpose
    const YELLOW = '#fbbf24';
    const RED = '#ef4444';
    const allSegs = createCooldownSegments(spell.id, events, windows, YELLOW);

    // Main bar: only the on-cooldown (yellow) segments
    const cdSegs = allSegs.filter((s) => s.color !== BAD_COLOR);
    // Sub-bar: only the available-but-not-cast (bad) segments
    const availSegs = allSegs.filter((s) => s.color === BAD_COLOR);

    // Cast timestamps
    const castTimestamps = events
      .filter(
        (e) =>
          e.type === EventType.Cast &&
          e.ability.guid === spell.id &&
          windows.some((w) => e.timestamp >= w.startTime && e.timestamp <= w.endTime),
      )
      .map((e) => e.timestamp);

    // SVG coordinate system (viewBox 0 0 100 H)
    const markerPad = 8; // space above bars for pin heads
    const mainBarH = 14;
    const subBarH = 7;
    const svgH = markerPad + mainBarH + subBarH;
    const mainBarTop = markerPad;
    const subBarTop = markerPad + mainBarH;
    const svgW = 100;

    // Teardrop pin geometry (same as SegmentedTimeline)
    const pinW = 0.5;
    const pinH = 9;
    const pinOffY = 3;

    const toX = (ts: number) => ((ts - fightStart) / totalMs) * svgW;

    const renderSegs = (segs: typeof allSegs, barY: number, barH: number, color: string) =>
      segs.map((seg, i) => {
        const x = toX(seg.start);
        const w = Math.max(0.2, toX(seg.end) - x);
        return (
          <rect key={i} x={x} y={barY} width={w} height={barH} fill={color}>
            <title>{seg.label ?? ''}</title>
          </rect>
        );
      });

    const pinElements = castTimestamps.map((ts, i) => {
      const mx = toX(ts);
      const teardrop = `
        M ${mx} ${pinH + pinOffY}
        Q ${mx - pinW} ${pinH * 0.6 + pinOffY} ${mx - pinW} ${pinH * 0.3 + pinOffY}
        A ${pinW} ${pinH * 0.3} 0 1 1 ${mx + pinW} ${pinH * 0.3 + pinOffY}
        Q ${mx + pinW} ${pinH * 0.6 + pinOffY} ${mx} ${pinH + pinOffY}
        Z
      `;
      const label = `Cast at ${formatDuration(ts - fightStart)}`;
      return (
        <g key={i}>
          <title>{label}</title>
          <path
            d={teardrop}
            fill="#00d9ff"
            stroke="#006b80"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
            paintOrder="stroke"
          />
          <line
            x1={mx}
            y1={pinH}
            x2={mx}
            y2={svgH}
            stroke="#00d9ff"
            strokeWidth={2.5}
            vectorEffect="non-scaling-stroke"
            opacity={1}
          />
        </g>
      );
    });

    const dualStack = (
      <svg
        width="100%"
        height={svgH}
        preserveAspectRatio="none"
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: 'block' }}
      >
        {/* Background tracks */}
        <rect x={0} y={mainBarTop} width={svgW} height={mainBarH} fill="rgba(255,255,255,0.08)" />
        <rect x={0} y={subBarTop} width={svgW} height={subBarH} fill="rgba(255,255,255,0.05)" />
        {/* CD segments (yellow) */}
        {renderSegs(cdSegs, mainBarTop, mainBarH, YELLOW)}
        {/* Available-not-cast segments (red) */}
        {renderSegs(availSegs, subBarTop, subBarH, RED)}
        {/* Cast pins on top */}
        {pinElements}
      </svg>
    );

    return (
      <GuideDataWrapper
        bare
        title={spell.name}
        subtitle={hasCharges ? 'Charge Usage' : 'Cast Efficiency'}
        stats={statCards}
        compact={compactLayout}
        icon={compactLayout ? spell.icon : undefined}
      >
        {compactLayout ? dualStack : <RibbonContainer>{dualStack}</RibbonContainer>}
      </GuideDataWrapper>
    );
  }

  // ── Option D: dot-chart view ───────────────────────────────────────────
  if (layout === 'dot-chart') {
    const totalMs = fightEnd - fightStart;
    const toPct = (ts: number) => ((ts - fightStart) / totalMs) * 100;

    // Collect cast events across all windows
    const castEvents = events
      .filter(
        (e) =>
          e.type === EventType.Cast &&
          e.ability.guid === spell.id &&
          windows.some((w) => e.timestamp >= w.startTime && e.timestamp <= w.endTime),
      )
      .sort((a, b) => a.timestamp - b.timestamp);

    // Find when the spell became available each time
    const availabilityEvents = events.filter(
      (e): e is UpdateSpellUsableEvent =>
        e.type === EventType.UpdateSpellUsable &&
        e.ability.guid === spell.id &&
        (e.updateType === UpdateSpellUsableType.EndCooldown ||
          e.updateType === UpdateSpellUsableType.RestoreCharge),
    );

    // Build dead-zone strips: spell available but not cast
    const deadZones: { left: number; width: number; label: string }[] = [];
    if (!hasCharges) {
      createCooldownSegments(spell.id, events, windows, specColor).forEach((seg) => {
        if (seg.color === BAD_COLOR) {
          const left = toPct(seg.start);
          const width = toPct(seg.end) - left;
          if (width > 0.3) {
            deadZones.push({
              left,
              width,
              label: seg.label ?? '',
            });
          }
        }
      });
    }

    // Build dots for each cast
    const dots = castEvents.map((cast, i) => {
      const lastAvail = availabilityEvents
        .filter((e) => e.timestamp <= cast.timestamp)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      const windowStart =
        windows.find((w) => cast.timestamp >= w.startTime && cast.timestamp <= w.endTime)
          ?.startTime ?? fightStart;
      const availableAt = lastAvail?.timestamp ?? windowStart;
      const delayMs = Math.max(0, cast.timestamp - availableAt);
      const perf = delayPerformance(delayMs);
      const dotColor =
        perf === QualitativePerformance.Perfect
          ? '#4ec9a2'
          : perf === QualitativePerformance.Good
            ? '#9ece6a'
            : perf === QualitativePerformance.Ok
              ? '#fbbf24'
              : '#dc2626';
      const leftPct = toPct(cast.timestamp);
      return (
        <Tooltip
          key={i}
          content={
            <>
              Cast {i + 1} at {formatDuration(cast.timestamp - fightStart)}
              <br />
              Delay: {delayMs < 1000 ? '<1s' : formatDuration(delayMs)}
              <br />
              {delayDescription(delayMs, spell.name)}
            </>
          }
        >
          <CastDot left={leftPct} color={dotColor} />
        </Tooltip>
      );
    });

    // Axis ticks: every ~20% of fight
    const tickCount = 5;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
      const pct = (i / tickCount) * 100;
      const ts = fightStart + (totalMs * i) / tickCount;
      return (
        <AxisTick key={i} left={pct}>
          <AxisTickLine />
          <AxisTickLabel>{formatDuration(ts - fightStart)}</AxisTickLabel>
        </AxisTick>
      );
    });

    // Legend
    const legend = (
      <div
        style={{
          display: 'flex',
          gap: 14,
          marginTop: 8,
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.5)',
          alignItems: 'center',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>DELAY:</span>
        {(
          [
            ['#4ec9a2', '<2s perfect'],
            ['#9ece6a', '2–5s good'],
            ['#fbbf24', '5–10s ok'],
            ['#dc2626', '>10s bad'],
          ] as const
        ).map(([color, label]) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: color,
                display: 'inline-block',
                border: '2px solid rgba(0,0,0,0.3)',
              }}
            />
            {label}
          </span>
        ))}
        {!hasCharges && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                width: 14,
                height: 10,
                borderRadius: 2,
                background: 'rgba(220,38,38,0.35)',
                display: 'inline-block',
              }}
            />
            available
          </span>
        )}
      </div>
    );

    return (
      <GuideDataWrapper bare title={spell.name} subtitle="Cast Delay" stats={statCards}>
        <RibbonContainer>
          <DotTrack>
            {deadZones.map((dz, i) => (
              <Tooltip key={i} content={dz.label}>
                <DeadZone left={dz.left} width={dz.width} />
              </Tooltip>
            ))}
            {dots}
          </DotTrack>
          <TrackAxis>{ticks}</TrackAxis>
          {legend}
        </RibbonContainer>
      </GuideDataWrapper>
    );
  }
  // ── Option C: phase-segmented view ─────────────────────────────────────
  if (layout === 'phase-segmented') {
    // Per-window cast counts
    const windowRows = windows.map((window, idx) => {
      const windowCasts = events.filter(
        (e) =>
          e.type === EventType.Cast &&
          e.ability.guid === spell.id &&
          e.timestamp >= window.startTime &&
          e.timestamp <= window.endTime,
      );

      const castCount = windowCasts.length;
      const windowDurationMs = window.endTime - window.startTime;

      // Color: green if at least one cast, red if zero, yellow if cast count seems low
      const rowColor = castCount === 0 ? '#dc2626' : castCount >= 2 ? '#22c55e' : '#fbbf24';

      const windowSegs = createCooldownSegments(spell.id, events, [window], specColor);
      const windowMarkers = createCastMarkers(spell.id, events, [window]);

      const phaseLabel = `P${idx + 1}  ${formatDuration(window.startTime - fightStart)}`;

      return (
        <PhaseRow key={idx}>
          <Tooltip
            content={
              <>
                Phase {idx + 1} — {formatDuration(window.startTime - fightStart)} to{' '}
                {formatDuration(window.endTime - fightStart)}
                <br />
                Duration: {formatDuration(windowDurationMs)}
                <br />
                Casts: {castCount}
              </>
            }
          >
            <PhaseChip color={rowColor}>
              <PhaseChipValue color={rowColor}>{castCount}</PhaseChipValue>
              <PhaseChipDivider color={rowColor} />
              <PhaseChipLabel>{phaseLabel}</PhaseChipLabel>
            </PhaseChip>
          </Tooltip>
          <PhaseTimelineWrapper>
            <SegmentedTimeline windows={[window]} segments={windowSegs} markers={windowMarkers} />
          </PhaseTimelineWrapper>
        </PhaseRow>
      );
    });

    return (
      <GuideDataWrapper bare title={spell.name} subtitle="Cast Efficiency" stats={statCards}>
        <RibbonContainer>
          <PhaseList>{windowRows}</PhaseList>
        </RibbonContainer>
      </GuideDataWrapper>
    );
  }

  // ── Option B: waste-bar view ────────────────────────────────────────────
  if (layout === 'waste-bar') {
    const totalWindowMs = windows.reduce((sum, w) => sum + (w.endTime - w.startTime), 0);

    // Compute wasted (available-but-not-cast) ms
    let wastedAvailMs = 0;
    if (hasCharges) {
      wastedAvailMs = wastedTime;
    } else {
      createCooldownSegments(spell.id, events, windows, specColor).forEach((seg) => {
        if (seg.color === BAD_COLOR) {
          wastedAvailMs += seg.end - seg.start;
        }
      });
    }
    const wastePct = totalWindowMs > 0 ? Math.min(100, (wastedAvailMs / totalWindowMs) * 100) : 0;
    const wastedSec = Math.round(wastedAvailMs / 1000);

    // Waste bar color mirrors efficiency: good if low waste, bad if high
    const wasteColor = wastePct < 10 ? '#22c55e' : wastePct < 25 ? '#fbbf24' : '#dc2626';

    const statCardsB = hasCharges ? (
      <>
        <Tooltip content={`Cast ${actualCasts} out of ${possibleCasts} possible times`}>
          <StatCard color={statColor}>
            <StatCardValue color={statColor}>{formatPercentage(efficiency, 0)}%</StatCardValue>
            <StatCardDivider color={statColor} />
            <StatCardLabel>Efficiency</StatCardLabel>
          </StatCard>
        </Tooltip>
        <Tooltip content={`Time spent at maximum charges: ${formatDuration(wastedTime)}`}>
          <StatCard color={specColor}>
            <StatCardValue color={specColor}>{wastedSeconds}s</StatCardValue>
            <StatCardDivider color={specColor} />
            <StatCardLabel>Time Capped</StatCardLabel>
          </StatCard>
        </Tooltip>
        <Tooltip content={`Total casts of ${spell.name} during the encounter`}>
          <StatCard color="#ffffff">
            <StatCardValue color="#ffffff">{actualCasts}</StatCardValue>
            <StatCardDivider color="#ffffff" />
            <StatCardLabel>Total Casts</StatCardLabel>
          </StatCard>
        </Tooltip>
      </>
    ) : (
      <>
        <Tooltip content={`Cast ${actualCasts} out of ${possibleCasts} possible times`}>
          <StatCard color={statColor}>
            <StatCardValue color={statColor}>{formatPercentage(efficiency, 0)}%</StatCardValue>
            <StatCardDivider color={statColor} />
            <StatCardLabel>Efficiency</StatCardLabel>
          </StatCard>
        </Tooltip>
        <Tooltip content={`Total casts of ${spell.name} during the encounter`}>
          <StatCard color="#ffffff">
            <StatCardValue color="#ffffff">{actualCasts}</StatCardValue>
            <StatCardDivider color="#ffffff" />
            <StatCardLabel>Total Casts</StatCardLabel>
          </StatCard>
        </Tooltip>
      </>
    );

    return (
      <GuideDataWrapper
        bare
        title={spell.name}
        subtitle={hasCharges ? 'Charge Usage' : 'Cast Efficiency'}
        stats={statCardsB}
      >
        <RibbonContainer>
          <TimelineStack>
            {ribbon}
            <div>
              <WasteBarTrack>
                <WasteBarFill pct={wastePct} color={wasteColor} />
              </WasteBarTrack>
              <WasteBarLabel>
                <span>WASTED AVAILABILITY</span>
                <span>
                  {wastedSec}s ({formatPercentage(wastePct / 100, 1)}%)
                </span>
              </WasteBarLabel>
            </div>
          </TimelineStack>
        </RibbonContainer>
      </GuideDataWrapper>
    );
  }

  // ── Option A: per-cast detail view ─────────────────────────────────────────
  if (layout === 'detail') {
    // Collect all cast events within the active windows
    const castEvents = events
      .filter(
        (e) =>
          e.type === EventType.Cast &&
          e.ability.guid === spell.id &&
          windows.some((w) => e.timestamp >= w.startTime && e.timestamp <= w.endTime),
      )
      .sort((a, b) => a.timestamp - b.timestamp);

    // Events that signal the spell became available again
    const availabilityEvents = events.filter(
      (e): e is UpdateSpellUsableEvent =>
        e.type === EventType.UpdateSpellUsable &&
        e.ability.guid === spell.id &&
        (e.updateType === UpdateSpellUsableType.EndCooldown ||
          e.updateType === UpdateSpellUsableType.RestoreCharge),
    );

    const perCastData: PerCastData[] = castEvents.map((cast, index) => {
      // Find the most recent availability event strictly before this cast
      const lastAvail = availabilityEvents
        .filter((e) => e.timestamp <= cast.timestamp)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      const castWindowStart =
        windows.find((w) => cast.timestamp >= w.startTime && cast.timestamp <= w.endTime)
          ?.startTime ?? fightStart;

      const availableAt = lastAvail?.timestamp ?? castWindowStart;
      const delayMs = Math.max(0, cast.timestamp - availableAt);
      const perf = delayPerformance(delayMs);
      const delayLabel = delayMs < 1000 ? '<1s' : formatDuration(delayMs);

      const stats = [
        {
          value: delayLabel,
          label: 'Delay',
          tooltip: (
            <>
              Time between <SpellLink spell={spell} /> becoming available and this cast.
            </>
          ),
          performance: perf,
        },
        {
          value: `${index + 1} / ${castEvents.length}`,
          label: 'Cast No.',
          tooltip: (
            <>
              Cast number {index + 1} of {castEvents.length} total.
            </>
          ),
        },
        {
          value: `${formatPercentage(efficiency, 0)}%`,
          label: 'Efficiency',
          tooltip: (
            <>
              Overall cast efficiency for {spell.name}: {actualCasts} of {possibleCasts} possible
              casts.
            </>
          ),
        },
      ];

      return {
        performance: perf,
        timestamp: formatDuration(cast.timestamp - fightStart),
        stats,
        details: delayDescription(delayMs, spell.name),
      };
    });

    const overviewTimeline = (
      <MiniTimelineWrapper>
        <SegmentedTimeline
          windows={windows}
          segments={hasCharges ? [] : createCooldownSegments(spell.id, events, windows, specColor)}
          markers={createCastMarkers(spell.id, events, windows)}
        />
      </MiniTimelineWrapper>
    );

    return (
      <>
        <GuideDataWrapper
          bare
          title={spell.name}
          subtitle={hasCharges ? 'Charge Usage' : 'Cast Efficiency'}
          stats={statCards}
        >
          {overviewTimeline}
        </GuideDataWrapper>
        <CastDetail title={`${spell.name} Casts`} casts={perCastData} />
      </>
    );
  }

  // ── Default (ribbon) view ────────────────────────────────────────────────
  // Build title - just spell name for both modes
  const title = spell.name;

  // Render with GuideDataWrapper
  return (
    <GuideDataWrapper
      bare
      title={title}
      subtitle={hasCharges ? 'Charge Usage' : 'Cast Efficiency'}
      stats={statCards}
      compact={compactLayout}
      icon={compactLayout ? spell.icon : undefined}
    >
      {compactLayout ? ribbon : <RibbonContainer>{ribbon}</RibbonContainer>}
      {showExplanation && !compactLayout && explanation}
    </GuideDataWrapper>
  );
}
