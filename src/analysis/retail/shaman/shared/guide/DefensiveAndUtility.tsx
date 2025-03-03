import TALENTS from 'common/TALENTS/shaman';
import { Section } from 'interface/guide';
import CooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';

const defensiveTalents: Cooldown[] = [
  { spell: TALENTS.ASTRAL_SHIFT_TALENT, isActive: (c) => c.hasTalent(TALENTS.ASTRAL_SHIFT_TALENT) },
  {
    spell: TALENTS.EARTH_ELEMENTAL_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.EARTH_ELEMENTAL_TALENT),
  },
  {
    spell: TALENTS.NATURES_SWIFTNESS_TALENT,
    isActive: (c) =>
      c.hasTalent(TALENTS.NATURES_SWIFTNESS_TALENT) &&
      !c.hasTalent(TALENTS.ANCESTRAL_SWIFTNESS_TALENT),
  },
  {
    spell: TALENTS.EARTHEN_WALL_TOTEM_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.EARTHEN_WALL_TOTEM_TALENT),
  },
  {
    spell: TALENTS.SPIRITWALKERS_GRACE_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.SPIRITWALKERS_GRACE_TALENT),
  },
  {
    spell: TALENTS.STONE_BULWARK_TOTEM_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.STONE_BULWARK_TOTEM_TALENT),
  },
];

export default function DefensiveAndUtility() {
  return (
    <>
      <Section title="Defensive and utility">
        <CooldownGraphSubsection
          cooldowns={defensiveTalents}
          description={
            <p>
              <strong>Defensives and utility</strong> - Defensive and utility talent usage may vary
              from fight to fight. They may need to be delayed for specific mechanics. In general,
              any amount of usage is good, but anywhere you could fit in another usage is a
              theoretical loss.
            </p>
          }
        />
      </Section>
    </>
  );
}
