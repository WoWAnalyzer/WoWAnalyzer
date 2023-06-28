import { GuideProps, Section, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import CombatLogParser from 'analysis/retail/shaman/enhancement/CombatLogParser';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import TALENTS from 'common/TALENTS/shaman';
import { Talent } from 'common/TALENTS/types';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { Trans } from '@lingui/macro';
import Ascendance from 'analysis/retail/shaman/enhancement/modules/talents/Ascendance';
import { SpellLink } from 'interface';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';

type Cooldown = {
  talent: Talent;
  extraTalents?: Talent[];
};

interface Props {
  checklist: Cooldown[];
}

const COOLDOWNS: Cooldown[] = [
  { talent: TALENTS.FERAL_SPIRIT_TALENT },
  { talent: TALENTS.SUNDERING_TALENT },
  { talent: TALENTS.DOOM_WINDS_TALENT },
  { talent: TALENTS.PRIMORDIAL_WAVE_TALENT },
  { talent: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT },
];

const PROCS: Cooldown[] = [
  { talent: TALENTS.HOT_HAND_TALENT },
  { talent: TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT },
];

function Cooldowns({ modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <Section title="Cooldown & Proc Usage">
      <Section title="Cooldowns">
        <Trans id="guide.shaman.enhancement.sections.cooldowns">
          <strong>Cooldowns</strong> - this graph shows when you used your major cooldowns and how
          long you waited to use them again. Unless you're holding these for specific raid events,
          try to use these on cooldown.
        </Trans>
        <CooldownGraphSubsection checklist={COOLDOWNS} />
      </Section>
      <Section title="Proc Usage">
        <Trans id="guide.shaman.enhacement.sections.procs">
          <strong>Procs</strong> - this section details how well you utilized the high-throughput
          procs (i.e. <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} /> and{' '}
          <SpellLink spell={TALENTS.HOT_HAND_TALENT} />)
        </Trans>
        <ProcSubsection checklist={PROCS} />
      </Section>
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
        .filter((cooldown) => info.combatant.hasTalent(cooldown.talent))
        .map((cooldown) => (
          <CastEfficiencyBar
            key={cooldown.talent.id}
            spell={cooldown.talent}
            gapHighlightMode={GapHighlight.All}
            minimizeIcons={
              (castEfficiency.getCastEfficiencyForSpell(cooldown.talent)?.casts ?? 0) > 10
            }
            useThresholds
          />
        ))}
    </SubSection>
  );
};

const ProcSubsection = ({ checklist }: Props) => {
  const info = useInfo();
  const AscendanceAnalyzer = useAnalyzer(Ascendance);

  if (!info || !AscendanceAnalyzer) {
    return null;
  }

  return <CooldownUsage analyzer={AscendanceAnalyzer} />;
};

export default Cooldowns;
