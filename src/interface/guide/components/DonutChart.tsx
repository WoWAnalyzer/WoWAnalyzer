import styled from '@emotion/styled';
import Spell from 'common/SPELLS/Spell';
import { SpellIcon, SpellLink } from 'interface';
import { formatPercentage, formatNumber } from 'common/format';
import { StatsRow, StatCard, StatValue, StatLabel } from './GuideDivs';
import GuideDataWrapper from './GuideDataWrapper';

interface SpellContribution {
  spell: Spell;
  color: string;
  amount: number;
}

interface Props {
  /** Title for the chart */
  title: string;
  /** List of spells to track with their colors */
  spells: Array<{ spell: Spell; color: string }>;
  /** Function to calculate damage/healing for a spell */
  calculateContribution: (spellId: number) => number;
  /** Color for the "Other" category */
  otherColor?: string;
  /** Size of the donut chart in pixels */
  size?: number;
  /** Inner radius ratio (0-1, where 0.5 = half the radius) */
  innerRadiusRatio?: number;
  /** Helper text to display below the chart */
  helperText?: string;
}

/**
 * Displays damage/healing contribution as a donut chart showing breakdown by spell.
 * Automatically includes an "Other" category for untracked spells.
 */
const DonutChart = ({
  title,
  spells,
  calculateContribution,
  otherColor = '#666666',
  size = 200,
  innerRadiusRatio = 0.6,
  helperText,
}: Props) => {
  // Calculate contributions for each spell
  const contributions: SpellContribution[] = spells
    .map(({ spell, color }) => ({
      spell,
      color,
      amount: calculateContribution(spell.id),
    }))
    .filter((contrib) => contrib.amount > 0);

  // Calculate total from all specified spells
  const specifiedTotal = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);

  // Calculate total from all damage (including unspecified)
  const overallTotal = calculateContribution(-1); // -1 signals to get total of all

  // Calculate "Other" category
  const otherAmount = Math.max(0, overallTotal - specifiedTotal);

  // Add "Other" to contributions if it exists
  const allContributions: Array<SpellContribution & { isOther?: boolean }> = [...contributions];

  if (otherAmount > 0) {
    allContributions.push({
      spell: { id: -1, name: 'Other', icon: '' } as Spell,
      color: otherColor,
      amount: otherAmount,
      isOther: true,
    });
  }

  const total = overallTotal;

  // Sort by amount descending
  allContributions.sort((a, b) => b.amount - a.amount);

  // Generate donut chart SVG
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 2;
  const innerRadius = radius * innerRadiusRatio;

  let currentAngle = -90; // Start at top

  const segments = allContributions.map((contrib) => {
    const percentage = contrib.amount / total;
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

    const largeArcFlag = angleDegrees > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`, // Move to start of outer arc
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Outer arc
      `L ${x3} ${y3}`, // Line to inner arc
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`, // Inner arc (reverse)
      'Z', // Close path
    ].join(' ');

    return {
      ...contrib,
      pathData,
      percentage,
    };
  });

  return (
    <GuideDataWrapper title={title} helperText={helperText}>
      <ChartContainer>
        <DonutSvg>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.map((segment, idx) => (
              <g key={segment.isOther ? 'other' : segment.spell.id}>
                <path d={segment.pathData} fill={segment.color} opacity={0.8}>
                  <title>
                    {segment.isOther ? 'Other' : segment.spell.name}: {formatNumber(segment.amount)}{' '}
                    ({formatPercentage(segment.percentage, 1)}%)
                  </title>
                </path>
              </g>
            ))}
          </svg>
          <CenterText>
            <CenterValue>{formatNumber(total)}</CenterValue>
            <CenterLabel>Total</CenterLabel>
          </CenterText>
        </DonutSvg>

        <LegendContainer>
          {segments.map((segment) => (
            <LegendItem key={segment.isOther ? 'other' : segment.spell.id}>
              <LegendColorBox color={segment.color} />
              <LegendContent>
                <LegendSpell>
                  {segment.isOther ? (
                    <span>Other</span>
                  ) : (
                    <>
                      <SpellIcon spell={segment.spell} /> <SpellLink spell={segment.spell} />
                    </>
                  )}
                </LegendSpell>
                <LegendStats>
                  <LegendValue>{formatNumber(segment.amount)}</LegendValue>
                  <LegendPercentage>{formatPercentage(segment.percentage, 1)}%</LegendPercentage>
                </LegendStats>
              </LegendContent>
            </LegendItem>
          ))}
        </LegendContainer>
      </ChartContainer>

      <StatsRow>
        <StatCard color="#3b82f6">
          <StatValue>{allContributions.length}</StatValue>
          <StatLabel>Sources</StatLabel>
        </StatCard>
      </StatsRow>
    </GuideDataWrapper>
  );
};

const ChartContainer = styled.div`
  display: flex;
  gap: 30px;
  align-items: center;
  padding: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const DonutSvg = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const CenterText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
`;

const CenterValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  line-height: 1.2;
`;

const CenterLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const LegendContainer = styled.div`
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LegendColorBox = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  background: ${(props) => props.color};
  border-radius: 3px;
  flex-shrink: 0;
  opacity: 0.8;
`;

const LegendContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
`;

const LegendSpell = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;

  img {
    width: 20px;
    height: 20px;
  }
`;

const LegendStats = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-shrink: 0;
`;

const LegendValue = styled.div`
  font-weight: 600;
  color: white;
  font-size: 0.95rem;
`;

const LegendPercentage = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
`;

export default DonutChart;
