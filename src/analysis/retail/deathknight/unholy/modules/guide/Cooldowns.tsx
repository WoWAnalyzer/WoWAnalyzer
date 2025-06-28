import SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import { GuideProps, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CombatLogParser from 'analysis/retail/deathknight/unholy/CombatLogParser';
import { Cooldown } from 'interface/guide/components/CooldownGraphSubSection';

interface Props {
  checklist: Cooldown[];
}

const COOLDOWNS: Cooldown[] = [
  {
    spell: TALENTS.APOCALYPSE_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.APOCALYPSE_TALENT),
  },
  {
    spell: TALENTS.RAISE_ABOMINATION_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.RAISE_ABOMINATION_TALENT),
  },
  {
    spell: TALENTS.DARK_TRANSFORMATION_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.DARK_TRANSFORMATION_TALENT),
  },

  {
    spell: TALENTS.UNHOLY_ASSAULT_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.UNHOLY_ASSAULT_TALENT),
  },
  {
    spell: TALENTS.ABOMINATION_LIMB_TALENT,
    isActive: (c) => c.hasTalent(TALENTS.ABOMINATION_LIMB_TALENT),
  },
  {
    spell: SPELLS.DEATH_AND_DECAY,
    isActive: () => true,
  },
];

function Cooldowns({ info, modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <div>
      <CooldownGraphSubsection checklist={COOLDOWNS} />
    </div>
  );
}

const CooldownGraphSubsection = ({ checklist }: Props) => {
  const info = useInfo();
  const castEfficiency = useAnalyzer(CastEfficiency);
  if (!info || !castEfficiency) {
    return null;
  }

  return (
    <SubSection>
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
