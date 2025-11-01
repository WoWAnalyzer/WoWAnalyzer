import { Tooltip } from 'interface';
import { qualitativePerformanceToColor } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import type Spell from 'common/SPELLS/Spell';
import { StatsGrid, StatItem, StatItemValue, StatItemLabel } from './GuideDivs';
import GuideDataWrapper from './GuideDataWrapper';

export interface StatisticData {
  value: string;
  label: string;
  tooltip: React.ReactNode;
  performance?: QualitativePerformance;
}

interface CastOverviewProps {
  spell: Spell;
  stats: StatisticData[];
  fontSize?: string;
}

export default function CastOverview({ spell, stats, fontSize = '20px' }: CastOverviewProps) {
  return (
    <GuideDataWrapper title={`${spell.name} Overview`}>
      <StatsGrid>
        {stats.map((stat, index) => {
          const color = stat.performance
            ? qualitativePerformanceToColor(stat.performance)
            : 'rgba(255, 255, 255, 0.3)';

          return (
            <Tooltip key={index} content={stat.tooltip}>
              <StatItem color={color}>
                <StatItemValue fontSize={fontSize}>{stat.value}</StatItemValue>
                <StatItemLabel>{stat.label}</StatItemLabel>
              </StatItem>
            </Tooltip>
          );
        })}
      </StatsGrid>
    </GuideDataWrapper>
  );
}
