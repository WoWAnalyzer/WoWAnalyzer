import SPELLS from 'common/SPELLS/demonhunter';
import { SpellLink } from 'interface';
import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import DemonSpikes from './index';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import Explanation from 'interface/guide/components/Explanation';
import {
  Highlight,
  HitBasedOverview,
  red,
} from 'analysis/retail/demonhunter/vengeance/guide/HitTimeline';

export default function DemonSpikesSection() {
  const info = useInfo();
  const demonSpikes = useAnalyzer(DemonSpikes);
  if (!info || !demonSpikes) {
    return null;
  }

  return (
    <SubSection title="Demon Spikes">
      <ExplanationRow>
        <Explanation>
          <p>
            <SpellLink id={SPELLS.DEMON_SPIKES} /> nearly <strong>doubles</strong> the amount of
            armor that you have and is critical to have up while tanking.
          </p>
          <p>
            This chart shows your <SpellLink id={SPELLS.DEMON_SPIKES} /> uptime along with the
            damage that you took. <strong>You do not need 100% uptime!</strong> However, physical
            damage taken without <SpellLink id={SPELLS.DEMON_SPIKES} /> active (shown in{' '}
            <Highlight color={red}>red</Highlight>) is very dangerous!
          </p>
        </Explanation>
        <HitBasedOverview
          info={info}
          hitBasedAnalyzer={demonSpikes}
          spell={SPELLS.DEMON_SPIKES}
          unmitigatedContent={
            <>
              <SpellLink id={SPELLS.DEMON_SPIKES} /> would have reduced this by a decent amount.
            </>
          }
        />
      </ExplanationRow>
    </SubSection>
  );
}
