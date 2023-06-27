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

export default function FieryBrandSubSection() {
  const info = useInfo();
  const fieryBrand = useAnalyzer(FieryBrand);
  if (!info || !fieryBrand) {
    return null;
  }

  return (
    <SubSection title="Fiery Brand">
      <ExplanationRow>
        <Explanation>
          <p>
            <>
              <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> reduces the damage dealt
              to you by targets with its debuff by <strong>40%</strong>.
            </>
          </p>
          <p>
            <>
              This chart shows your <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} />{' '}
              uptime along with the damage that you took.{' '}
              <strong>You do not need 100% uptime!</strong> However, damage taken without{' '}
              <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> active (shown in{' '}
              <Highlight color={red}>red</Highlight>) is dangerous!
            </>
          </p>
        </Explanation>
        <HitBasedOverview
          info={info}
          hitBasedAnalyzer={fieryBrand}
          spell={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT}
          unmitigatedContent={
            <>
              <SpellLink spell={TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT} /> would have reduced this
              by <strong>40%</strong>.
            </>
          }
        />
      </ExplanationRow>
    </SubSection>
  );
}
