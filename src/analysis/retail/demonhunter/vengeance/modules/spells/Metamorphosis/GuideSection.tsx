import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import Explanation from 'interface/guide/components/Explanation';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS/demonhunter';
import {
  Highlight,
  HitBasedOverview,
  red,
} from 'analysis/retail/demonhunter/vengeance/guide/HitTimeline';

import Metamorphosis from './index';
import DemonicSnippet from './DemonicSnippet';

export default function MetamorphosisSubSection() {
  const info = useInfo();
  const metamorphosis = useAnalyzer(Metamorphosis);
  if (!info || !metamorphosis) {
    return null;
  }

  return (
    <SubSection title="Metamorphosis">
      <ExplanationRow>
        <Explanation>
          <p>
            <>
              <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} /> increases your current and max HP by
              50% and your armor by 200%. This grants incredible survivablity and makes it your
              biggest cooldown.
            </>
          </p>
          <DemonicSnippet />
          <p>
            <>
              This chart shows your <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} /> uptime along
              with the damage that you took. <strong>You do not need 100% uptime!</strong> However,
              damage taken without <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} /> active (shown in{' '}
              <Highlight color={red}>red</Highlight>) is dangerous!
            </>
          </p>
        </Explanation>
        <HitBasedOverview
          info={info}
          hitBasedAnalyzer={metamorphosis}
          spell={SPELLS.METAMORPHOSIS_TANK}
          unmitigatedContent={
            <>
              <SpellLink spell={SPELLS.METAMORPHOSIS_TANK} /> would have reduced this.
            </>
          }
        />
      </ExplanationRow>
    </SubSection>
  );
}
