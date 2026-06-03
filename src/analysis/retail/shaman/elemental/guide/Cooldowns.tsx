import { GuideProps } from 'interface/guide';
import TALENTS from 'common/TALENTS/shaman';
import CombatLogParser from 'analysis/retail/shaman/elemental/CombatLogParser';
import CooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';
import SPELLS from 'common/SPELLS/shaman';

const COOLDOWNS: Cooldown[] = [
  {
    spell: TALENTS.ASCENDANCE_ELEMENTAL_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
  },
  {
    spell: SPELLS.ANCESTRAL_SWIFTNESS_CAST,
    isActive: (c) => c.hasTalent(TALENTS.ANCESTRAL_SWIFTNESS_TALENT),
  },
  {
    spell: SPELLS.STORMKEEPER_BUFF_AND_CAST,
    isActive: (c) => c.hasTalent(TALENTS.STORMKEEPER_TALENT),
  },
];

function Cooldowns({ modules }: GuideProps<typeof CombatLogParser>) {
  return modules.ascendance.guideSubsection;
}

export const ElementalCooldownGraphs = () => (
  <CooldownGraphSubsection title="Cooldown Graphs" cooldowns={COOLDOWNS} />
);

export default Cooldowns;
