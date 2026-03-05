import TALENTS from 'common/TALENTS/warlock';
//import SPELLS from 'common/SPELLS';
import CoreCooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';

const cooldowns: Cooldown[] = [
  {
    spell: TALENTS.CALL_DREADSTALKERS_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.CALL_DREADSTALKERS_TALENT),
  },
  {
    spell: TALENTS.SUMMON_DEMONIC_TYRANT_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.SUMMON_DEMONIC_TYRANT_TALENT),
  },
  {
    spell: TALENTS.POWER_SIPHON_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.POWER_SIPHON_TALENT),
  },
  {
    spell: TALENTS.IMPLOSION_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.IMPLOSION_TALENT),
  },
  {
    spell: TALENTS.GRIMOIRE_IMP_LORD_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.GRIMOIRE_IMP_LORD_TALENT),
  },
  {
    spell: TALENTS.GRIMOIRE_FEL_RAVAGER_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.GRIMOIRE_FEL_RAVAGER_TALENT),
  },
];

function CooldownSubsection() {
  return <CoreCooldownGraphSubsection cooldowns={cooldowns} />;
}

export default CooldownSubsection;
