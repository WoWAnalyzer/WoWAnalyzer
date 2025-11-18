import SPELLS from 'common/SPELLS/rogue';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import DamageTracker from 'parser/shared/modules/AbilityTracker';

import OpportunityDamageTracker from './OpportunityDamageTracker';
import Events, { RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import { consumedOpportunity } from '../../normalizers/CastLinkNormalizer';

class Opportunity extends Analyzer {
  procs = 0;
  consumedProcs = 0;

  get thresholds(): NumberThreshold {
    const total = this.damageTracker.getAbility(SPELLS.SINISTER_STRIKE.id);
    const filtered = this.opportunityDamageTracker.getAbility(SPELLS.SINISTER_STRIKE.id);

    return {
      actual: filtered.casts / total.casts,
      isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    damageTracker: DamageTracker,
    opportunityDamageTracker: OpportunityDamageTracker,
  };
  protected damageTracker!: DamageTracker;
  protected opportunityDamageTracker!: OpportunityDamageTracker;

  constructor(options: Options) {
    super(options);

    [Events.applybuff, Events.applybuffstack, Events.refreshbuff].forEach((event) =>
      this.addEventListener(event.by(SELECTED_PLAYER).spell(SPELLS.OPPORTUNITY), this.onApplyBuff),
    );
    [Events.removebuff, Events.removebuffstack].forEach((event) =>
      this.addEventListener(event.by(SELECTED_PLAYER).spell(SPELLS.OPPORTUNITY), this.onRemoveBuff),
    );
  }

  private onApplyBuff() {
    this.procs += 1;
  }

  private onRemoveBuff(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    if (consumedOpportunity(event)) {
      this.consumedProcs += 1;
    }
  }

  get wastedProcs() {
    return this.procs - this.consumedProcs;
  }
}

export default Opportunity;
