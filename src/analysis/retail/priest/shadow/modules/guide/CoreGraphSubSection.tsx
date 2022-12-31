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

const CoreGraphSubsection = () => {
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
      <Trans id="guide.priest.shadow.sections.cooldowns.graph">
        <strong>Core Graph</strong> - this graph shows when you used your cooldowns and how long you
        waited to use them again. Grey segments show when the spell was available, yellow segments
        show when the spell was cooling down. Red segments highlight times when you could have fit a
        whole extra use of the cooldown.
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

export default CoreGraphSubsection;
