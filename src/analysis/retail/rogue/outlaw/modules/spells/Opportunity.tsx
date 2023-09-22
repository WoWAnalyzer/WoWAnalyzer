import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import DamageTracker from 'parser/shared/modules/AbilityTracker';

import OpportunityDamageTracker from './OpportunityDamageTracker';

class Opportunity extends Analyzer {
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

  constructor(options: Options & { opportunityDamageTracker: OpportunityDamageTracker }) {
    super(options);

    options.opportunityDamageTracker.subscribeInefficientCast(
      [SPELLS.SINISTER_STRIKE],
      () => `Pistol Shot should be used as your builder during Opportunity`,
    );
  }

  suggestions(when: When) {
    when(this.thresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You casted <SpellLink spell={SPELLS.SINISTER_STRIKE} /> while having an{' '}
          <SpellLink spell={SPELLS.OPPORTUNITY} /> proc. Try to prioritize{' '}
          <SpellLink spell={SPELLS.PISTOL_SHOT} /> as your combo point builder when you have{' '}
          <SpellLink spell={SPELLS.OPPORTUNITY} /> active to avoid the possibility of missing
          additional procs.
        </>,
      )
        .icon(SPELLS.OPPORTUNITY.icon)
        .actual(
          defineMessage({
            id: 'rogue.outlaw.suggestions.opportunity.efficiency',
            message: `${formatPercentage(actual)}% inefficient casts`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default Opportunity;
