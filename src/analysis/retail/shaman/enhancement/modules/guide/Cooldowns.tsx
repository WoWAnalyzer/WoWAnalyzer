import { GuideProps, Section, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import TALENTS from 'common/TALENTS/shaman';
import { Talent } from 'common/TALENTS/types';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CombatLogParser from 'analysis/retail/shaman/enhancement/CombatLogParser';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';

interface Props {
  checklist: Talent[];
}

const COOLDOWNS: Talent[] = [
  TALENTS.FERAL_SPIRIT_TALENT,
  TALENTS.SUNDERING_TALENT,
  TALENTS.DOOM_WINDS_TALENT,
  TALENTS.PRIMORDIAL_WAVE_TALENT,
  TALENTS.ASCENDANCE_ENHANCEMENT_TALENT,
];

function Cooldowns({ info, modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldowns">
      <SubSection title="Cooldowns">
        <p>
          <strong>Cooldowns</strong> - this graph shows when you used your major cooldowns and how
          long you waited to use them again. Unless you're holding these for specific raid events,
          try to use these on as soon as they become available.
        </p>
        <CooldownGraphSubsection checklist={COOLDOWNS} />
      </SubSection>
      {(info.combatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT) ||
        info.combatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT)) && (
        <SubSection title="Ascendance">
          <CooldownUsage analyzer={modules.ascendance} />
        </SubSection>
      )}
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
