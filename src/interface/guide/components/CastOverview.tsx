import { Tooltip } from 'interface';
import { qualitativePerformanceToColor } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import type Spell from 'common/SPELLS/Spell';
import {
  StatsGrid,
  StatCard,
  StatCardValue,
  StatCardDivider,
  StatCardLabel,
} from './GuideDataWrapper';
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
}

export default function CastOverview({ spell, stats }: CastOverviewProps) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <GuideDataWrapper bare title={`${spell.name} Overview`}>
        <StatsGrid>
          {stats.map((stat, index) => {
            const color = stat.performance
              ? qualitativePerformanceToColor(stat.performance)
              : '#ffffff';

            return (
              <Tooltip key={index} content={stat.tooltip}>
                <StatCard color={color}>
                  <StatCardValue color={color}>{stat.value}</StatCardValue>
                  <StatCardDivider color={color} />
                  <StatCardLabel>{stat.label}</StatCardLabel>
                </StatCard>
              </Tooltip>
            );
          })}
        </StatsGrid>
      </GuideDataWrapper>
    </div>
  );
}
