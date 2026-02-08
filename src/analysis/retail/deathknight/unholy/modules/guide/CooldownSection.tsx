import SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import CooldownGraphSubSection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';

const COOLDOWNS: Cooldown[] = [
  {
    spell: SPELLS.DARK_TRANSFORMATION,
    isActive: (c) => c.hasTalent(TALENTS.DARK_TRANSFORMATION_TALENT),
  },
  {
    spell: TALENTS.ARMY_OF_THE_DEAD_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.ARMY_OF_THE_DEAD_TALENT),
  },
  {
    spell: SPELLS.SUMMON_GARGOYLE,
    isActive: (c) => c.hasTalent(TALENTS.SUMMON_GARGOYLE_TALENT),
  },
];

export default function Cooldowns() {
  return <CooldownGraphSubSection cooldowns={COOLDOWNS} />;
}
