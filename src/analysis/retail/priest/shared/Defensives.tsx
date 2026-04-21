import { Section, SubSection, useAnalyzers } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import { HideExplanationsToggle } from 'interface/guide/components/HideExplanationsToggle';
import AllCooldownUsageList from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';
import { MajorDefensiveBuff } from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import Timeline from 'interface/guide/components/MajorDefensives/Timeline';
import Module from 'parser/core/Module';

// Combines the Module static shape required by `useAnalyzers` with an
// instance constraint so `Timeline` / `AllCooldownUsageList` receive actual
// MajorDefensiveBuff instances. `never[]` in the ctor param position makes
// the constructor compatible with any subclass signature.
type DefensiveAnalyzer = typeof Module & (new (...args: never[]) => MajorDefensiveBuff);

interface Props {
  analyzers: DefensiveAnalyzer[];
}

function DefensivesGuide({ analyzers: defensiveAnalyzers }: Props) {
  return (
    <Section title="Defensives">
      <HideExplanationsToggle id="hide-explanations-major-defensives" />
      <Explanation>
        Using your defensives effectively not only improves your own survivability but also allows
        your healers to better focus on other members of the group.
      </Explanation>
      <SubSection title="Damage Taken">
        <Timeline analyzers={useAnalyzers(defensiveAnalyzers)} />
      </SubSection>
      <AllCooldownUsageList analyzers={useAnalyzers(defensiveAnalyzers)} showTitles />
    </Section>
  );
}

export default DefensivesGuide;
