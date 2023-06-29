import { Section, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import TALENTS from 'common/TALENTS/shaman';
import { Talent } from 'common/TALENTS/types';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { Trans } from '@lingui/macro';

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

function Cooldowns() {
  return (
    <Section title="Cooldowns">
      <Trans id="guide.shaman.enhancement.sections.cooldowns">
        <strong>Cooldowns</strong> - this graph shows when you used your major cooldowns and how
        long you waited to use them again. Unless you're holding these for specific raid events, try
        to use these on as soon as they become available.
      </Trans>
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
