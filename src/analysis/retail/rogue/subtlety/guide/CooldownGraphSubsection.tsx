import { isTalent, Talent } from 'common/TALENTS/types';
import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import Spell from 'common/SPELLS/Spell';

export interface Cooldown {
  spell: Spell;
  extraTalents?: Talent[];
}

const cooldownsToCheck: Cooldown[] = [
  { spell: SPELLS.SYMBOLS_OF_DEATH },
  { spell: SPELLS.SHADOW_DANCE },
  { spell: TALENTS.FLAGELLATION_TALENT },
  { spell: TALENTS.SECRET_TECHNIQUE_TALENT },
  { spell: TALENTS.SHURIKEN_TORNADO_TALENT },
  { spell: SPELLS.VANISH },
  { spell: TALENTS.COLD_BLOOD_TALENT },
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
      <p>
        <strong>Cooldown Graph</strong> - This graph visualizes the usage of your cooldowns and
        highlights areas where optimizations can be made.
        <ul>
          <li>
            <strong>Grey segments</strong> indicate availability.
          </li>
          <li>
            <strong>Yellow segments</strong> indicate cooldown time.
          </li>
          <li>
            <strong>Red segments</strong> highlight areas where an extra cooldown could have fit.
          </li>
        </ul>
        For Subtlety, <strong>Symbols of Death</strong> and <strong>Shadow Dance</strong> usage is
        crucial, as they define your burst windows.
      </p>
      {cooldowns.map((cooldownCheck) => (
        <CastEfficiencyBar
          key={cooldownCheck.spell.id}
          spell={cooldownCheck.spell}
          gapHighlightMode={GapHighlight.FullCooldown}
          minimizeIcons={hasTooManyCasts}
          useThresholds
        />
      ))}
    </SubSection>
  );
};

export default CooldownGraphSubsection;
