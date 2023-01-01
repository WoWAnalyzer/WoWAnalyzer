import { Talent } from 'common/TALENTS/types';
import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import TALENTS from 'common/TALENTS/priest';
//import SPELLS from 'common/SPELLS/priest';

import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { Trans } from '@lingui/macro';

type Cooldown = {
  talent: Talent;
  extraTalents?: Talent[];
};

const cooldownsToCheck: Cooldown[] = [
  //{ talent: SPELLS.MIND_BLAST },
  //{ talent: TALENTS.SHADOW_WORD_DEATH_TALENT },
  { talent: TALENTS.SHADOW_CRASH_TALENT },
  { talent: TALENTS.VOID_TORRENT_TALENT },
  { talent: TALENTS.DAMNATION_TALENT },
  { talent: TALENTS.DARK_VOID_TALENT },
  { talent: TALENTS.MINDGAMES_TALENT },
];

const ShortCooldownGraphSubsection = () => {
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
      <Trans id="guide.priest.shadow.sections.core.graph">
        <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
        you waited to use them again. These spells should be used on cooldown.
      </Trans>
      {cooldowns.map((cooldownCheck) => (
        <CastEfficiencyBar
          key={cooldownCheck.talent.id}
          spellId={cooldownCheck.talent.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          minimizeIcons={hasTooManyCasts}
        />
      ))}
    </SubSection>
  );
};

export default ShortCooldownGraphSubsection;
