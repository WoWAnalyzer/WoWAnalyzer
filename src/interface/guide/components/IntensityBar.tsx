import styled from '@emotion/styled';
import { Tooltip } from 'interface';
import { useInfo } from 'interface/guide';
import { formatDuration, formatPercentage, formatNumber } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import {
  StatsRow,
  StatCard,
  StatValue,
  StatLabel,
  SectionHeader,
  TitleColumn,
  SectionTitle,
  Label,
} from './GuideDivs';
import StackedBar, { StackedBarSegment } from './StackedBar';

interface DamageOrHealEvent {
  timestamp: number;
  amount: number;
  targetID: number;
  targetInstance?: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function parseColor(color: string): HSL {
  // Handle HSL format
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
  if (hslMatch) {
    return {
      h: parseInt(hslMatch[1]),
      s: parseInt(hslMatch[2]),
      l: parseInt(hslMatch[3]),
    };
  }

  // Handle hex format
  const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    const r = parseInt(hexMatch[1], 16) / 255;
    const g = parseInt(hexMatch[2], 16) / 255;
    const b = parseInt(hexMatch[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) {
      return { h: 0, s: 0, l: Math.round(l * 100) };
    }

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  // Default fallback to fire orange
  return { h: 35, s: 90, l: 55 };
}

function generateGradient(baseColor: string): string[] {
  const { h, s, l } = parseColor(baseColor);

  return [
    // Lightest - tier 1
    `hsl(${h}, ${Math.max(0, s - 10)}%, ${Math.min(100, l + 20)}%)`,
    // Lighter - tier 2
    `hsl(${h}, ${Math.max(0, s - 5)}%, ${Math.min(100, l + 10)}%)`,
    // Base - tier 3
    `hsl(${h}, ${s}%, ${l}%)`,
    // Darker - tier 4
    `hsl(${Math.max(0, h - 10)}, ${s}%, ${Math.max(0, l - 10)}%)`,
    // Darkest - tier 5
    `hsl(${Math.max(0, h - 20)}, ${s}%, ${Math.max(0, l - 20)}%)`,
  ];
}

function roundThreshold(value: number): number {
  if (value > 100000) return Math.round(value / 10000) * 10000;
  if (value > 50000) return Math.round(value / 5000) * 5000;
  return Math.round(value / 1000) * 1000;
}

interface TargetData {
  targetName: string;
  targetID: number;
  targetInstance?: number;
  total: number;
  events: DamageOrHealEvent[];
}

interface Props {
  /** The spell or ability being tracked (optional - if omitted, shows all damage/healing) */
  spell?: Spell;
  /** Array of per-target damage/healing event data */
  data: TargetData[];
  /** Type of intensity chart - 'DPS' or 'HPS'. Default: 'DPS' */
  chartType?: 'DPS' | 'HPS';
  /** Base color for the middle tier of the gradient (HSL format recommended, e.g., 'hsl(35, 90%, 55%)'). Default: fire orange */
  baseColor?: string;
  /** Custom header override. If not provided, uses "{spell.name} Time Distribution" or "Damage/Healing Time Distribution" */
  headerOverride?: string;
  /** Height of the bar in pixels. Default: 60 */
  height?: number;
  /** Whether to show percentage labels on segments. Default: true */
  showLabels?: boolean;
}

/**
 * Displays time distribution as a stacked horizontal bar showing what percentage
 * of time was spent at different intensity tiers based on median-centered thresholds.
 *
 * Features:
 * - Automatically calculates intensity tiers based on median value
 * - Color gradient generated from base color
 * - Shows time distribution and percentages
 * - Legend with duration breakdown
 */
export default function IntensityBar({
  spell,
  data,
  chartType = 'DPS',
  baseColor = '#fab700',
  headerOverride,
  height = 45,
  showLabels = true,
}: Props) {
  const info = useInfo();

  if (!info || data.length === 0) {
    return null;
  }

  const fightStart = info.fightStart;
  const fightEnd = info.fightEnd;

  // Sample every 1 second to calculate DPS/HPS values
  const sampleInterval = 1000; // 1 second
  const samples: number[] = [];

  for (let time = fightStart; time < fightEnd; time += sampleInterval) {
    const timeStart = time;
    const timeEnd = time + sampleInterval;
    let totalAmount = 0;

    data.forEach((target) => {
      target.events.forEach((event) => {
        if (event.timestamp >= timeStart && event.timestamp < timeEnd) {
          totalAmount += event.amount;
        }
      });
    });

    const dps = (totalAmount / sampleInterval) * 1000;
    if (dps > 0) {
      samples.push(dps);
    }
  }

  if (samples.length === 0) {
    return null;
  }

  // Calculate median for threshold centering
  const sortedSamples = [...samples].sort((a, b) => a - b);
  const median = sortedSamples[Math.floor(sortedSamples.length / 2)];

  const medianRounded = roundThreshold(median);
  const step = roundThreshold(median * 0.4);

  // Create 5 intensity tiers centered around median
  const thresholds = [
    { min: 0, max: Math.max(0, medianRounded - step), label: 'Very Low' },
    { min: Math.max(0, medianRounded - step), max: medianRounded, label: 'Low' },
    { min: medianRounded, max: medianRounded + step, label: 'Medium' },
    { min: medianRounded + step, max: medianRounded + step * 2, label: 'High' },
    { min: medianRounded + step * 2, max: Infinity, label: 'Very High' },
  ];

  // Generate 5-color gradient from base color
  const colors = generateGradient(baseColor);

  // Calculate time spent in each tier
  const tierDurations = thresholds.map(() => 0);

  samples.forEach((value) => {
    const tierIndex = thresholds.findIndex((t) => value >= t.min && value < t.max);
    if (tierIndex !== -1) {
      tierDurations[tierIndex] += sampleInterval;
    }
  });

  const totalDuration = tierDurations.reduce((sum, d) => sum + d, 0);

  if (totalDuration === 0) {
    return null;
  }

  // Determine unit label and header
  const unitLabel = chartType;
  const chartTypeLabel = chartType === 'HPS' ? 'Healing' : 'Damage';
  const spellName = spell ? spell.name : 'Overall';
  const defaultHeader = `${spellName} ${chartTypeLabel} Distribution`;

  // Create segments for the stacked bar
  const segments: StackedBarSegment[] = thresholds.map((tier, idx) => ({
    label: tier.label,
    value: tierDurations[idx],
    color: colors[idx],
    tooltip: (
      <>
        <strong>{tier.label}</strong>
        <br />
        {tier.max === Infinity
          ? `>${formatNumber(tier.min)} ${unitLabel}`
          : `${formatNumber(tier.min)}-${formatNumber(tier.max)} ${unitLabel}`}
        <br />
        Duration: {formatDuration(tierDurations[idx])}
        <br />
        Percentage: {formatPercentage(tierDurations[idx] / totalDuration, 1)}%
      </>
    ),
  }));

  return (
    <Container>
      <SectionHeader>
        <TitleColumn>
          <SectionTitle>{headerOverride || defaultHeader}</SectionTitle>
          <Label>Time Distribution</Label>
        </TitleColumn>
        <StatsRow>
          {thresholds.map((tier, idx) => {
            const duration = tierDurations[idx];
            const percent = (duration / totalDuration) * 100;
            if (percent < 0.5) return null;

            const thresholdLabel =
              tier.max === Infinity
                ? `>${formatNumber(tier.min)} ${unitLabel}`
                : `${formatNumber(tier.min)}-${formatNumber(tier.max)} ${unitLabel}`;

            return (
              <Tooltip
                key={idx}
                content={
                  <>
                    <strong>{tier.label}</strong>
                    <br />
                    {thresholdLabel}
                    <br />
                    Duration: {formatDuration(duration)}
                    <br />
                    Percentage: {formatPercentage(duration / totalDuration, 1)}%
                  </>
                }
              >
                <StatCard color={colors[idx]}>
                  <StatValue>{formatDuration(duration)}</StatValue>
                  <StatLabel>{tier.label}</StatLabel>
                </StatCard>
              </Tooltip>
            );
          })}
        </StatsRow>
      </SectionHeader>
      <BarWrapper>
        <StackedBar
          segments={segments}
          height={height}
          showLabels={showLabels}
          labelFormatter={(segment, percent) => (
            <SegmentLabelContainer>
              <SegmentPercentage>{Math.round(percent)}%</SegmentPercentage>
              <SegmentTime>{formatDuration(segment.value)}</SegmentTime>
            </SegmentLabelContainer>
          )}
        />
      </BarWrapper>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
`;

const BarWrapper = styled.div`
  width: 100%;
  min-height: 35px;
  max-height: 60px;

  /* Scale bar height based on container width */
  @media (max-width: 768px) {
    min-height: 30px;
  }
`;

const SegmentLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
`;

const SegmentPercentage = styled.span`
  color: white;
  font-size: 1.6rem;
  font-weight: 1000;
  -webkit-text-stroke: 4px #000;
  paint-order: stroke fill;
`;

const SegmentTime = styled.span`
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.4rem;
  font-weight: 1000;
  -webkit-text-stroke: 4px #000;
  paint-order: stroke fill;
`;
