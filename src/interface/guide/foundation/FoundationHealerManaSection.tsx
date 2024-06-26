import ResourceLink from 'interface/ResourceLink';
import Explanation from '../components/Explanation';
import { SubSection, useAnalyzer } from '../index';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { FoundationHighlight as HL } from './shared';
import AlertInfo from 'interface/AlertInfo';
import ManaLevelChartComponent from 'parser/shared/modules/resources/mana/ManaLevelChartComponent';
import { useReport } from 'interface/report/context/ReportContext';
import Combatants from 'parser/shared/modules/Combatants';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import ManaValues from 'parser/shared/modules/ManaValues';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import HealingEfficiencyBreakdown from 'parser/core/healingEfficiency/HealingEfficiencyBreakdown';

export default function FoundationHealerManaSection(): JSX.Element | null {
  const { report } = useReport();
  const {
    combatLogParser: {
      fight: { offset_time, start_time, end_time },
    },
  } = useCombatLogParser();
  const combatants = useAnalyzer(Combatants);
  const manaValues = useAnalyzer(ManaValues);
  const healingEfficiencyTracker = useAnalyzer(HealingEfficiencyTracker);

  return (
    <SubSection title="Spend Your Mana">
      <Explanation>
        <p>
          As a <strong>Healer</strong>, <ResourceLink id={RESOURCE_TYPES.MANA.id} /> is your most
          important resource. You have two goals:
          <ol>
            <li>Spend all of your mana by the end of the fight.</li>
            <li>Don't run out of mana before the end of the fight.</li>
          </ol>
        </p>
        <p>
          As a general guideline,{' '}
          <HL>
            the percent of mana you have left should match the percent of the fight you have left.
          </HL>{' '}
          You should have 50% remaining mana half-way through the fight, and 25% remaining mana with
          25% left.
        </p>
        <AlertInfo className="alert-subtle">
          Remember that this is just a guideline! Many boss fights have raid damage that requires
          spending more mana early in a fight.
        </AlertInfo>
      </Explanation>
      <SubSection title="Check Your Mana Level">
        <Explanation>
          <p>
            This chart shows your mana level over time, along with boss HP. There are a couple of
            common problems to look for:
            <ul>
              <li>
                If you are at <em>nearly 0 mana</em> for a long time (or in the middle of the fight)
                then you might need to improve your <strong>Mana Efficiency.</strong>
              </li>
              <li>
                If you end the fight with <em>lots of mana</em>, then you might need to use
                less-efficient spells to <strong>spend mana more quickly</strong>.
              </li>
            </ul>
          </p>
        </Explanation>
        <ManaLevelChartComponent
          reportCode={report.code}
          start={start_time}
          end={end_time}
          offset={offset_time}
          combatants={combatants}
          manaUpdates={manaValues?.manaUpdates ?? []}
          height={250}
        />
      </SubSection>
      {healingEfficiencyTracker && (
        <SubSection title="Use Efficient Spells">
          <Explanation>
            This table shows the mana and time-efficiency of your spells.{' '}
            <HL>If you are running out of mana, try switching to more mana-efficient spells.</HL> If
            you are ending a fight with too much mana, try switching to spells that are more
            time-efficient even if they are less mana-efficient.
          </Explanation>
          <HealingEfficiencyBreakdown tracker={healingEfficiencyTracker} disableDamageToggle />
        </SubSection>
      )}
    </SubSection>
  );
}
