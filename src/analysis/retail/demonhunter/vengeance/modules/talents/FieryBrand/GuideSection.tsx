import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import FieryBrand from './index';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import Explanation from 'interface/guide/components/Explanation';
import {
  Highlight,
  HitBasedOverview,
  red,
} from 'analysis/retail/demonhunter/vengeance/guide/HitTimeline';
import { t, Trans } from '@lingui/macro';

export default function FieryBrandSubSection() {
  const info = useInfo();
  const fieryBrand = useAnalyzer(FieryBrand);
  if (!info || !fieryBrand) {
    return null;
  }

  return (
    <SubSection
      title={t({
        id: 'guide.demonhunter.vengeance.sections.defensives.fieryBrand.title',
        message: 'Fiery Brand',
      })}
    >
      <ExplanationRow>
        <Explanation>
          <p>
            <Trans id="guide.demonhunter.vengeance.sections.defensives.fieryBrand.explanation.summary">
              <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> reduces the damage dealt to
              you by targets with its debuff by <strong>40%</strong>.
            </Trans>
          </p>
          <p>
            <Trans id="guide.demonhunter.vengeance.sections.defensives.fieryBrand.explanation.graph">
              This chart shows your <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} />{' '}
              uptime along with the damage that you took.{' '}
              <strong>You do not need 100% uptime!</strong> However, damage taken without{' '}
              <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> active (shown in{' '}
              <Highlight color={red}>red</Highlight>) is dangerous!
            </Trans>
          </p>
        </Explanation>
        <HitBasedOverview
          info={info}
          hitBasedAnalyzer={fieryBrand}
          spell={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT}
          unmitigatedContent={
            <Trans id="guide.demonhunter.vengeance.sections.defensives.fieryBrand.data.unmitigated">
              <SpellLink id={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> would have reduced this by{' '}
              <strong>40%</strong>.
            </Trans>
          }
        />
      </ExplanationRow>
    </SubSection>
  );
}
