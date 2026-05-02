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
import { type AdditionalContent } from './CastDetail';

export interface StatisticData {
  value: string;
  label: string;
  tooltip: React.ReactNode;
  performance?: QualitativePerformance;
}

interface CastOverviewProps {
  spell: Spell;
  stats: StatisticData[];
  additionalContent?: AdditionalContent;
}

export default function CastOverview({ spell, stats, additionalContent }: CastOverviewProps) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <GuideDataWrapper bare title={`${spell.name} Overview`}>
        <StatsGrid>
          {stats.map((stat, index) => {
            const color = stat.performance
              ? qualitativePerformanceToColor(stat.performance)
              : '#dadada';

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
        {additionalContent && (
          <div style={{ marginTop: '10px' }}>
            {additionalContent.title && (
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                {additionalContent.title}
              </div>
            )}
            {additionalContent.content}
          </div>
        )}
      </GuideDataWrapper>
    </div>
  );
}
