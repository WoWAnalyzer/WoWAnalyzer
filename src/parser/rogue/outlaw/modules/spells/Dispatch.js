import React from 'react';

import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

import DamageTracker from 'parser/shared/modules/AbilityTracker';

import { t } from '@lingui/macro';

import BetweenTheEyesDamageTracker from './BetweenTheEyesDamageTracker';

class Dispatch extends Analyzer {
  get thresholds() {
    const total = this.damageTracker.getAbility(SPELLS.DISPATCH.id);
    const filtered = this.betweenTheEyesDamageTracker.getAbility(SPELLS.DISPATCH.id);

    return {
      actual: filtered.casts / total.casts,
      isGreaterThan: {
        minor: 0,
        average: 0.1,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  get delayedCastSuggestion() {
    return <>Whenever you have the <SpellLink id={SPELLS.RUTHLESS_PRECISION.id} /> buff, you should prioritize <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> as your damaging spender.</>;
  }

  static dependencies = {
    damageTracker: DamageTracker,
    betweenTheEyesDamageTracker: BetweenTheEyesDamageTracker,
  };

  constructor(...args) {
    super(...args);
    this.betweenTheEyesDamageTracker.subscribeInefficientCast([SPELLS.DISPATCH], (s) => `Between The Eyes should be prioritized as your spender during Ruthless Precision`);
  }

  suggestions(when) {
    when(this.thresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You casted <SpellLink id={SPELLS.DISPATCH.id} /> while <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> was available. {this.delayedCastSuggestion}</>)
      .icon(SPELLS.DISPATCH.icon)
      .actual(t({
      id: "rogue.outlaw.dispatch.efficiency",
      message: `${formatPercentage(actual)}% inefficient casts`
    }))
      .recommended(`${formatPercentage(recommended)}% is recommended`));
  }
}

export default Dispatch;
