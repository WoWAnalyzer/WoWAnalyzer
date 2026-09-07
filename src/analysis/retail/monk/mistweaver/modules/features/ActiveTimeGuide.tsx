import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { qualitativePerformanceToColor, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import GuideDataWrapper, {
  StatCard,
  StatCardDivider,
  StatCardLabel,
  StatCardValue,
  StatsRow,
} from 'interface/guide/components/GuideDataWrapper';
import ActiveTimeGraph from 'parser/ui/ActiveTimeGraph';
import { getCurrentRSKTalent, getSelectedPrimaryHeal } from '../../constants';
import AlwaysBeCasting from './AlwaysBeCasting';

export default function ActiveTimeGuide() {
  const info = useInfo();
  const alwaysBeCasting = useAnalyzer(AlwaysBeCasting);

  if (!info || !alwaysBeCasting) {
    return null;
  }

  const activeTimeColor = qualitativePerformanceToColor(alwaysBeCasting.DowntimePerformance);

  return (
    <SubSection>
      <p>
        <strong>Active Time Graph</strong> - this graph shows how much of the fight you spent
        casting or inside of a global cooldown. Mistweaver is a high APM spec, so every second spent
        idle is potential healing lost. Fill movement with instant casts like{' '}
        <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> and{' '}
        <SpellLink spell={getCurrentRSKTalent(info.combatant)} />, or make use of{' '}
        <SpellLink spell={TALENTS_MONK.SOOTHING_MIST_TALENT} /> to cast{' '}
        <SpellLink spell={getSelectedPrimaryHeal(info.combatant)} /> and{' '}
        <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> while on the move. Dipping during
        downtime is ok, but globals should still be used with <i>anything</i> rather than{' '}
        <i>nothing</i>.
      </p>
      <GuideDataWrapper
        title="Timeline"
        bare
        stats={
          <StatsRow>
            <StatCard color={activeTimeColor}>
              <StatCardValue color={activeTimeColor}>
                {formatPercentage(alwaysBeCasting.activeTimePercentage, 1)}%
              </StatCardValue>
              <StatCardDivider color={activeTimeColor} />
              <StatCardLabel>Active Time</StatCardLabel>
            </StatCard>
          </StatsRow>
        }
      >
        <ActiveTimeGraph
          activeTimeSegments={alwaysBeCasting.activeTimeSegments}
          fightStart={info.fightStart}
          fightEnd={info.fightEnd}
        />
      </GuideDataWrapper>
    </SubSection>
  );
}
