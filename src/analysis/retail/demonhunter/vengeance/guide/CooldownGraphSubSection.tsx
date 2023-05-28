import { Talent } from 'common/TALENTS/types';
import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import SPELLS from 'common/SPELLS/demonhunter';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { Trans } from '@lingui/macro';

type Cooldown = {
  talent: Talent;
  extraTalents?: Talent[];
};

const cooldownsToCheck: Cooldown[] = [
  { talent: TALENTS_DEMON_HUNTER.SOUL_CARVER_TALENT },
  { talent: TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT },
  { talent: TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT },
  { talent: TALENTS_DEMON_HUNTER.THE_HUNT_TALENT },
  { talent: TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT },
  { talent: TALENTS_DEMON_HUNTER.BULK_EXTRACTION_TALENT },
  {
    talent: TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT,
    extraTalents: [TALENTS_DEMON_HUNTER.FIERY_DEMISE_TALENT],
  },
];

const CooldownGraphSubsection = () => {
  const info = useInfo();
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  const cooldowns = cooldownsToCheck.filter((cooldown) => {
    const hasTalent = info.combatant.hasTalent(cooldown.talent);
    const hasExtraTalents =
      cooldown.extraTalents?.reduce(
        (acc, talent) => acc && info.combatant.hasTalent(talent),
        true,
      ) ?? true;
    return hasTalent && hasExtraTalents;
  });
  const hasTooManyCasts = cooldowns.some((cooldown) => {
    const casts = castEfficiency.getCastEfficiencyForSpell(cooldown.talent)?.casts ?? 0;
    return casts >= 10;
  });

  return (
    <SubSection>
      <Trans id="guide.demonhunter.vengeance.sections.cooldowns.graph">
        <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
        you waited to use them again. Grey segments show when the spell was available, yellow
        segments show when the spell was cooling down. Red segments highlight times when you could
        have fit a whole extra use of the cooldown.
      </Trans>
      <CastEfficiencyBar
        spellId={SPELLS.METAMORPHOSIS_TANK.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons={hasTooManyCasts}
      />
      {cooldowns.map((cooldownCheck) => (
        <CastEfficiencyBar
          key={cooldownCheck.talent.id}
          spellId={cooldownCheck.talent.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          minimizeIcons={hasTooManyCasts}
          useThresholds
        />
      ))}
    </SubSection>
  );
};

export default CooldownGraphSubsection;
