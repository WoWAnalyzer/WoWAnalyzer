import { useState, useEffect, type JSX } from 'react';
import Spell from 'common/SPELLS/Spell';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import styled from '@emotion/styled';
import fetchWcl from 'common/fetchWclApi';

const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 8px 0;
  margin-bottom: 8px;
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
`;

const LegendSymbol = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  background-color: ${(props) => props.color};
  border-radius: 2px;
`;

interface ManaUpdate {
  timestamp: number;
  current: number;
  max: number;
  used?: number;
}

interface AnnotationConfig {
  events: Array<{ timestamp: number; spell?: Spell; label?: string; color?: string }>;
  type?: 'cast' | 'buff' | 'damage' | 'death' | 'custom';
  color?: string;
}

interface ManaChartProps {
  manaUpdates: ManaUpdate[];
  startTime: number;
  endTime: number;
  annotations?: AnnotationConfig[];
  lowManaThreshold?: number;
  showBossHealth?: boolean;
  reportCode?: string;
}

interface ProcessedDataPoint {
  x: number;
  y: number;
  timeFormatted: string;
}

interface ProcessedAnnotation {
  x: number;
  originalX: number;
  label: string;
  color: string;
  spell?: Spell;
  type: string;
  timeFormatted: string;
}

interface SeriesData {
  name: string;
  data: Array<{ timestamp: number; value: number }>;
  color: string;
  type: 'area' | 'line';
  opacity: number;
  backgroundColor?: string;
}

interface ProcessedSeriesData {
  name: string;
  data: ProcessedDataPoint[];
  color: string;
  type: 'area' | 'line';
  opacity: number;
  backgroundColor?: string;
}

const DEFAULT_COLORS = {
  cast: '#4CAF50',
  buff: '#2196F3',
  damage: '#F44336',
  death: '#D32F2F',
  custom: '#9E9E9E',
} as const;

function formatRelativeTime(relativeTime: number): string {
  const minutes = Math.floor(relativeTime / 60000);
  const seconds = Math.floor((relativeTime % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function buildManaData(
  manaUpdates: ManaUpdate[],
  startTime: number,
  endTime: number,
): Array<{ timestamp: number; value: number }> {
  if (!manaUpdates || manaUpdates.length === 0) {
    return [
      { timestamp: startTime, value: 100 },
      { timestamp: endTime, value: 100 },
    ];
  }

  const initial = manaUpdates[0].current / manaUpdates[0].max;
  const manaData = [{ timestamp: startTime, value: 100 * initial }];

  const processedUpdates = manaUpdates.map((update) => ({
    timestamp: Math.max(update.timestamp, startTime),
    value: (update.current / update.max) * 100,
  }));

  manaData.push(...processedUpdates);
  return manaData;
}

function buildSeries(
  manaUpdates: ManaUpdate[],
  startTime: number,
  endTime: number,
  bossHealthData: Array<{ timestamp: number; value: number }> | null,
): SeriesData[] {
  const series: SeriesData[] = [];

  const manaData = buildManaData(manaUpdates, startTime, endTime);
  series.push({
    name: manaUpdates && manaUpdates.length > 0 ? 'Mana' : 'Mana (No Data)',
    data: manaData,
    color: '#2196F3',
    type: 'area',
    opacity: 0.7,
    backgroundColor: '#2196F340',
  });

  if (bossHealthData && bossHealthData.length > 0) {
    series.push({
      name: 'Boss Health',
      data: bossHealthData,
      color: '#FF4444',
      type: 'line',
      opacity: 0.8,
      backgroundColor: '#FF444440',
    });
  }

  return series;
}

function buildAnnotations(
  annotations: AnnotationConfig[],
  manaUpdates: ManaUpdate[],
  lowManaThreshold: number | undefined,
  startTime: number,
): Array<{ timestamp: number; spell?: Spell; label?: string; type: string; color: string }> {
  const allAnnotations: Array<{
    timestamp: number;
    spell?: Spell;
    label?: string;
    type: string;
    color: string;
  }> = [];

  annotations.forEach((config) => {
    const annotationType = config.type || 'cast';
    config.events.forEach((event) => {
      allAnnotations.push({
        timestamp: event.timestamp,
        spell: event.spell,
        label: event.label || (annotationType === 'death' ? 'Death' : undefined),
        type: annotationType,
        color: event.color || config.color || DEFAULT_COLORS[annotationType],
      });
    });
  });

  // Add low mana warnings if threshold specified
  if (lowManaThreshold !== undefined && manaUpdates && manaUpdates.length > 0) {
    const warnings = manaUpdates
      .filter(
        (update) =>
          update.current / update.max < lowManaThreshold && update.timestamp > startTime + 30000,
      )
      .map((update) => ({
        timestamp: update.timestamp,
        label: 'Low Mana',
        type: 'custom',
        color: '#EF4444',
      }));
    allAnnotations.push(...warnings);
  }

  return allAnnotations;
}

function processSeriesData(series: SeriesData[], startTime: number): ProcessedSeriesData[] {
  return series.map((s) => ({
    ...s,
    data: s.data.map((point) => {
      const relativeTime = point.timestamp - startTime;
      return {
        x: relativeTime,
        y: point.value,
        timeFormatted: formatRelativeTime(relativeTime),
      };
    }),
  }));
}

function processAnnotationsData(
  annotations: Array<{
    timestamp: number;
    spell?: Spell;
    label?: string;
    type: string;
    color: string;
  }>,
  startTime: number,
): ProcessedAnnotation[] {
  return annotations.map((ann, index) => {
    const relativeTime = ann.timestamp - startTime;
    const formattedTime = formatRelativeTime(relativeTime);

    // Adjust overlapping annotations
    const overlapThreshold = 1000;
    let adjustedTime = relativeTime;
    const overlappingAnnotations = annotations
      .slice(0, index)
      .filter(
        (prevAnn) => Math.abs(prevAnn.timestamp - startTime - relativeTime) < overlapThreshold,
      );
    if (overlappingAnnotations.length > 0) {
      adjustedTime = relativeTime + overlappingAnnotations.length * 200;
    }

    return {
      x: adjustedTime,
      originalX: relativeTime,
      label: ann.label || (ann.spell ? ann.spell.name : 'Event'),
      color: ann.color,
      spell: ann.spell,
      type: ann.type || 'custom',
      timeFormatted: formattedTime,
    };
  });
}

function buildVegaSpec(
  processedSeries: ProcessedSeriesData[],
  processedAnnotations: ProcessedAnnotation[],
): VisualizationSpec {
  const baseEncoding = {
    x: {
      field: 'x',
      type: 'quantitative' as const,
      axis: {
        labelExpr: formatTime('datum.value'),
        grid: false,
        title: 'Time',
      },
      scale: { zero: true, nice: false },
    },
    y: {
      field: 'y',
      type: 'quantitative' as const,
      axis: {
        labelExpr: 'datum.value + "%"',
        title: 'Percentage',
        tickCount: 5,
        grid: true,
      },
      scale: {
        zero: true,
        domain: [0, 100],
      },
    },
  };

  const seriesLayers = processedSeries.map((s, index) => ({
    data: { name: `series_${index}` },
    mark: {
      type: s.type || 'line',
      opacity: s.opacity || (s.type === 'area' ? 0.7 : 1),
      strokeWidth: 2,
      ...(s.type === 'area' && {
        line: {
          color: s.color,
          strokeWidth: 1,
        },
        color: s.backgroundColor || s.color + '40',
      }),
      ...(s.type !== 'area' && {
        color: s.color,
      }),
    },
    encoding: {
      ...baseEncoding,
      tooltip: [
        { field: 'timeFormatted', type: 'nominal' as const, title: 'Time' },
        { datum: s.name, type: 'nominal' as const, title: 'Series' },
        { field: 'y', type: 'quantitative' as const, title: 'Value', format: '.1f' },
      ],
    },
  }));

  const annotationLayers =
    processedAnnotations.length > 0
      ? [
          {
            data: { name: 'annotations' },
            mark: {
              type: 'rule' as const,
              strokeWidth: 2,
              opacity: 0.8,
            },
            encoding: {
              x: baseEncoding.x,
              color: {
                field: 'color',
                type: 'nominal' as const,
                scale: null,
              },
              tooltip: [
                { field: 'label', type: 'nominal' as const, title: 'Event' },
                { field: 'type', type: 'nominal' as const, title: 'Type' },
                { field: 'timeFormatted', type: 'nominal' as const, title: 'Time' },
              ],
            },
          },
        ]
      : [];

  return {
    title: undefined,
    layer: [...seriesLayers, ...annotationLayers],
  };
}

function buildLegendItems(
  processedSeries: ProcessedSeriesData[],
  processedAnnotations: ProcessedAnnotation[],
): Array<{ label: string; color: string }> {
  const legendItems: Array<{ label: string; color: string }> = [];

  // Add series to legend
  processedSeries.forEach((s) => {
    legendItems.push({
      label: s.name,
      color: s.color,
    });
  });

  // Add unique annotation labels to legend
  if (processedAnnotations.length > 0) {
    const uniqueAnnotations = new Map<string, string>();
    processedAnnotations.forEach((ann) => {
      const label = ann.label || (ann.spell ? ann.spell.name : 'Event');
      if (!uniqueAnnotations.has(label)) {
        uniqueAnnotations.set(label, ann.color);
      }
    });

    uniqueAnnotations.forEach((color, label) => {
      legendItems.push({ label, color });
    });
  }

  return legendItems;
}

/**
 * Displays mana percentage over time with optional boss health, annotations, and low mana warnings.
 * @param manaUpdates - Array of mana state changes with timestamps and current/max values
 * @param startTime - Fight start timestamp in ms
 * @param endTime - Fight end timestamp in ms
 * @param annotations - Array of annotation configurations to display on the chart
 * @param lowManaThreshold - Mana percentage threshold to generate low mana warnings
 * @param showBossHealth - Whether to fetch and display boss health overlay
 * @param reportCode - WCL report code needed for boss health fetching
 */
const defaultAnnotations: AnnotationConfig[] = [];
export default function ManaChart({
  manaUpdates,
  startTime,
  endTime,
  annotations = defaultAnnotations,
  lowManaThreshold,
  showBossHealth = false,
  reportCode,
}: ManaChartProps): JSX.Element {
  const [bossHealthData, setBossHealthData] = useState<Array<{
    timestamp: number;
    value: number;
  }> | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch boss health if requested
  useEffect(() => {
    let cancelled = false;
    if (!showBossHealth || !reportCode) {
      return;
    }

    const fetchBossHealth = async () => {
      if (!cancelled) {
        setLoading(true);
      }
      try {
        const json = await fetchWcl(`report/graph/resources/${reportCode}`, {
          start: startTime,
          end: endTime,
          sourceclass: 'Boss',
          hostility: 'Enemies',
          abilityid: 1000,
        });

        const bossData = json as { series?: Array<{ data: Array<[number, number]> }> };

        if (bossData?.series?.[0]?.data && !cancelled) {
          setBossHealthData(
            bossData.series[0].data.map((dataPoint: [number, number]) => ({
              timestamp: dataPoint[0],
              value: dataPoint[1],
            })),
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load boss health data:', error);
          setBossHealthData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBossHealth();
    return () => {
      cancelled = true;
    };
  }, [showBossHealth, reportCode, startTime, endTime]);

  if (loading) {
    return <div>Loading chart data...</div>;
  }

  // Build all chart data using helper functions
  const series = buildSeries(manaUpdates, startTime, endTime, bossHealthData);
  const allAnnotations = buildAnnotations(annotations, manaUpdates, lowManaThreshold, startTime);
  const processedSeries = processSeriesData(series, startTime);
  const processedAnnotations = processAnnotationsData(allAnnotations, startTime);
  const spec = buildVegaSpec(processedSeries, processedAnnotations);
  const legendItems = buildLegendItems(processedSeries, processedAnnotations);

  const chartData: Record<string, unknown> = {
    annotations: processedAnnotations,
  };
  processedSeries.forEach((s, index) => {
    chartData[`series_${index}`] = s.data;
  });

  return (
    <>
      {legendItems.length > 0 && (
        <LegendContainer>
          {legendItems.map((item) => (
            <LegendItem key={item.label}>
              <LegendSymbol color={item.color} />
              <span>{item.label}</span>
            </LegendItem>
          ))}
        </LegendContainer>
      )}
      <AutoSizer disableHeight>
        {({ width }) => <BaseChart height={400} width={width} spec={spec} data={chartData} />}
      </AutoSizer>
    </>
  );
}
