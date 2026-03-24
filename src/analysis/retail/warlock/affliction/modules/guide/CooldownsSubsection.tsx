import TALENTS from 'common/TALENTS/warlock';
//import SPELLS from 'common/SPELLS';
import CoreCooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';

const cooldowns: Cooldown[] = [
  {
    spell: TALENTS.SUMMON_DARKGLARE_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.SUMMON_DARKGLARE_TALENT),
  },
  {
    spell: TALENTS.DARK_HARVEST_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.DARK_HARVEST_TALENT),
  },
];

function CooldownSubsection() {
  return <CoreCooldownGraphSubsection cooldowns={cooldowns} />;
}

export default CooldownSubsection;
