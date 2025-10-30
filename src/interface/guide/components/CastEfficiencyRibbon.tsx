import styled from '@emotion/styled';
import { CooldownWindow } from 'parser/ui/CooldownBar';
import { SpellIcon, SpellLink, Tooltip } from 'interface';
import {
  BadColor,
  GoodColor,
  MediocreColor,
  OkColor,
  useAnalyzer,
  useInfo,
  useEvents,
} from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Abilities from 'parser/core/modules/Abilities';
import EventHistory from 'parser/shared/modules/EventHistory';
import { formatPercentage, formatDuration } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import {
  SectionContainer,
  SectionHeader,
  TitleColumn,
  Label,
  StatsRow,
  StatCard,
  StatValue,
  StatLabel,
  HelperTextRow,
  HelperText,
  SectionTitle,
} from 'interface/guide/components/GuideDivs';
import { EventType, UpdateSpellUsableEvent, UpdateSpellUsableType } from 'parser/core/Events';
import BulletGraph from './BulletGraph';

interface Props {
  /** The spell to show cooldown bars for - this must match the ID of the spell's cast event */
  spell: Spell;
  /**
   * Windows where the spell is actually usable. Useful for execute spells or spells that only become active inside of a cooldown.
   *
   * If not specified, defaults to the whole fight.
   */
  activeWindows?: CooldownWindow[];
  /** If provided, shows explanatory text above the cooldown bar */
  showExplanation?: boolean;
  /** Use thresholds for coloring the efficiency stat */
  useThresholds?: boolean;
  /** Color to use for cooldown windows (when spell is on CD). Defaults to OkColor (yellow). */
  cooldownColor?: string;
  /** If true, uses a compact inline layout with the stat to the left of the bar */
  compactLayout?: boolean;
}

/**
 * Unified component for displaying cast efficiency as a ribbon visualization.
 * Automatically handles both charge-based and cooldown-based abilities.
 *
 * - For charge abilities: Shows a horizontal bar with filled/empty segments
 * - For cooldown abilities: Shows a ribbon timeline with gaps always shown
 */
export default function CastEfficiencyRibbon({
  spell,
  activeWindows,
  showExplanation = false,
  useThresholds = false,
  cooldownColor = OkColor,
  compactLayout = false,
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
    return (
      <SectionContainer>
        <HelperTextRow>
          <HelperText>
            <strong>EventHistory module is not available.</strong> Chart cannot be rendered.
          </HelperText>
        </HelperTextRow>
      </SectionContainer>
    );
  }

  const maxCharges = ability?.charges || 1;
  const { fightStart, fightEnd, fightDuration } = info;
  const windows = activeWindows || [{ startTime: fightStart, endTime: fightEnd }];
  const spellCasts = castEfficiency.getCastEfficiencyForSpellId(spell.id);
  const efficiency = spellCasts?.efficiency ?? 0;
  const actualCasts = spellCasts?.casts ?? 0;
  const possibleCasts = spellCasts?.maxCasts ?? 0;

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

  // Determine color for wasted time (charge-based)
  const getWasteColor = (seconds: number): string => {
    if (seconds > 10) return BadColor;
    if (seconds > 5) return MediocreColor;
    if (seconds > 2) return OkColor;
    return GoodColor;
  };

  // Determine efficiency color based on thresholds
  const getEfficiencyColor = (eff: number, useThresh: boolean): string => {
    if (!useThresh) return 'white';
    if (eff >= 0.95) return GoodColor;
    if (eff >= 0.85) return OkColor;
    if (eff >= 0.75) return MediocreColor;
    return BadColor;
  };

  const wasteColor = getWasteColor(wastedSeconds);
  const efficiencyColor = getEfficiencyColor(efficiency, useThresholds);

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

  // Render cooldown timeline for non-charge spells
  const renderCooldownTimeline = () => {
    const ribbonHeight = 32;
    const markerOffset = 8; // Space above for markers
    const totalHeight = ribbonHeight + markerOffset;
    const width = 100;

    return (
      <svg
        width="100%"
        height={totalHeight}
        preserveAspectRatio="none"
        viewBox={`0 0 ${width} ${totalHeight}`}
      >
        {windows.map((window, winIdx) => {
          const windowStart = window.startTime;
          const windowEnd = window.endTime;
          const windowDuration = windowEnd - windowStart;

          // Get cooldown events for this window
          const endCooldowns: UpdateSpellUsableEvent[] = events
            .filter(
              (event): event is UpdateSpellUsableEvent =>
                event.type === EventType.UpdateSpellUsable &&
                event.ability.guid === spell.id &&
                event.updateType === UpdateSpellUsableType.EndCooldown &&
                event.overallStartTimestamp < windowEnd &&
                event.timestamp > windowStart,
            )
            .sort((a, b) => a.overallStartTimestamp - b.overallStartTimestamp);

          const beginCooldowns: UpdateSpellUsableEvent[] = events.filter(
            (event): event is UpdateSpellUsableEvent =>
              event.type === EventType.UpdateSpellUsable &&
              event.ability.guid === spell.id &&
              event.updateType === UpdateSpellUsableType.BeginCooldown &&
              event.timestamp >= windowStart &&
              event.timestamp <= windowEnd,
          );

          // Get cast events for this window
          const casts = events.filter(
            (event) =>
              event.type === EventType.Cast &&
              event.ability.guid === spell.id &&
              event.timestamp >= windowStart &&
              event.timestamp <= windowEnd,
          );

          const windowX = ((windowStart - fightStart) / fightDuration) * width;
          const windowWidth = (windowDuration / fightDuration) * width;

          const createRect = (
            start: number,
            end: number,
            key: string,
            fill: string,
            opacity: number,
            title: string,
          ): JSX.Element => {
            const x = windowX + ((start - windowStart) / windowDuration) * windowWidth;
            const rectWidth = ((end - start) / windowDuration) * windowWidth;

            return (
              <rect
                key={key}
                x={x}
                y={markerOffset}
                width={Math.max(0.1, rectWidth)}
                height={ribbonHeight}
                fill={fill}
                opacity={opacity}
                rx={0}
              >
                <title>{title}</title>
              </rect>
            );
          };

          const cooldownRects: JSX.Element[] = [];
          const highlightRects: JSX.Element[] = [];

          // Draw cooldown bars
          endCooldowns.forEach((cd, ix) => {
            const cdStart = Math.max(cd.overallStartTimestamp, windowStart);
            const cdEnd = Math.min(cd.timestamp, windowEnd);

            cooldownRects.push(
              createRect(
                cdStart,
                cdEnd,
                `${winIdx}-cooldown-${ix}`,
                cooldownColor,
                1,
                `On Cooldown: ${formatDuration(cdStart - fightStart)} - ${formatDuration(cdEnd - fightStart)}`,
              ),
            );
          });

          // Handle final cooldown that started but didn't end
          if (beginCooldowns.length > endCooldowns.length) {
            const lastBegin = beginCooldowns[beginCooldowns.length - 1];
            if (lastBegin.overallStartTimestamp < windowEnd) {
              cooldownRects.push(
                createRect(
                  lastBegin.overallStartTimestamp,
                  windowEnd,
                  `${winIdx}-cooldown-final`,
                  cooldownColor,
                  1,
                  `On Cooldown: ${formatDuration(lastBegin.overallStartTimestamp - fightStart)} - ${formatDuration(windowEnd - fightStart)}`,
                ),
              );
            }
          }

          // Build missed opportunity highlights with solid red background
          let lastCdEnd = windowStart;

          endCooldowns.forEach((cd, ix) => {
            // Always show gaps regardless of duration
            if (cd.overallStartTimestamp > lastCdEnd) {
              highlightRects.push(
                createRect(
                  lastCdEnd,
                  cd.overallStartTimestamp,
                  `${winIdx}-highlight-${ix}`,
                  'rgba(220, 38, 38, 0.3)',
                  1,
                  `Available: ${formatDuration(lastCdEnd - fightStart)} - ${formatDuration(cd.overallStartTimestamp - fightStart)}`,
                ),
              );
            }

            lastCdEnd = Math.min(cd.timestamp, windowEnd);
          });

          // Check final gap to window end
          const finalCdEnd = beginCooldowns.length > endCooldowns.length ? windowEnd : lastCdEnd;
          if (finalCdEnd < windowEnd) {
            highlightRects.push(
              createRect(
                finalCdEnd,
                windowEnd,
                `${winIdx}-highlight-end`,
                'rgba(220, 38, 38, 0.3)',
                1,
                `Available: ${formatDuration(finalCdEnd - fightStart)} - ${formatDuration(windowEnd - fightStart)}`,
              ),
            );
          }

          // Render cast markers (teardrop pins)
          const markerWidth = 0.5;
          const markerHeight = 9;
          const markerOffsetY = 3;

          const castMarkers = casts.map((cast, ix) => {
            const markerX =
              windowX + ((cast.timestamp - windowStart) / windowDuration) * windowWidth;
            const castTime = formatDuration(cast.timestamp - fightStart);
            const title = `Cast at ${castTime}`;

            // Teardrop/pin shape pointing down
            const teardropPath = `
              M ${markerX} ${markerHeight + markerOffsetY}
              Q ${markerX - markerWidth} ${markerHeight * 0.6 + markerOffsetY} ${markerX - markerWidth} ${markerHeight * 0.3 + markerOffsetY}
              A ${markerWidth} ${markerHeight * 0.3} 0 1 1 ${markerX + markerWidth} ${markerHeight * 0.3 + markerOffsetY}
              Q ${markerX + markerWidth} ${markerHeight * 0.6 + markerOffsetY} ${markerX} ${markerHeight + markerOffsetY}
              Z
            `;

            return (
              <g key={`${winIdx}-cast-${ix}`}>
                <title>{title}</title>
                <path
                  d={teardropPath}
                  fill="#FFF"
                  stroke="#FFF"
                  strokeWidth={0.8}
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1={markerX}
                  y1={markerHeight}
                  x2={markerX}
                  y2={totalHeight}
                  stroke="#FFF"
                  strokeWidth={3}
                  vectorEffect="non-scaling-stroke"
                  opacity={0.9}
                />
              </g>
            );
          });

          return (
            <g key={winIdx}>
              {highlightRects}
              {cooldownRects}
              {castMarkers}
            </g>
          );
        })}
      </svg>
    );
  };

  // Build stats cards
  const statCards = (
    <>
      <Tooltip
        content={
          hasCharges
            ? `Efficiency: ${formatPercentage(efficiency, 1)}%`
            : `Cast ${actualCasts} out of ${possibleCasts} possible times`
        }
      >
        <StatCard color={efficiencyColor}>
          <StatValue>{formatPercentage(efficiency, 0)}%</StatValue>
          <StatLabel>Efficiency</StatLabel>
        </StatCard>
      </Tooltip>
    </>
  );

  const ribbon = hasCharges ? (
    <BulletGraph
      actual={actualCasts}
      maximum={possibleCasts}
      actualLabel={`${actualCasts} casts`}
      maximumLabel={`Max ${possibleCasts}`}
      barColor={cooldownColor}
      performanceRanges={[
        { width: 75, color: 'rgba(220, 38, 38, 0.15)' },
        { width: 15, color: 'rgba(251, 191, 36, 0.15)' },
        { width: 10, color: 'rgba(34, 197, 94, 0.15)' },
      ]}
      secondaryMetric={
        wastedSeconds > 0
          ? {
              value: (wastedTime / fightDuration) * 100,
              label: `${wastedSeconds}s capped`,
              color: wasteColor,
            }
          : undefined
      }
    />
  ) : (
    <CooldownTimeline>{renderCooldownTimeline()}</CooldownTimeline>
  );

  return (
    <SectionContainer>
      {compactLayout ? (
        <>
          <CompactHeader>
            <SpellTitleColumn>
              <SpellIcon spell={spell} style={{ height: '2.4rem', marginRight: '1rem' }} />
              <span>{spell.name}</span>
            </SpellTitleColumn>
            <CompactStatColumn>{statCards}</CompactStatColumn>
            <RibbonColumn>
              <RibbonContainer $compact>{ribbon}</RibbonContainer>
            </RibbonColumn>
          </CompactHeader>
          {showExplanation && <HelperTextContainer>{explanation}</HelperTextContainer>}
        </>
      ) : (
        <>
          <SectionHeader>
            <TitleColumn>
              <SectionTitle>
                <SpellIcon spell={spell} style={{ height: '2.4rem', marginRight: '1rem' }} />
                {spell.name}
              </SectionTitle>
              <Label>{hasCharges ? 'Charge Usage' : 'Cast Efficiency'}</Label>
            </TitleColumn>
            <StatsRow>{statCards}</StatsRow>
          </SectionHeader>
          <RibbonContainer>{ribbon}</RibbonContainer>
          {showExplanation && <HelperTextContainer>{explanation}</HelperTextContainer>}
        </>
      )}
    </SectionContainer>
  );
}

// Styled Components
const RibbonContainer = styled.div<{ $compact?: boolean }>`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: ${({ $compact }) => ($compact ? '0' : '8px')};
`;

const CooldownTimeline = styled.div`
  width: 100%;
  height: 46px;
  border-radius: 4px;
  overflow: hidden;
`;

const CompactHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 4px;
`;

const SpellTitleColumn = styled.div`
  display: flex;
  align-items: center;
  min-width: 200px;
  font-size: 1.8rem;
  font-weight: 600;
`;

const CompactStatColumn = styled.div`
  min-width: 120px;
  display: flex;
  gap: 0.5rem;
`;

const RibbonColumn = styled.div`
  flex: 1;
`;

const HelperTextContainer = styled.div`
  margin-top: 8px;
  text-align: right;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
`;
