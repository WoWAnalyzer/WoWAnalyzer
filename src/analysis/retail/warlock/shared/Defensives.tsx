import { GuideProps, Section, SubSection, useAnalyzers } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import HideExplanationsToggle from 'interface/guide/components/HideExplanationsToggle';
import CombatLogParserAff from '../affliction/CombatLogParser';
import CombatLogParserDemo from '../demonology/CombatLogParser';
import CombatLogParserDestro from '../destruction/CombatLogParser';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import DarkPact from './talents/DarkPact';
// import AllCooldownUsageList from "interface/guide/components/MajorDefensives/AllCooldownUsagesList";

type CombatLogParserType =
  | typeof CombatLogParserAff
  | typeof CombatLogParserDemo
  | typeof CombatLogParserDestro;

function DefensivesGuide({ modules }: GuideProps<CombatLogParserType>) {
  const defensiveAnalyzers = [DarkPact];
  return (
    <Section title="Defensives">
      <HideExplanationsToggle id="hide-explanations-major-defensives" />
      <Explanation>TODO explanation</Explanation>
      <SubSection title="Damage Taken">
        <Timeline analyzers={useAnalyzers(defensiveAnalyzers)} />
      </SubSection>
      {modules.darkPact.guideSubsection}
      {/* <AllCooldownUsageList analyzers={useAnalyzers(defensiveAnalyzers)} /> */}
    </Section>
  );
}

export default DefensivesGuide;
