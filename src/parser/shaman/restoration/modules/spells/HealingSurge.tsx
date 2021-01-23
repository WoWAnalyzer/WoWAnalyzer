import React from 'react';

import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import { When } from 'parser/core/ParseResults';

import { t } from '@lingui/macro';

import RestorationAbilityTracker from '../core/RestorationAbilityTracker';

class HealingSurge extends Analyzer {
  static dependencies = {
    abilityTracker: RestorationAbilityTracker,
  };
  protected abilityTracker!: RestorationAbilityTracker;

  get suggestedThreshold() {
    const healingSurge = this.abilityTracker.getAbility(SPELLS.HEALING_SURGE.id);

    const twHealingSurges = healingSurge.healingTwHits || 0;
    const healingSurgeCasts = healingSurge.casts || 0;
    const unbuffedHealingSurges = healingSurgeCasts - twHealingSurges;
    const unbuffedHealingSurgesPerc = unbuffedHealingSurges / healingSurgeCasts;

    return {
      actual: unbuffedHealingSurgesPerc,
      isGreaterThan: {
        minor: 0.20,
        average: 0.40,
        major: 0.60,
      },
      style: 'percentage',
    };
  }

  suggestions(when: When) {
    const suggestedThreshold = this.suggestedThreshold;
    when(suggestedThreshold.actual).isGreaterThan(suggestedThreshold.isGreaterThan.minor)
      .addSuggestion((suggest) => suggest(<span>Casting <SpellLink id={SPELLS.HEALING_SURGE.id} /> without <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> is very inefficient, try not to cast more than is necessary.</span>)
        .icon(SPELLS.HEALING_SURGE.icon)
        .actual(t({
          id: "shaman.restoration.suggestions.healingSurge.unbuffed",
          message: `${formatPercentage(suggestedThreshold.actual)}% of unbuffed Healing Surges`
        }))
        .recommended(`${formatPercentage(suggestedThreshold.isGreaterThan.minor)}% of unbuffed Healing Surges`)
        .regular(suggestedThreshold.isGreaterThan.average).major(suggestedThreshold.isGreaterThan.major));
  }

}

export default HealingSurge;

