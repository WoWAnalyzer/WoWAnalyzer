import { GuideProps, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import TALENTS from 'common/TALENTS/shaman';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CombatLogParser from 'analysis/retail/shaman/elemental/CombatLogParser';
import { Cooldown } from 'interface/guide/components/CooldownGraphSubSection';
import SPELLS from 'common/SPELLS/shaman';

interface Props {
  checklist: Cooldown[];
}

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

export const ElementalCooldownGraphs = () => <CooldownGraphSubsection checklist={COOLDOWNS} />;

const CooldownGraphSubsection = ({ checklist }: Props) => {
  const info = useInfo();
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  return (
    <SubSection title="Cooldown Graphs">
      {checklist
        .filter((cooldown) => cooldown.isActive && cooldown.isActive(info.combatant))
        .map((cooldown) => (
          <CastEfficiencyBar
            key={cooldown.spell.id}
            spell={cooldown.spell}
            gapHighlightMode={GapHighlight.All}
            minimizeIcons={
              (castEfficiency.getCastEfficiencyForSpell(cooldown.spell)?.casts ?? 0) > 10
            }
            useThresholds
          />
        ))}
    </SubSection>
  );
};

export default Cooldowns;
