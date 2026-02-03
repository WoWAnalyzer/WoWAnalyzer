import TALENTS from 'common/TALENTS/deathknight';
import CooldownGraphSubSection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';

const COOLDOWNS: Cooldown[] = [
  {
    spell: TALENTS.ARMY_OF_THE_DEAD_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.ARMY_OF_THE_DEAD_TALENT),
  },
];

export default function Cooldowns() {
  return <CooldownGraphSubSection cooldowns={COOLDOWNS} />;
}
