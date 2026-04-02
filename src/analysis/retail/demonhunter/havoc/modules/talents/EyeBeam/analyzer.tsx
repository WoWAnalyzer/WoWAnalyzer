import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import Events, { CastEvent } from 'parser/core/Events';
import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';

import DemonicExplanation from './DemonicExplanation';
import { getFuriousGazeBuffApplication } from '../../../normalizers/FuriousGazeNormalizer';
import FuriousGazeExplanation from '../../../modules/talents/EyeBeam/FuriousGazeExplanation';

interface EyeBeamCooldownCast extends CooldownTrigger<CastEvent> {
  triggeredFuriousGaze: boolean;
  startedDuringInertia: boolean;
  fullyDuringInertia: boolean;
}

export default class EyeBeam extends MajorCooldown<EyeBeamCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
  };

  constructor(options: Options) {
    super({ spell: TALENTS.EYE_BEAM_TALENT }, options);

    const hasRelevantTalents =
      this.selectedCombatant.hasTalent(TALENTS.FURIOUS_GAZE_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.INERTIA_TALENT);

    this.active = hasRelevantTalents;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.EYE_BEAM_TALENT),
      this.onCast,
    );
  }

  description() {
    return (
      <>
        <section style={{ marginBottom: 20 }}>
          <strong>
            <SpellLink spell={TALENTS.EYE_BEAM_TALENT} />
          </strong>{' '}
          is a channeled ability that deals heavy chaos damage to all enemies in front of you.
          {this.selectedCombatant.hasTalent(TALENTS.INERTIA_TALENT) && (
            <>
              {' '}
              For optimal usage with <SpellLink spell={TALENTS.INERTIA_TALENT} />, the full channel
              should fit inside the <SpellLink spell={SPELLS.INERTIA_BUFF} /> buff window.
            </>
          )}
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
    const inertiaPerformance = this.inertiaPerformance(cast);
    const checklistItems: ChecklistUsageInfo[] = [];
    if (furiousGazePerformance) {
      checklistItems.push({
        check: 'furious-gaze',
        timestamp: cast.event.timestamp,
        ...furiousGazePerformance,
      });
    }
    if (inertiaPerformance) {
      checklistItems.push({
        check: 'inertia',
        timestamp: cast.event.timestamp,
        ...inertiaPerformance,
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

  private inertiaPerformance(cast: EyeBeamCooldownCast): UsageInfo | undefined {
    if (!this.selectedCombatant.hasTalent(TALENTS.INERTIA_TALENT)) {
      return undefined;
    }
    if (cast.fullyDuringInertia) {
      return {
        performance: QualitativePerformance.Good,
        summary: <div>Fully channeled during Inertia</div>,
        details: (
          <div>
            You fully channeled <SpellLink spell={TALENTS.EYE_BEAM_TALENT} /> during{' '}
            <SpellLink spell={SPELLS.INERTIA_BUFF} />. Good job!
          </div>
        ),
      };
    }
    if (cast.startedDuringInertia) {
      return {
        performance: QualitativePerformance.Ok,
        summary: <div>Started during Inertia</div>,
        details: (
          <div>
            You started <SpellLink spell={TALENTS.EYE_BEAM_TALENT} /> during{' '}
            <SpellLink spell={SPELLS.INERTIA_BUFF} />, but the full channel did not fit inside the
            buff window.
          </div>
        ),
      };
    }
    return {
      performance: QualitativePerformance.Fail,
      summary: <div>Cast outside Inertia</div>,
      details: (
        <div>
          You cast <SpellLink spell={TALENTS.EYE_BEAM_TALENT} /> without{' '}
          <SpellLink spell={SPELLS.INERTIA_BUFF} /> covering the full channel. Try to line up the
          entire channel inside the buff window.
        </div>
      ),
    };
  }

  private getInertiaWindow(event: CastEvent) {
    const activeInertiaBuff = this.selectedCombatant.getBuff(
      SPELLS.INERTIA_BUFF.id,
      event.timestamp,
    );
    if (!activeInertiaBuff) {
      return {
        startedDuringInertia: false,
        fullyDuringInertia: false,
      };
    }
    const channelEnd = event.channel?.timestamp;
    if (!channelEnd) {
      return {
        startedDuringInertia: true,
        fullyDuringInertia: false,
      };
    }
    const inertiaEnd = activeInertiaBuff.end ?? Number.POSITIVE_INFINITY;
    return {
      startedDuringInertia: true,
      fullyDuringInertia: inertiaEnd >= channelEnd,
    };
  }

  private onCast(event: CastEvent) {
    const inertiaWindow = this.getInertiaWindow(event);

    this.recordCooldown({
      event,
      triggeredFuriousGaze: getFuriousGazeBuffApplication(event) !== undefined,
      startedDuringInertia: inertiaWindow.startedDuringInertia,
      fullyDuringInertia: inertiaWindow.fullyDuringInertia,
    });
  }
}
