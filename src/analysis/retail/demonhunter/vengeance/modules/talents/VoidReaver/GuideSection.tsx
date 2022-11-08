import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import SPELLS from 'common/SPELLS/demonhunter';
import { SpellLink } from 'interface';
import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import VoidReaver from './index';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import Explanation from 'interface/guide/components/Explanation';
import { HitBasedOverview } from 'analysis/retail/demonhunter/vengeance/guide/HitTimeline';

export default function VoidReaverSection() {
  const info = useInfo();
  const voidReaver = useAnalyzer(VoidReaver);
  if (!info || !voidReaver) {
    return null;
  }

  return (
    <SubSection title="Frailty">
      <ExplanationRow>
        <Explanation>
          <p>
            <SpellLink id={TALENTS_DEMON_HUNTER.FRAILTY_TALENT} /> is a stacking 4% DR (Damage
            Reduction). You should aim to have it applied to any target that you are actively
            tanking. It is applied automatically by doing your core rotation effectively.
          </p>
          <p>
            This chart shows your <SpellLink id={SPELLS.FRAILTY} /> uptime along with the damage
            that you took.
          </p>
        </Explanation>
        <HitBasedOverview
          info={info}
          hitBasedAnalyzer={voidReaver}
          spell={SPELLS.FRAILTY}
          unmitigatedContent={
            <>
              <SpellLink id={SPELLS.FRAILTY} /> would have reduced this by at least{' '}
              <strong>4%</strong>.
            </>
          }
        />
      </ExplanationRow>
    </SubSection>
  );
}
