import { formatNumber, formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import styled from '@emotion/styled';

export interface Item {
  label: React.ReactNode;
  tooltip?: React.ReactNode;
  color: string;
  value: number;
  valuePercent?: boolean;
  spellId?: number;
  itemLevel?: number;
  valueTooltip?: React.ReactNode;
}

interface Props {
  items: Item[];
}

/**
 * Legacy DonutChart component for backward compatibility.
 * This renders a simple donut chart with a legend.
 */
export default function DonutChart({ items }: Props) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  // Calculate angles for each segment
  let currentAngle = -90; // Start at top
  const size = 180;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10;
  const innerRadius = radius * 0.6;

  const segments = items.map((item, index) => {
    const percentage = item.value / total;
    const angleDegrees = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleDegrees;

    currentAngle = endAngle;

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate arc path
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArc = angleDegrees > 180 ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    return { path, color: item.color, index };
  });

  return (
    <Container>
      <Legend>
        {items.map((item, index) => {
          const {
            color,
            label,
            tooltip,
            value,
            valuePercent = true,
            spellId,
            valueTooltip,
            itemLevel,
          } = item;

          let displayLabel: React.ReactNode = label;
          if (tooltip) {
            displayLabel = <TooltipElement content={tooltip}>{label}</TooltipElement>;
          }
          if (spellId) {
            displayLabel = (
              <SpellLink spell={spellId} ilvl={itemLevel}>
                {displayLabel}
              </SpellLink>
            );
          }

          return (
            <LegendRow key={index}>
              <ColorDot color={color} />
              <LegendLabel>{displayLabel}</LegendLabel>
              <LegendValue>
                {valuePercent ? (
                  valueTooltip ? (
                    <TooltipElement content={valueTooltip}>
                      {formatPercentage(value / total, 0)}%
                    </TooltipElement>
                  ) : (
                    <>{formatPercentage(value / total, 0)}%</>
                  )
                ) : (
                  <>{formatNumber(value)}</>
                )}
              </LegendValue>
            </LegendRow>
          );
        })}
      </Legend>
      <ChartContainer>
        <svg width={size} height={size}>
          {segments.map(({ path, color, index }) => (
            <path key={index} d={path} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
          ))}
        </svg>
      </ChartContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ColorDot = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) => props.color};
  flex-shrink: 0;
`;

const LegendLabel = styled.div`
  flex: 1;
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.9);
`;

const LegendValue = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  min-width: 50px;
  text-align: right;
`;

const ChartContainer = styled.div`
  flex-shrink: 0;
`;
