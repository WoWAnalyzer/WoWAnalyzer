import { Section, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import TALENTS from 'common/TALENTS/warlock';
import { Talent } from 'common/TALENTS/types';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

interface Props {
  checklist: Talent[];
}

const COOLDOWNS: Talent[] = [
  TALENTS.NETHER_PORTAL_TALENT,
  TALENTS.GRIMOIRE_FELGUARD_TALENT,
  TALENTS.SUMMON_VILEFIEND_TALENT,
  TALENTS.SUMMON_DEMONIC_TYRANT_TALENT,
  TALENTS.DEMONIC_STRENGTH_TALENT,
  TALENTS.POWER_SIPHON_TALENT,
  TALENTS.GUILLOTINE_TALENT,
];

function Cooldowns() {
  return (
    <Section title="Cooldowns">
      <p>
        <strong>Cooldowns</strong> - this graph shows when you used your major cooldowns and how
        long you waited to use them again. Unless you're holding these for specific raid events, try
        to use these on as soon as they become available.
      </p>
      <CooldownGraphSubsection checklist={COOLDOWNS} />
    </Section>
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
        .filter((talent) => info.combatant.hasTalent(talent))
        .map((talent) => (
          <CastEfficiencyBar
            key={talent.id}
            spell={talent}
            gapHighlightMode={GapHighlight.All}
            minimizeIcons={(castEfficiency.getCastEfficiencyForSpell(talent)?.casts ?? 0) > 10}
            useThresholds
          />
        ))}
    </SubSection>
  );
};

export default Cooldowns;
