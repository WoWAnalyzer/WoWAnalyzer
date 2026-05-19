import {
  CastImpact,
  CastImpactType,
} from 'analysis/retail/druid/balance/modules/spells/DoTs/DebuffTracker';
import { CastEvaluation } from 'interface/guide/components';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { CastEvent } from 'parser/core/Events';
import { TALENTS_DRUID } from 'common/TALENTS';
import Combatant from 'parser/core/Combatant';

export abstract class DotUptimeHelper {
  private static readonly MAX_DELAY_NEXT_BURST_WINDOW = 3_000;
  private static readonly MIN_DOT_DURATION_BURST_WINDOW = 10_000;

  public static buildCastEvaluation(
    castImpact: CastImpact,
    combatant: Combatant,
    mainSpellCasts: CastEvent[],
    eclipseSpellCasts: CastEvent[],
  ): CastEvaluation {
    let newDebuffCount = 0;
    let refreshCount = 0;
    let overwriteCount = 0;
    let overwriteShortestDuration: number | undefined = undefined;
    for (const impactPerTarget of Object.values(castImpact.castImpactPerTargetId)) {
      if (impactPerTarget.castImpactType === CastImpactType.NewDebuff) {
        newDebuffCount++;
      } else if (impactPerTarget.castImpactType === CastImpactType.RefreshDuringPandemicWindow) {
        refreshCount++;
      } else if (impactPerTarget.castImpactType === CastImpactType.Overwrite) {
        overwriteCount++;
        if (
          overwriteShortestDuration === undefined ||
          overwriteShortestDuration > impactPerTarget.remainingDurationBeforeCast
        ) {
          overwriteShortestDuration = impactPerTarget.remainingDurationBeforeCast;
        }
      }
    }
    return this.buildCastEvaluationFromCastImpact(
      overwriteCount,
      newDebuffCount,
      refreshCount,
      overwriteShortestDuration,
      castImpact,
      mainSpellCasts,
      eclipseSpellCasts,
      combatant,
    );
  }

  private static buildCastEvaluationFromCastImpact(
    overwriteCount: number,
    newDebuffCount: number,
    refreshCount: number,
    overwriteShortestDuration: undefined | number,
    castImpact: CastImpact,
    mainSpellCasts: CastEvent[],
    eclipseSpellCasts: CastEvent[],
    combatant: Combatant,
  ): CastEvaluation {
    let performance = QualitativePerformance.Ok;
    if (overwriteCount === 0) {
      performance = QualitativePerformance.Perfect;
    } else if (overwriteCount <= newDebuffCount + refreshCount) {
      performance = QualitativePerformance.Good;
    } else if (newDebuffCount === 0 && refreshCount === 0) {
      performance = QualitativePerformance.Fail;
    }

    // Actually beneficial to refresh DoTs before going into major burst windows even if you clip some duration
    // Arbitrary limit defined as DoTs that would not last at least 10s during an Incarn/Celestial Alignment.
    // (and Eclipse for Keeper of the Groves only).
    // In this case, rebrand a Fail cast as an Ok cast with the correct reason.
    if (performance === QualitativePerformance.Fail && overwriteShortestDuration !== undefined) {
      const castTimeStamp = castImpact.castEvent.timestamp;
      // Check Keeper of the Groves specific talent
      const isKeeper = combatant.hasTalent(TALENTS_DRUID.DREAM_SURGE_TALENT);

      // Calculate delay until the next burst window
      const nextMain = mainSpellCasts.find((c) => c.timestamp >= castTimeStamp)?.timestamp;
      const nextEclipse = eclipseSpellCasts.find((c) => c.timestamp >= castTimeStamp)?.timestamp;
      const delayBeforeNextBurst =
        Math.min(nextMain ?? Infinity, isKeeper ? (nextEclipse ?? Infinity) : Infinity) -
        castTimeStamp;
      const isJustBeforeBurst = delayBeforeNextBurst <= DotUptimeHelper.MAX_DELAY_NEXT_BURST_WINDOW; // 3s

      // The DoT would expire within the first 10s of next burst window
      const dotWouldExpireTooSoon =
        delayBeforeNextBurst + DotUptimeHelper.MIN_DOT_DURATION_BURST_WINDOW >
        overwriteShortestDuration;

      if (isJustBeforeBurst) {
        if (dotWouldExpireTooSoon) {
          return {
            timestamp: castTimeStamp,
            performance: QualitativePerformance.Ok,
            reason: `${overwriteCount} overwritten just before a burst window to guarantee 10s of uptime throughout`,
          };
        } else {
          const durationDuringBurstInSeconds = (
            (overwriteShortestDuration - delayBeforeNextBurst) /
            1_000
          ).toFixed(0);
          return {
            timestamp: castTimeStamp,
            performance: QualitativePerformance.Fail,
            reason: `${overwriteCount} overwritten just before a burst window but would have lasted ${durationDuringBurstInSeconds}s throughout`,
          };
        }
      }
    }

    return {
      timestamp: castImpact.castEvent.timestamp,
      performance: performance,
      reason: `${newDebuffCount} created, ${refreshCount} refreshed, ${overwriteCount} overwritten`,
    };
  }
}
