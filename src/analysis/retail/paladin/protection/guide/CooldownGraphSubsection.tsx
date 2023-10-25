import TALENTS from 'common/TALENTS/paladin';
import SPELLS from 'common/SPELLS';
import CooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';

const cooldownsToCheck: Cooldown[] = [
  {
    spell: SPELLS.AVENGING_WRATH,
    isActive: (c) => !c.hasTalent(TALENTS.SENTINEL_TALENT),
  },
  { spell: TALENTS.SENTINEL_TALENT },
  { spell: TALENTS.DIVINE_TOLL_TALENT },
  {
    spell: TALENTS.MOMENT_OF_GLORY_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.MOMENT_OF_GLORY_TALENT),
  },
  { spell: TALENTS.EYE_OF_TYR_TALENT },
  { spell: TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT },
  { spell: TALENTS.ARDENT_DEFENDER_TALENT },
  {
    spell: SPELLS.DIVINE_SHIELD,
    isActive: (c) => c.hasTalent(TALENTS.FINAL_STAND_TALENT),
  },
];

const CooldownGraphSubsectionPP = () => <CooldownGraphSubsection cooldowns={cooldownsToCheck} />;

export default CooldownGraphSubsectionPP;
