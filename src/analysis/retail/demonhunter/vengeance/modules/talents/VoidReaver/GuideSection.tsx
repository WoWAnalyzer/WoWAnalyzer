import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import SPELLS from 'common/SPELLS/demonhunter';
import { SpellLink } from 'interface';
import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import VoidReaver from './index';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import Explanation from 'interface/guide/components/Explanation';
import { HitBasedOverview } from 'analysis/retail/demonhunter/vengeance/guide/HitTimeline';
import { t, Trans } from '@lingui/macro';

export default function VoidReaverSubSection() {
  const info = useInfo();
  const voidReaver = useAnalyzer(VoidReaver);
  if (!info || !voidReaver || !info.combatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_REAVER_TALENT)) {
    return null;
  }

  return (
    <SubSection
      title={t({
        id: 'guide.demonhunter.vengeance.sections.defensives.voidReaver.title',
        message: 'Frailty',
      })}
    >
      <ExplanationRow>
        <Explanation>
          <p>
            <Trans id="guide.demonhunter.vengeance.sections.defensives.voidReaver.explanation.summary">
              <SpellLink id={TALENTS_DEMON_HUNTER.FRAILTY_TALENT} /> is a stacking 4% DR (Damage
              Reduction). You should aim to have it applied to any target that you are actively
              tanking. It is applied automatically by doing your core rotation effectively.
            </Trans>
          </p>
          <p>
            <Trans id="guide.demonhunter.vengeance.sections.defensives.voidReaver.explanation.chart">
              This chart shows your <SpellLink id={SPELLS.FRAILTY} /> uptime along with the damage
              that you took.
            </Trans>
          </p>
        </Explanation>
        <HitBasedOverview
          info={info}
          hitBasedAnalyzer={voidReaver}
          spell={SPELLS.FRAILTY}
          unmitigatedContent={
            <Trans id="guide.demonhunter.vengeance.sections.defensives.voidReaver.explanation.unmitigated">
              <SpellLink id={SPELLS.FRAILTY} /> would have reduced this by at least{' '}
              <strong>4%</strong>.
            </Trans>
          }
        />
      </ExplanationRow>
    </SubSection>
  );
}
