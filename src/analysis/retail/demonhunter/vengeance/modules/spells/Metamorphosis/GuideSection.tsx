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
import { t, Trans } from '@lingui/macro';

import Metamorphosis from './index';
import DemonicSnippet from './DemonicSnippet';

export default function MetamorphosisSubSection() {
  const info = useInfo();
  const metamorphosis = useAnalyzer(Metamorphosis);
  if (!info || !metamorphosis) {
    return null;
  }

  return (
    <SubSection
      title={t({
        id: 'guide.demonhunter.vengeance.sections.defensives.metamorphosis.title',
        message: 'Metamorphosis',
      })}
    >
      <ExplanationRow>
        <Explanation>
          <p>
            <Trans id="guide.demonhunter.vengeance.sections.defensives.metamorphosis.explanation.summary">
              <SpellLink id={SPELLS.METAMORPHOSIS_TANK} /> increases your current and max HP by 50%
              and your armor by 200%. This grants incredible survivablity and makes it your biggest
              cooldown.
            </Trans>
          </p>
          <DemonicSnippet />
          <p>
            <Trans id="guide.demonhunter.vengeance.sections.defensives.metamorphosis.explanation.graph">
              This chart shows your <SpellLink id={SPELLS.METAMORPHOSIS_TANK} /> uptime along with
              the damage that you took. <strong>You do not need 100% uptime!</strong> However,
              damage taken without <SpellLink id={SPELLS.METAMORPHOSIS_TANK} /> active (shown in{' '}
              <Highlight color={red}>red</Highlight>) is dangerous!
            </Trans>
          </p>
        </Explanation>
        <HitBasedOverview
          info={info}
          hitBasedAnalyzer={metamorphosis}
          spell={SPELLS.METAMORPHOSIS_TANK}
          unmitigatedContent={
            <Trans id="guide.demonhunter.vengeance.sections.defensives.metamorphosis.data.unmitigated">
              <SpellLink id={SPELLS.METAMORPHOSIS_TANK} /> would have reduced this.
            </Trans>
          }
        />
      </ExplanationRow>
    </SubSection>
  );
}
