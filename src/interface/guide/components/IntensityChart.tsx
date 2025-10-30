import styled from '@emotion/styled';
import { Tooltip } from 'interface';
import { useInfo } from 'interface/guide';
import { formatNumber } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import { useState } from 'react';
import {
  SectionHeader,
  TitleColumn,
  SectionTitle,
  Label,
  StatsRow,
  StatCard,
  StatValue,
  StatLabel,
} from 'interface/guide/components/GuideDivs';
import Heatmap, { HeatmapRow, HeatmapColorThreshold } from './Heatmap';

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
  /** Custom header override. If not provided, uses "{spell.name} Intensity Chart" or "Damage/Healing Intensity Chart" */
  headerOverride?: string;
  /** Helper text to display below the header */
  helperText?: string;
}

/**
 * Displays throughput intensity over time as a heatmap grid with color-coded intensity.
 * Can display DPS or HPS for a specific spell or overall damage/healing.
 *
 * Features:
 * - Toggle between overall view (all targets combined) and per-target breakdown
 * - Color gradient centered around median intensity value
 * - Shows stats: average, max, total, uptime percentage
 * - Responsive timeline with configurable bucket count
 */
export default function IntensityChart({
  spell,
  data,
  chartType = 'DPS',
  baseColor = '#fab700',
  headerOverride,
}: Props) {
  const info = useInfo();
  const [showPerTarget, setShowPerTarget] = useState(false);

  if (!info || data.length === 0) {
    return null;
  }

  const { fightStart, fightEnd } = info;
  const fightDuration = fightEnd - fightStart;
  const bucketCount = 60;
  const bucketSize = fightDuration / bucketCount;

  // Build heatmap buckets for a list of targets
  const buildTargetData = (targetList: TargetData[], name: string) => {
    const buckets = new Array(bucketCount).fill(0);

    targetList.forEach((target) => {
      target.events.forEach((event) => {
        const bucketIdx = Math.floor((event.timestamp - fightStart) / bucketSize);
        if (bucketIdx >= 0 && bucketIdx < bucketCount) {
          buckets[bucketIdx] += event.amount;
        }
      });
    });

    // Convert to per-second values
    for (let i = 0; i < bucketCount; i++) {
      buckets[i] = (buckets[i] / bucketSize) * 1000;
    }

    return {
      name,
      total: targetList.reduce((sum, t) => sum + t.total, 0),
      buckets,
    };
  };

  // Create heatmap data
  const heatmapData = showPerTarget
    ? (() => {
        // Group targets by name
        const grouped = data.reduce(
          (acc, target) => {
            if (!acc[target.targetName]) {
              acc[target.targetName] = [];
            }
            acc[target.targetName].push(target);
            return acc;
          },
          {} as Record<string, TargetData[]>,
        );

        // Build data for each unique target name
        return Object.entries(grouped).map(([name, targets]) => buildTargetData(targets, name));
      })()
    : [buildTargetData(data, 'Overall')];

  // Calculate stats
  const allBuckets = heatmapData.flatMap((t) => t.buckets);
  const nonZero = allBuckets.filter((v) => v > 0);
  const sorted = [...nonZero].sort((a, b) => a - b);

  const avgValue = nonZero.length > 0 ? nonZero.reduce((sum, v) => sum + v, 0) / nonZero.length : 0;
  const maxValue = Math.max(...allBuckets, 0);
  const total = heatmapData.reduce((sum, t) => sum + t.total, 0);

  // Calculate uptime as the maximum uptime across all targets
  const uptimePercent = Math.max(
    ...heatmapData.map((target) => {
      const targetNonZero = target.buckets.filter((v) => v > 0).length;
      return (targetNonZero / target.buckets.length) * 100;
    }),
    0,
  );

  // Calculate median-based thresholds
  const median = sorted[Math.floor(sorted.length / 2)] || maxValue / 2;
  const medianRounded = roundThreshold(median);
  const step = roundThreshold(median * 0.4);
  const thresholds = [
    0,
    medianRounded - step,
    medianRounded,
    medianRounded + step,
    medianRounded + step * 2,
  ];

  // Generate colors as color thresholds
  const colors = generateGradient(baseColor);
  const colorThresholds: HeatmapColorThreshold[] = [
    { minValue: 0, color: colors[0] },
    { minValue: thresholds[1], color: colors[1] },
    { minValue: thresholds[2], color: colors[2] },
    { minValue: thresholds[3], color: colors[3] },
    { minValue: thresholds[4], color: colors[4] },
  ];

  // Convert heatmap data to Heatmap component format
  const heatmapRows: HeatmapRow[] = heatmapData.map((target) => ({
    label: showPerTarget ? target.name : undefined,
    secondaryLabel: showPerTarget ? `(${formatNumber(target.total)})` : undefined,
    buckets: target.buckets.map((value, idx) => ({
      value,
      timestamp: idx * bucketSize,
    })),
  }));

  const formatTimestamp = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const unitLabel = chartType;
  const defaultHeader = spell
    ? `${spell.name} Intensity Chart`
    : `${chartType === 'HPS' ? 'Healing' : 'Damage'} Intensity Chart`;

  return (
    <Container>
      <SectionHeader>
        <TitleColumn>
          <SectionTitle>{headerOverride || defaultHeader}</SectionTitle>
          <Label>Timeline</Label>
        </TitleColumn>
        <RightColumn>
          <StatsRow>
            <Tooltip content={`Average ${unitLabel} when active`}>
              <StatCard color="#3b82f6">
                <StatValue>{formatNumber(avgValue)}</StatValue>
                <StatLabel>Avg {unitLabel}</StatLabel>
              </StatCard>
            </Tooltip>
            <Tooltip content={`Maximum ${unitLabel} reached`}>
              <StatCard color="#dc2626">
                <StatValue>{formatNumber(maxValue)}</StatValue>
                <StatLabel>Max {unitLabel}</StatLabel>
              </StatCard>
            </Tooltip>
            <Tooltip content={`Total damage/healing done`}>
              <StatCard color="#10b981">
                <StatValue>{formatNumber(total)}</StatValue>
                <StatLabel>Total</StatLabel>
              </StatCard>
            </Tooltip>
            <Tooltip content={`Percentage of time with active throughput`}>
              <StatCard color="#f59e0b">
                <StatValue>{uptimePercent.toFixed(1)}%</StatValue>
                <StatLabel>Uptime</StatLabel>
              </StatCard>
            </Tooltip>
          </StatsRow>
          <ToggleContainer>
            <ToggleButton active={!showPerTarget} onClick={() => setShowPerTarget(false)}>
              Overall
            </ToggleButton>
            <ToggleButton active={showPerTarget} onClick={() => setShowPerTarget(true)}>
              Per Target
            </ToggleButton>
          </ToggleContainer>
        </RightColumn>
      </SectionHeader>
      <HeatmapContainer>
        <Heatmap
          rows={heatmapRows}
          colorThresholds={colorThresholds}
          showLabels={showPerTarget}
          tooltipFormatter={(bucket, rowLabel) => (
            <>
              {showPerTarget && rowLabel && (
                <>
                  <strong>{rowLabel}</strong>
                  <br />
                </>
              )}
              <strong>{unitLabel}:</strong> {formatNumber(bucket.value)}
              <br />
              <strong>Time:</strong> {formatTimestamp(bucket.timestamp || 0)} -{' '}
              {formatTimestamp((bucket.timestamp || 0) + bucketSize)}
            </>
          )}
        />
      </HeatmapContainer>
    </Container>
  );
}

const Container = styled.div`
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-bottom: 16px;
`;

const HeatmapContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
`;

const ToggleContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  background: ${(props) => (props.active ? 'rgba(250, 183, 0, 0.3)' : 'rgba(0, 0, 0, 0.3)')};
  border: 1px solid ${(props) => (props.active ? '#fab700' : 'rgba(255, 255, 255, 0.15)')};
  border-radius: 4px;
  color: ${(props) => (props.active ? '#fab700' : 'rgba(255, 255, 255, 0.7)')};
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: ${(props) =>
      props.active ? 'rgba(250, 183, 0, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
    border-color: ${(props) => (props.active ? '#fab700' : 'rgba(255, 255, 255, 0.3)')};
  }
`;
