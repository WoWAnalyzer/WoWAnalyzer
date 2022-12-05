import { useAnalyzer, useInfo } from 'interface/guide';
import ImmolationAura from './index';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS/demonhunter';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatPercentage } from 'common/format';
import { t, Trans } from '@lingui/macro';

import CastSummaryAndBreakdown from '../../../guide/CastSummaryAndBreakdown';
import FalloutSnippet from './FalloutSnippet';

const VengeanceGuideSection = () => {
  const info = useInfo();
  const immolationAura = useAnalyzer(ImmolationAura);
  if (!info || !immolationAura) {
    return null;
  }

  const numberOfImmolationAuras = immolationAura.castEntries.length;
  const numberOfGoodImmolationAuras = immolationAura.castEntries.filter(
    (it) => it.value === QualitativePerformance.Good,
  ).length;
  const numberOfBadImmolationAuras = immolationAura.castEntries.filter(
    (it) => it.value === QualitativePerformance.Fail,
  ).length;
  const goodImmolationAuras = {
    count: numberOfGoodImmolationAuras,
    label: t({
      id:
        'guide.demonhunter.vengeance.sections.rotation.immolationAura.data.summary.performance.good',
      message: 'Immolation Auras',
    }),
  };
  const badImmolationAuras = {
    count: numberOfBadImmolationAuras,
    label: t({
      id:
        'guide.demonhunter.vengeance.sections.rotation.immolationAura.data.summary.performance.bad',
      message: 'Bad Immolation Auras',
    }),
  };

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
      <Trans id="guide.demonhunter.vengeance.sections.rotation.immolationAura.data">
        <p>
          <strong>
            {formatPercentage(numberOfGoodImmolationAuras / numberOfImmolationAuras, 1)}%
          </strong>{' '}
          of your <SpellLink id={SPELLS.IMMOLATION_AURA} /> casts were good.
        </p>
        <strong>Immolation Aura casts</strong>{' '}
        <small>
          - Green is a good cast, Red is a bad cast. Mouseover for more details. Click to expand.
        </small>
        <CastSummaryAndBreakdown
          castEntries={immolationAura.castEntries}
          good={goodImmolationAuras}
          bad={badImmolationAuras}
        />
        <strong>Immolation Aura cast efficiency</strong>
        <CastEfficiencyBar
          spellId={SPELLS.IMMOLATION_AURA.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          minimizeIcons
        />
      </Trans>
    </div>
  );

  return explanationAndDataSubsection(explanation, data);
};

export default VengeanceGuideSection;
