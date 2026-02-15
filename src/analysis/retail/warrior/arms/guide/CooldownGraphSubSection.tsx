import { Talent } from 'common/TALENTS/types';
import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import { TALENTS_WARRIOR } from 'common/TALENTS';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import SPELLS from 'common/SPELLS/warrior';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Spell from 'common/SPELLS/Spell';

interface Cooldown {
  talent: Talent;
  extraTalents?: Talent[];
  spell?: Spell;
}

const cooldownsToCheck: Cooldown[] = [
  { talent: TALENTS_WARRIOR.AVATAR_TALENT },
  { talent: TALENTS_WARRIOR.BLADESTORM_TALENT, spell: SPELLS.BLADESTORM },
  { talent: TALENTS_WARRIOR.COLOSSUS_SMASH_TALENT },
  { talent: TALENTS_WARRIOR.RAVAGER_TALENT },
  { talent: TALENTS_WARRIOR.DEMOLISH_TALENT },
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
    const talentCasts = castEfficiency.getCastEfficiencyForSpell(cooldown.talent)?.casts ?? 0;
    let spellCasts = 0;
    if (cooldown.spell) {
      spellCasts = castEfficiency.getCastEfficiencyForSpell(cooldown.spell)?.casts ?? 0;
    }
    return Math.max(talentCasts, spellCasts) >= 10;
  });

  return (
    <SubSection>
      <p>
        <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
        you waited to use them again. Grey segments show when the spell was available, yellow
        segments show when the spell was cooling down. Red segments highlight times when you could
        have fit a whole extra use of the cooldown.
      </p>
      {cooldowns.map((cooldownCheck) => (
        <CastEfficiencyBar
          key={cooldownCheck.talent.id}
          spell={cooldownCheck.spell || cooldownCheck.talent}
          gapHighlightMode={GapHighlight.FullCooldown}
          minimizeIcons={hasTooManyCasts}
        />
      ))}
    </SubSection>
  );
};

export default CooldownGraphSubsection;
