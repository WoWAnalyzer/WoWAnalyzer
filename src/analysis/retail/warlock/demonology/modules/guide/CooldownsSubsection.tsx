import TALENTS from 'common/TALENTS/warlock';
import SPELLS from 'common/SPELLS';
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
    spell: TALENTS.DEMONIC_STRENGTH_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.DEMONIC_STRENGTH_TALENT),
  },
  {
    spell: TALENTS.POWER_SIPHON_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.POWER_SIPHON_TALENT),
  },
  {
    spell: TALENTS.BILESCOURGE_BOMBERS_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.BILESCOURGE_BOMBERS_TALENT),
  },
  {
    spell: TALENTS.GUILLOTINE_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.GUILLOTINE_TALENT),
  },
  {
    spell: TALENTS.GRIMOIRE_FELGUARD_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.GRIMOIRE_FELGUARD_TALENT),
  },
  {
    spell: TALENTS.SUMMON_VILEFIEND_TALENT,
    isActive: (c) =>
      c.hasTalent(TALENTS.SUMMON_VILEFIEND_TALENT) &&
      !c.hasTalent(TALENTS.MARK_OF_FHARG_TALENT) &&
      !c.hasTalent(TALENTS.MARK_OF_SHATUG_TALENT),
  },
  {
    spell: SPELLS.CHARHOUND_SUMMON,
    isActive: (c) => c.hasTalent(TALENTS.MARK_OF_FHARG_TALENT),
  },
  {
    spell: SPELLS.GLOOMHOUND_SUMMON,
    isActive: (c) => c.hasTalent(TALENTS.MARK_OF_SHATUG_TALENT),
  },
];

function CooldownSubsection() {
  return <CoreCooldownGraphSubsection cooldowns={cooldowns} />;
}

export default CooldownSubsection;
