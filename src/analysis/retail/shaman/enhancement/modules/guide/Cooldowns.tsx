import { GuideProps, Section } from 'interface/guide';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import CombatLogParser from 'analysis/retail/shaman/enhancement/CombatLogParser';
import CooldownGraphSubsection, {
  Cooldown,
} from 'interface/guide/components/CooldownGraphSubSection';

const COOLDOWNS: Cooldown[] = [
  {
    spell: TALENTS.DOOM_WINDS_TALENT,
    isActive: (c) =>
      c.hasTalent(TALENTS.DOOM_WINDS_TALENT) &&
      !(
        c.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT) ||
        c.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT)
      ),
  },
  {
    spell: TALENTS.SUNDERING_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.SUNDERING_TALENT),
  },
  {
    spell: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
  },
  {
    spell: SPELLS.SURGING_TOTEM,
    isActive: (c) => c.hasTalent(TALENTS.SURGING_TOTEM_TALENT),
  },
];

function Cooldowns({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Core">
      {modules.hotHand.guideSubsection}
      {modules.doomWinds.guideSubsection}
      {modules.primordialStorm.guideSubsection}
      {modules.elementalTempo.guideSubsection}
      {modules.stormUnleashed.guideSubsection}
      <CooldownGraphSubsection title="Cooldowns" cooldowns={COOLDOWNS} />
    </Section>
  );
}

export default Cooldowns;
