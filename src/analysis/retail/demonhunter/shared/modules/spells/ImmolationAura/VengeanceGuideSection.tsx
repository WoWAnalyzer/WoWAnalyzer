import { useAnalyzer, useInfo } from 'interface/guide';
import ImmolationAura from './index';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'analysis/retail/demonhunter/vengeance/guide/CastSummaryAndBreakdown';
import { formatPercentage } from 'common/format';

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
    label: 'Immolation Auras',
  };
  const badImmolationAuras = {
    count: numberOfBadImmolationAuras,
    label: 'Bad Immolation Auras',
  };

  const falloutExplanation = (
    <>
      {' '}
      and having a chance to shatter a <SpellLink id={SPELLS.SOUL_FRAGMENT} /> with{' '}
      <SpellLink id={TALENTS_DEMON_HUNTER.FALLOUT_TALENT} />
    </>
  );
  const explanation = (
    <p>
      <strong>
        <SpellLink id={SPELLS.IMMOLATION_AURA} />
      </strong>{' '}
      is one of your primary <strong>builders</strong>. It deals a burst of damage when cast,
      generating 8 Fury immediately
      {info.combatant.hasTalent(TALENTS_DEMON_HUNTER.FALLOUT_TALENT) ? falloutExplanation : ''}. It
      then pulses damage every second for 6 seconds as well as generating 2 Fury on each pulse.
    </p>
  );
  const data = (
    <RoundedPanel>
      <p>
        <strong>
          {formatPercentage(numberOfGoodImmolationAuras / numberOfImmolationAuras, 1)}%
        </strong>{' '}
        of your <SpellLink id={SPELLS.IMMOLATION_AURA} /> casts were good.
      </p>
      <strong>Immolation Aura casts</strong>
      <small>
        Green is a good cast, Red is a bad cast. Mouseover for more details. Click to expand.
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
    </RoundedPanel>
  );

  return explanationAndDataSubsection(explanation, data);
};

export default VengeanceGuideSection;
