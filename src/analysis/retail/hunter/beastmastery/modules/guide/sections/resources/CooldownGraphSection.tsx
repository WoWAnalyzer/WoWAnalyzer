import { isTalent, Talent } from 'common/TALENTS/types';
import { Section, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import SpellLink from 'interface/SpellLink';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import TALENTS from 'common/TALENTS/hunter';
import Spell from 'common/SPELLS/Spell';

export interface Cooldown {
  spell: Spell;
  extraTalents?: Talent[];
}

const cooldownsToCheck: Cooldown[] = [{ spell: TALENTS.BESTIAL_WRATH_TALENT }];

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
    <Section title="Cooldowns">
      <p>
        <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> is Beast Mastery's only major cooldown.
        Use it on cooldown and avoid sitting on it.
      </p>
      <SubSection title="Cooldown Timeline">
        <div>
          <ul>
            <li>
              <strong>Grey segments</strong> indicate availability.
            </li>
            <li>
              <strong>Yellow segments</strong> indicate cooldown time.
            </li>
          </ul>
        </div>
        <p />
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
    </Section>
  );
};

export default CooldownGraphSubsection;
