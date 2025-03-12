import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import PrimalElementalist, { PrimalElementalCast } from './PrimalElementalist';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import {
  evaluateQualitativePerformanceByThreshold,
  getLowestPerf,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import { plural } from '@lingui/macro';
import NPCS from 'common/NPCS/shaman';

const CALL_LIGHTNING_BUFF_DURATION = 20000;

interface StormElemental extends PrimalElementalCast {
  lastCallLightning: number;
  castsWithoutCallLightning: number;
}

class PrimalStormElemental extends PrimalElementalist<StormElemental> {
  constructor(options: Options) {
    super(NPCS.PRIMAL_STORM_ELEMENTAL.id, [SPELLS.EYE_OF_THE_STORM], options);
  }

  beginCooldownTrigger(event: CastEvent, spells: Map<number, number>): StormElemental {
    return {
      event: event,
      spells: spells,
      damageDone: 0,
      end: event.timestamp + this.duration,
      lastCallLightning: 0,
      castsWithoutCallLightning: 0,
    };
  }

  onElementalCast(event: CastEvent) {
    if (!this.isPetEvent(event)) {
      return;
    }
    super.onElementalCast(event);

    switch (event.ability.guid) {
      case SPELLS.CALL_LIGHTNING.id:
        this.currentElemental!.lastCallLightning = event.timestamp;
        break;
      default:
        if (
          event.timestamp >
          this.currentElemental!.lastCallLightning + CALL_LIGHTNING_BUFF_DURATION
        ) {
          this.currentElemental!.castsWithoutCallLightning += 1;
        }
        break;
    }
  }

  explainEyeOfTheStorm(cast: StormElemental): ChecklistUsageInfo {
    return {
      check: `used-${SPELLS.EYE_OF_THE_STORM.id}`,
      timestamp: cast.event.timestamp,
      performance: cast.spells.has(SPELLS.EYE_OF_THE_STORM.id)
        ? QualitativePerformance.Perfect
        : QualitativePerformance.Fail,
      summary: (
        <div>
          <>
            <SpellLink spell={SPELLS.EYE_OF_THE_STORM} /> used
          </>
        </div>
      ),
      details: (
        <div>
          <>
            <SpellLink spell={SPELLS.EYE_OF_THE_STORM.id} /> used
          </>
        </div>
      ),
    };
  }

  explainCallLightning(cast: StormElemental): ChecklistUsageInfo {
    const count = [...cast.spells.values()].reduce((total, value) => (total += value), 0);
    const percentage = 1 - cast.castsWithoutCallLightning / count;

    return {
      check: 'call-lightning',
      timestamp: cast.event.timestamp,
      performance: evaluateQualitativePerformanceByThreshold({
        actual: cast.castsWithoutCallLightning,
        isLessThanOrEqual: {
          perfect: 1,
          good: 2,
          ok: 3,
        },
      }),
      summary:
        cast.castsWithoutCallLightning <= 1 ? (
          <div>
            <SpellLink spell={SPELLS.CALL_LIGHTNING} /> active for maximum possible casts
          </div>
        ) : (
          <div>
            <SpellLink spell={SPELLS.CALL_LIGHTNING} /> missing for some casts
          </div>
        ),
      details:
        cast.castsWithoutCallLightning <= 1 ? (
          <div>
            All possible casts buffed by <SpellLink spell={SPELLS.CALL_LIGHTNING} />
          </div>
        ) : (
          <div>
            <strong>{cast.castsWithoutCallLightning}</strong>{' '}
            {plural(cast.castsWithoutCallLightning, { one: 'spell', other: 'spells' })} cast without{' '}
            <SpellLink spell={SPELLS.CALL_LIGHTNING} />{' '}
            <small>(&lt;5% recommended, actual {formatPercentage(1 - percentage)}%)</small>
          </div>
        ),
    };
  }

  explainPerformance(cast: StormElemental): SpellUse {
    const checklist: ChecklistUsageInfo[] = [
      this.explainEyeOfTheStorm(cast),
      this.explainCallLightning(cast),
    ];

    return {
      checklistItems: checklist,
      event: cast.event,
      performance: getLowestPerf(checklist.map((usage) => usage.performance)),
      extraDetails: null,
      performanceExplanation: null,
    };
  }
}

export default PrimalStormElemental;
