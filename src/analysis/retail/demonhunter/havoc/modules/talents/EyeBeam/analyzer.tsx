import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import Events, { CastEvent } from 'parser/core/Events';
import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import MajorCooldown, { SpellCast } from 'parser/core/MajorCooldowns/MajorCooldown';
import { Trans } from '@lingui/macro';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';

import DemonicExplanation from './DemonicExplanation';
import { getFuriousGazeBuffApplication } from '../../../normalizers/FuriousGazeNormalizer';
import FuriousGazeExplanation from '../../../modules/talents/EyeBeam/FuriousGazeExplanation';

interface EyeBeamCooldownCast extends SpellCast {
  triggeredFuriousGaze: boolean;
}

export default class EyeBeam extends MajorCooldown<EyeBeamCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
  };

  constructor(options: Options) {
    super({ spell: TALENTS.EYE_BEAM_TALENT }, options);
    this.active = this.active && this.selectedCombatant.hasTalent(TALENTS.FURIOUS_GAZE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.EYE_BEAM_TALENT),
      this.onCast,
    );
  }

  description() {
    return (
      <>
        <section style={{ marginBottom: 20 }}>
          <Trans id="guide.demonhunter.havoc.sections.cooldowns.eyeBeam.explanation">
            <strong>
              <SpellLink spell={TALENTS.EYE_BEAM_TALENT} />
            </strong>{' '}
            is a channeled ability that deals heavy chaos damage to all enemies in front of you.
          </Trans>
        </section>
        <section>
          <DemonicExplanation />
          <FuriousGazeExplanation />
        </section>
      </>
    );
  }

  explainPerformance(cast: EyeBeamCooldownCast): SpellUse {
    const furiousGazePerformance = this.furiousGazePerformance(cast);

    const checklistItems: ChecklistUsageInfo[] = [];
    if (furiousGazePerformance) {
      checklistItems.push({
        check: 'furious-gaze',
        timestamp: cast.event.timestamp,
        ...furiousGazePerformance,
      });
    }

    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );
    return {
      event: cast.event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    };
  }

  private furiousGazePerformance(cast: EyeBeamCooldownCast): UsageInfo | undefined {
    if (!this.selectedCombatant.hasTalent(TALENTS.FURIOUS_GAZE_TALENT)) {
      return undefined;
    }

    const summary = <div>Trigger Furious Gaze</div>;

    if (cast.triggeredFuriousGaze) {
      return {
        performance: QualitativePerformance.Good,
        summary,
        details: (
          <div>
            You triggered <SpellLink spell={SPELLS.FURIOUS_GAZE} /> by fully channeling your{' '}
            <SpellLink spell={TALENTS.EYE_BEAM_TALENT} /> cast. Good job!
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Fail,
      summary,
      details: (
        <div>
          You did not trigger <SpellLink spell={SPELLS.FURIOUS_GAZE} /> due to not fully channeling
          your <SpellLink spell={TALENTS.EYE_BEAM_TALENT} /> cast. Always try to fully channel so
          that you get the Haste buff.
        </div>
      ),
    };
  }

  private onCast(event: CastEvent) {
    this.recordCooldown({
      event,
      triggeredFuriousGaze: getFuriousGazeBuffApplication(event) !== undefined,
    });
  }
}
