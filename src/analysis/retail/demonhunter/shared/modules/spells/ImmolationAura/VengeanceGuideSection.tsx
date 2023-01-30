import { useAnalyzer, useInfo } from 'interface/guide';
import ImmolationAura from './index';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS/demonhunter';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';
import { t, Trans } from '@lingui/macro';

import CastSummaryAndBreakdown from '../../../guide/CastSummaryAndBreakdown';
import FalloutSnippet from './FalloutSnippet';

const VengeanceGuideSection = () => {
  const info = useInfo();
  const immolationAura = useAnalyzer(ImmolationAura);
  if (!info || !immolationAura) {
    return null;
  }

  const explanation = (
    <p>
      <Trans id="guide.demonhunter.vengeance.sections.rotation.immolationAura.explanation">
        <strong>
          <SpellLink id={SPELLS.IMMOLATION_AURA} />
        </strong>{' '}
        is one of your primary <strong>builders</strong>. It deals a burst of damage when cast,
        generating 8 Fury immediately
        <FalloutSnippet />. It then pulses damage every second for 6 seconds as well as generating 2
        Fury on each pulse.
      </Trans>
    </p>
  );
  const data = (
    <div>
      <CastSummaryAndBreakdown
        spell={SPELLS.IMMOLATION_AURA}
        castEntries={immolationAura.castEntries}
        goodLabel={t({
          id:
            'guide.demonhunter.vengeance.sections.rotation.immolationAura.data.summary.performance.good',
          message: 'Immolation Auras',
        })}
        includeGoodCastPercentage
        badLabel={t({
          id:
            'guide.demonhunter.vengeance.sections.rotation.immolationAura.data.summary.performance.bad',
          message: 'Bad Immolation Auras',
        })}
      />
      <strong>
        <SpellLink id={SPELLS.IMMOLATION_AURA} />{' '}
        <Trans id="guide.castEfficiency">cast efficiency</Trans>
      </strong>
      <CastEfficiencyBar
        spellId={SPELLS.IMMOLATION_AURA.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
      />
    </div>
  );
  const noCastData = (
    <div>
      <p>
        <Trans id="guide.demonhunter.vengeance.sections.rotation.immolationAura.noCast">
          You did not cast Immolation Aura during this encounter.
        </Trans>
      </p>
    </div>
  );

  return (
    <ExplanationAndDataSubSection
      explanation={explanation}
      data={immolationAura.castEntries.length > 0 ? data : noCastData}
    />
  );
};

export default VengeanceGuideSection;
