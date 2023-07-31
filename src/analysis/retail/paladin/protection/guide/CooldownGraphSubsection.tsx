import { isTalent, Talent } from 'common/TALENTS/types';
import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/paladin';
import Combatant from 'parser/core/Combatant';
import SPELLS from 'common/SPELLS';

type Cooldown = {
  spell: Spell;
  extraTalents?: Talent[];
  isActive?: (c: Combatant) => boolean;
};

const cooldownsToCheck: Cooldown[] = [
  {
    spell: TALENTS.AVENGING_WRATH_TALENT,
    isActive: (c) => !c.hasTalent(TALENTS.SENTINEL_TALENT),
  },
  { spell: TALENTS.SENTINEL_TALENT },
  { spell: TALENTS.DIVINE_TOLL_TALENT },
  { spell: TALENTS.MOMENT_OF_GLORY_TALENT },
  { spell: TALENTS.EYE_OF_TYR_TALENT },
  { spell: TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT },
  { spell: TALENTS.ARDENT_DEFENDER_TALENT },
  {
    spell: SPELLS.DIVINE_SHIELD,
    isActive: (c) => c.hasTalent(TALENTS.FINAL_STAND_TALENT),
  },
];

const CooldownGraphSubsection = () => {
  const info = useInfo();
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  const cooldowns = cooldownsToCheck.filter((cooldown) => {
    const hasTalent = !isTalent(cooldown.spell) || info.combatant.hasTalent(cooldown.spell);
    const hasExtraTalents =
      cooldown.extraTalents?.reduce(
        (acc, talent) => acc && info.combatant.hasTalent(talent),
        true,
      ) ?? true;
    return hasTalent && hasExtraTalents;
  });
  const hasTooManyCasts = cooldowns.some((cooldown) => {
    const casts = castEfficiency.getCastEfficiencyForSpell(cooldown.spell)?.casts ?? 0;
    return casts >= 10;
  });

  return (
    <SubSection>
      <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
      you waited to use them again. Grey segments show when the spell was available, yellow segments
      show when the spell was cooling down. Red segments highlight times when you could have fit a
      whole extra use of the cooldown.
      {cooldowns.map((cooldownCheck) => (
        <CastEfficiencyBar
          key={cooldownCheck.spell.id}
          spellId={cooldownCheck.spell.id}
          gapHighlightMode={GapHighlight.FullCooldown}
          minimizeIcons={hasTooManyCasts}
          useThresholds
        />
      ))}
    </SubSection>
  );
};

export default CooldownGraphSubsection;
