import styled from '@emotion/styled';
import Spell from 'common/SPELLS/Spell';
import { formatPercentage, formatNumber } from 'common/format';
import GuideDataWrapper from './GuideDataWrapper';
import DonutChart, { DonutSegment } from './DonutChart';
import { ReactNode } from 'react';

interface SpellContribution {
  spell: Spell;
  color: string;
  amount: number;
}

interface Props {
  /** Title for the chart (defaults to "Damage Contribution") */
  title?: string;
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
  /** Optional stat cards to display in the header */
  stats?: ReactNode;
}

/**
 * Displays damage/healing contribution as a donut chart with spell breakdown and legend.
 * Automatically includes an "Other" category for untracked spells.
 * Built using GuideDataWrapper for consistent styling.
 *
 * @param title - Title for the chart (defaults to "Damage Contribution")
 * @param spells - List of spells to track with their display colors
 * @param calculateContribution - Function that takes spellId and returns damage/healing amount
 * @param otherColor - Color for the "Other" category (default: #666666)
 * @param size - Size of the donut chart in pixels (default: 200)
 * @param innerRadiusRatio - Inner radius ratio 0-1 (default: 0.6)
 * @param helperText - Optional helper text to display below the header
 * @param stats - Optional stat cards to display in the header
 */
export default function DamageContribution({
  title,
  spells,
  calculateContribution,
  otherColor = '#666666',
  helperText,
  stats,
}: Props) {
  // Default title to "Damage Contribution" if not provided
  const displayTitle = title ?? 'Damage Contribution';

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

  // Convert to DonutSegment format
  const donutSegments: DonutSegment[] = allContributions.map((contrib) => ({
    id: contrib.isOther ? 'other' : contrib.spell.id,
    label: contrib.isOther ? 'Other' : contrib.spell.name,
    color: contrib.color,
    value: contrib.amount,
  }));

  return (
    <GuideDataWrapper
      title={displayTitle}
      subtitle="Distribution"
      stats={stats}
      helperText={helperText}
    >
      <ChartContainer>
        <DonutChart
          segments={donutSegments}
          size={240}
          innerRadiusRatio={0.6}
          showCenterText={true}
        />
        <LegendContainer>
          {allContributions.map((contrib) => {
            const percentage = contrib.amount / total;
            return (
              <LegendItem key={contrib.isOther ? 'other' : contrib.spell.id}>
                <LegendColorBox color={contrib.color} />
                <LegendContent>
                  <LegendSpell>
                    {contrib.isOther ? <span>Other</span> : contrib.spell.name}
                  </LegendSpell>
                  <LegendStats>
                    <LegendValue>{formatNumber(contrib.amount)}</LegendValue>
                    <LegendPercentage>{formatPercentage(percentage, 1)}%</LegendPercentage>
                  </LegendStats>
                </LegendContent>
              </LegendItem>
            );
          })}
        </LegendContainer>
      </ChartContainer>
    </GuideDataWrapper>
  );
}

const ChartContainer = styled.div`
  display: flex;
  gap: 30px;
  align-items: center;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;

  @media (max-width: 900px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const LegendContainer = styled.div`
  flex: 1;
  min-width: 200px;
  max-width: 350px;
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
  width: 20px;
  height: 20px;
  background: ${(props) => props.color};
  border-radius: 4px;
  flex-shrink: 0;
  opacity: 0.8;
`;

const LegendContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
`;

const LegendSpell = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1.4rem;

  img {
    width: 20px;
    height: 20px;
  }
`;

const LegendStats = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-shrink: 0;
`;

const LegendValue = styled.div`
  font-weight: 600;
  color: white;
  font-size: 1.4rem;
`;

const LegendPercentage = styled.div`
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.6);
  min-width: 50px;
  text-align: right;
`;
