import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

import DamageTracker from 'parser/shared/modules/AbilityTracker';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import BetweenTheEyesDamageTracker from './BetweenTheEyesDamageTracker';

class BetweenTheEyes extends Analyzer {
  static dependencies = {
    damageTracker: DamageTracker,
    betweenTheEyesDamageTracker: BetweenTheEyesDamageTracker,
  };

  get thresholds() {
    const total = this.damageTracker.getAbility(SPELLS.BETWEEN_THE_EYES.id);
    const filtered = this.betweenTheEyesDamageTracker.getAbility(SPELLS.BETWEEN_THE_EYES.id);

    // the betweenTheEyesDamageTracker is tracking casts when you should be using BTE, so subtract from the total to get all the casts when you shouldn't
    const incorrectCasts = total.casts - filtered.casts;

    return {
      actual: incorrectCasts / total.casts,
      isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.1,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.thresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You casted <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> without having <SpellLink id={SPELLS.RUTHLESS_PRECISION.id} /> active. When you don't have either the <SpellLink id={SPELLS.ACE_UP_YOUR_SLEEVE.id} /> or <SpellLink id={SPELLS.DEADSHOT.id} /> traits, the only time you should use <SpellLink id={SPELLS.BETWEEN_THE_EYES.id} /> as your damaging finisher is during <SpellLink id={SPELLS.RUTHLESS_PRECISION.id} />.</>)
        .icon(SPELLS.BETWEEN_THE_EYES.icon)
        .actual(i18n._(t('rogue.outlaw.suggestions.betweentheEyes.efficiency')`${formatPercentage(actual)}% inefficient casts`))
        .recommended(`${formatPercentage(recommended)}% is recommended`));
  }
}

export default BetweenTheEyes;
