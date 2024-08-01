import { GuideProps, SubSection, useAnalyzer, useInfo } from 'interface/guide';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import TALENTS from 'common/TALENTS/shaman';
import { Talent } from 'common/TALENTS/types';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CombatLogParser from 'analysis/retail/shaman/elemental/CombatLogParser';
import Combatant from 'parser/core/Combatant';

interface Props {
  checklist: TalentWithCondition[];
}

interface TalentWithCondition extends Talent {
  condition?: (combatant: Combatant) => boolean;
}

const COOLDOWNS: TalentWithCondition[] = [TALENTS.ASCENDANCE_ELEMENTAL_TALENT];

function Cooldowns({ info, modules }: GuideProps<typeof CombatLogParser>) {
  return (
    <div>
      <SubSection title="">
        {modules.ascendance.guideSubsection}
        <CooldownGraphSubsection checklist={COOLDOWNS} />
      </SubSection>
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
        .filter((talent) => {
          if (talent.condition && !talent.condition(info.combatant)) {
            return false;
          }
          return info.combatant.hasTalent(talent);
        })
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
