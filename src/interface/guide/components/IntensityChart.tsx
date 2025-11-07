import styled from '@emotion/styled';
import { Tooltip } from 'interface';
import { useInfo } from 'interface/guide';
import { getSpecColor } from 'interface/guide/colors';
import { formatNumber } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import { useState } from 'react';
import { StatCard, StatValue, StatLabel } from 'interface/guide/components/GuideDivs';
import Heatmap, { HeatmapRow, HeatmapColorThreshold } from './Heatmap';
import GuideDataWrapper from './GuideDataWrapper';

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
  /** Custom header override. If not provided, uses "{spell.name} Chart" or "Damage/Healing Chart" */
  headerOverride?: string;
  /** Optional helper text explaining how to interpret the chart */
  helperText?: string;
  /** Optional uptime percentage to display in the header */
  uptimePercent?: number;
  /** Optional block count to display in the header */
  blockCount?: number;
}

/**
 * Displays throughput intensity over time as a heatmap grid with color-coded intensity.
 * Can display DPS or HPS for a specific spell or overall damage/healing.
 *
 * Features:
 * - Color gradient from low to high intensity
 * - Per-target breakdown in rows
 * - Stats showing max DPS/HPS and uptime
 * - Tooltips with detailed per-bucket information
 *
 * @param spell - The spell being tracked (optional - if omitted, shows all damage/healing)
 * @param data - Array of per-target damage/healing event data
 * @param chartType - Type of chart: 'DPS' or 'HPS' (default: 'DPS')
 * @param headerOverride - Custom header text (default: auto-generated from spell/type)
 * @param helperText - Optional helper text to display below the header
 * @param uptimePercent - Optional uptime 0-1, displays uptime stat if provided
 * @param blockCount - Number of time blocks to divide the fight into (default: 60)
 */
export default function IntensityChart({
  spell,
  data,
  chartType = 'DPS',
  headerOverride,
  uptimePercent,
  blockCount = 60,
}: Props) {
  const info = useInfo();
  const baseColor = getSpecColor(info?.combatant.spec?.id);
  const [showPerTarget, setShowPerTarget] = useState(false);

  if (!info || data.length === 0) {
    return null;
  }

  const { fightStart, fightEnd } = info;
  const fightDuration = fightEnd - fightStart;
  const blockSize = fightDuration / blockCount;

  // Build heatmap blocks for a list of targets
  const buildTargetData = (targetList: TargetData[], name: string) => {
    const blocks = new Array(blockCount).fill(0);

    targetList.forEach((target) => {
      target.events.forEach((event) => {
        const blockIdx = Math.floor((event.timestamp - fightStart) / blockSize);
        if (blockIdx >= 0 && blockIdx < blockCount) {
          blocks[blockIdx] += event.amount;
        }
      });
    });

    // Convert to per-second values
    for (let i = 0; i < blockCount; i++) {
      blocks[i] = (blocks[i] / blockSize) * 1000;
    }

    return {
      name,
      total: targetList.reduce((sum, t) => sum + t.total, 0),
      blocks,
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
  const allBlocks = heatmapData.flatMap((t) => t.blocks);
  const nonZero = allBlocks.filter((v) => v > 0);
  const sorted = [...nonZero].sort((a, b) => a - b);

  const avgValue = nonZero.length > 0 ? nonZero.reduce((sum, v) => sum + v, 0) / nonZero.length : 0;
  const maxValue = Math.max(...allBlocks, 0);
  const total = heatmapData.reduce((sum, t) => sum + t.total, 0);

  // Convert uptimePercent to display percentage (only if provided)
  const uptimeDisplay = uptimePercent !== undefined ? uptimePercent * 100 : undefined;

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
    blocks: target.blocks.map((value, idx) => ({
      value,
      timestamp: idx * blockSize,
    })),
  }));

  const unitLabel = chartType;
  const defaultHeader = spell
    ? `${spell.name} Intensity Chart`
    : `${chartType === 'HPS' ? 'Healing' : 'Damage'} Intensity Chart`;

  const statsContent = (
    <>
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
      {uptimeDisplay !== undefined && (
        <Tooltip content={`Percentage of time the buff/debuff was active`}>
          <StatCard color="#f59e0b">
            <StatValue>{uptimeDisplay.toFixed(1)}%</StatValue>
            <StatLabel>Uptime</StatLabel>
          </StatCard>
        </Tooltip>
      )}
    </>
  );

  return (
    <GuideDataWrapper
      title={headerOverride || defaultHeader}
      subtitle="Timeline"
      stats={statsContent}
    >
      <ToggleContainer>
        <ToggleButton active={!showPerTarget} onClick={() => setShowPerTarget(false)}>
          Overall
        </ToggleButton>
        <ToggleButton active={showPerTarget} onClick={() => setShowPerTarget(true)}>
          Per Target
        </ToggleButton>
      </ToggleContainer>
      <HeatmapContainer>
        <Heatmap rows={heatmapRows} colorThresholds={colorThresholds} />
      </HeatmapContainer>
    </GuideDataWrapper>
  );
}

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
