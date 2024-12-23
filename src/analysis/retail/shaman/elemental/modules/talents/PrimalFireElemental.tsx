import { plural } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import PrimalElementalist, { PrimalElementalCast } from './PrimalElementalist';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { getLowestPerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import NPCS from 'common/NPCS/shaman';

class PrimalFireElemental extends PrimalElementalist<PrimalElementalCast> {
  constructor(options: Options) {
    super(
      NPCS.PRIMAL_FIRE_ELEMENTAL.id,
      [
        SPELLS.FIRE_ELEMENTAL_METEOR,
        SPELLS.FIRE_ELEMENTAL_IMMOLATE,
        SPELLS.FIRE_ELEMENTAL_FIRE_BLAST,
      ],
      options,
    );
  }

  beginCooldownTrigger(event: CastEvent, spells: Map<number, number>): PrimalElementalCast {
    return {
      event: event,
      spells: spells,
      damageDone: 0,
      end: event.timestamp + this.duration,
    };
  }

  explainPerformance(cast: PrimalElementalCast): SpellUse {
    const checklist: ChecklistUsageInfo[] = [...cast.spells.entries()].map(([spellId, count]) => {
      return {
        check: `spell-${spellId}`,
        timestamp: cast.event.timestamp,
        performance: count > 0 ? QualitativePerformance.Perfect : QualitativePerformance.Fail,
        summary: (
          <div>
            <SpellLink spell={spellId} /> cast {plural(count, { one: 'time', other: 'times' })}
          </div>
        ),
        details: (
          <div>
            <SpellLink spell={spellId} /> cast {plural(count, { one: 'time', other: 'times' })}
          </div>
        ),
      };
    });

    return {
      checklistItems: checklist,
      event: cast.event,
      performance: getLowestPerf(checklist.map((usage) => usage.performance)),
      extraDetails: null,
      performanceExplanation: null,
    };
  }
}

export default PrimalFireElemental;
