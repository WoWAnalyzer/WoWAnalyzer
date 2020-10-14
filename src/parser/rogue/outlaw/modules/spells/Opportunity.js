import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

import DamageTracker from 'parser/shared/modules/AbilityTracker';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import OpportunityDamageTracker from './OpportunityDamageTracker';

class Opportunity extends Analyzer {
  static dependencies = {
    damageTracker: DamageTracker,
    opportunityDamageTracker: OpportunityDamageTracker,
  };

  constructor(...args) {
    super(...args);

    this.opportunityDamageTracker.subscribeInefficientCast(
      [SPELLS.SINISTER_STRIKE],
      (s) => `Pistol Shot should be used as your builder during Opportunity`,
    );
  }

  get thresholds() {
    const total = this.damageTracker.getAbility(SPELLS.SINISTER_STRIKE.id);
    const filtered = this.opportunityDamageTracker.getAbility(SPELLS.SINISTER_STRIKE.id);

    return {
      actual: filtered.casts / total.casts,
      isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.1,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.thresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You casted <SpellLink id={SPELLS.SINISTER_STRIKE.id} /> while having an <SpellLink id={SPELLS.OPPORTUNITY.id} /> proc. Try to prioritize <SpellLink id={SPELLS.PISTOL_SHOT.id} /> as your combo point builder when you have <SpellLink id={SPELLS.OPPORTUNITY.id} /> active to avoid the possibility of missing additional procs.</>)
        .icon(SPELLS.OPPORTUNITY.icon)
        .actual(i18n._(t('rogue.outlaw.suggestions.opportunity.efficiency')`${formatPercentage(actual)}% inefficient casts`))
        .recommended(`${formatPercentage(recommended)}% is recommended`));
  }
}

export default Opportunity;
