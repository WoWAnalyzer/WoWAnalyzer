import { FilteredDamageTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';

class OpportunityDamageTracker extends FilteredDamageTracker {
  constructor(options: Options) {
    super(options);

    this.subscribeInefficientCast(
      [SPELLS.SINISTER_STRIKE],
      () => `Pistol Shot should be used as your builder during Opportunity`,
    );
  }

  shouldProcessEvent(): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.OPPORTUNITY.id);
  }
}

export default OpportunityDamageTracker;
