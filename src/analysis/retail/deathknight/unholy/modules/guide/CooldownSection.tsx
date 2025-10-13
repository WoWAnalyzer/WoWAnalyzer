import TALENTS from 'common/TALENTS/deathknight';
import CooldownGraphSubSection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';

const COOLDOWNS: Cooldown[] = [
  {
    spell: TALENTS.APOCALYPSE_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.APOCALYPSE_TALENT),
  },
  {
    spell: TALENTS.DARK_TRANSFORMATION_TALENT,
    isActive: (c) =>
      c.hasTalent(TALENTS.DARK_TRANSFORMATION_TALENT) && !c.hasTalent(TALENTS.APOCALYPSE_TALENT),
  },
  {
    spell: TALENTS.LEGION_OF_SOULS_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.LEGION_OF_SOULS_TALENT),
  },
  {
    spell: TALENTS.RAISE_ABOMINATION_TALENT,
    isActive: (c) =>
      c.hasTalent(TALENTS.RAISE_ABOMINATION_TALENT) && !c.hasTalent(TALENTS.LEGION_OF_SOULS_TALENT),
  },
  {
    spell: TALENTS.ARMY_OF_THE_DEAD_TALENT,
    isActive: (c) =>
      !c.hasTalent(TALENTS.LEGION_OF_SOULS_TALENT) &&
      !c.hasTalent(TALENTS.RAISE_ABOMINATION_TALENT),
  },
  {
    spell: TALENTS.SUMMON_GARGOYLE_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.SUMMON_GARGOYLE_TALENT),
  },
  {
    spell: TALENTS.UNHOLY_ASSAULT_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.UNHOLY_ASSAULT_TALENT),
  },
];

export default function Cooldowns() {
  return <CooldownGraphSubSection cooldowns={COOLDOWNS} />;
}
