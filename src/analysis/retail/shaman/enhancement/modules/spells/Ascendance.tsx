import { Options } from 'parser/core/Analyzer';
import SpellUsable from '../core/SpellUsable';
import ThorimsInvocation from '../talents/ThorimsInvocation';
import TALENTS from 'common/TALENTS/shaman';
import MajorCooldown, { SpellCast } from 'parser/core/MajorCooldowns/MajorCooldown';
import { SpellUse } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

interface AscendanceCooldownCast extends SpellCast {
  buffedCasts: number;
}

class AscendanceAnalyzer extends MajorCooldown<AscendanceCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    spellUsable: SpellUsable,
    thorimsInvocation: ThorimsInvocation,
  };

  constructor(options: Options) {
    super({ spell: TALENTS.ASCENDANCE_ENHANCEMENT_TALENT }, options);
  }

  spellUsable!: SpellUsable;
  thorimsInvocation!: ThorimsInvocation;

  get guideSubsection(): JSX.Element {
    return <></>;
  }

  description() {
    return <></>;
  }

  explainPerformance(cast: AscendanceCooldownCast): SpellUse {
    return {
      event: cast.event,
      performance: QualitativePerformance.Fail,
      performanceExplanation: 'Bad Usage',
      checklistItems: [],
    };
  }
}

export default AscendanceAnalyzer;
