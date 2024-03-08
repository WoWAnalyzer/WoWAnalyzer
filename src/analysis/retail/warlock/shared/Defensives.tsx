import { GuideProps, Section, SubSection, useAnalyzers } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';
import CombatLogParserAff from '../affliction/CombatLogParser';
import CombatLogParserDemo from '../demonology/CombatLogParser';
import CombatLogParserDestro from '../destruction/CombatLogParser';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import DarkPact from './spells/DarkPact';
import UnendingResolve from './spells/UnendingResolve';
import AllCooldownUsageList from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';

type CombatLogParserType =
  | typeof CombatLogParserAff
  | typeof CombatLogParserDemo
  | typeof CombatLogParserDestro;

function DefensivesGuide({ modules }: GuideProps<CombatLogParserType>) {
  const defensiveAnalyzers = [DarkPact, UnendingResolve];
  return (
    <Section title="Defensives">
      <HideExplanationsToggle id="hide-explanations-major-defensives" />
      <Explanation>
        Using our defensives effectively not only improves our own survivability but also allows our
        healers to better focus on other members of the group.
      </Explanation>
      <SubSection title="Damage Taken">
        <Timeline analyzers={useAnalyzers(defensiveAnalyzers)} />
      </SubSection>
      <AllCooldownUsageList analyzers={useAnalyzers([DarkPact, UnendingResolve])} showTitles />
    </Section>
  );
}

export default DefensivesGuide;
