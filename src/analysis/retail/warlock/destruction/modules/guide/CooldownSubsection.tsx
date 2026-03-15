import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import CoreCooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';

const cooldowns: Cooldown[] = [
  {
    spell: SPELLS.SUMMON_INFERNAL,
    isActive: () => true,
  },
  {
    spell: TALENTS.HAVOC_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.HAVOC_TALENT),
  },
  {
    spell: TALENTS.SOUL_FIRE_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.SOUL_FIRE_TALENT),
  },
  {
    spell: SPELLS.MALEVOLENCE,
    isActive: (c) => c.hasTalent(TALENTS.MALEVOLENCE_TALENT),
  },
];

function CooldownSubsection() {
  return (
    <>
      <CoreCooldownGraphSubsection cooldowns={cooldowns} />

      <p>
        Proper use of your cooldown abilities is critical for maximizing your damage output. These
        abilities should generally be cast as often as possible throughout the fight unless you are
        deliberately holding them for an important damage window.
      </p>
    </>
  );
}

export default CooldownSubsection;
