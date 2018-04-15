import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class TidalWaves extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  suggestions(when) {
    const suggestedThresholds = this.suggestionThresholds;
    when(suggestedThresholds.actual).isGreaterThan(suggestedThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span><SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> buffed <SpellLink id={SPELLS.HEALING_WAVE.id} /> can make for some very efficient healing, consider casting more of them ({formatPercentage(suggestedThresholds.actual)}% unused Tidal Waves).</span>)
          .icon(SPELLS.TIDAL_WAVES_BUFF.icon)
          .actual(`${formatPercentage(suggestedThresholds.actual)}% unused Tidal waves`)
          .recommended(`Less than ${formatPercentage(suggestedThresholds.isGreaterThan.minor, 0)}% unused Tidal Waves`)
          .regular(suggestedThresholds.isGreaterThan.average).major(suggestedThresholds.isGreaterThan.major);
      });
  }

  get suggestionThresholds() {
    const riptide = this.abilityTracker.getAbility(SPELLS.RIPTIDE.id);
    const healingWave = this.abilityTracker.getAbility(SPELLS.HEALING_WAVE.id);
    const healingSurge = this.abilityTracker.getAbility(SPELLS.HEALING_SURGE_RESTORATION.id);
    const chainHeal = this.abilityTracker.getAbility(SPELLS.CHAIN_HEAL.id);

    const chainHealCasts = chainHeal.casts || 0;
    const riptideCasts = riptide.casts || 0;
    const totalTwGenerated = riptideCasts + chainHealCasts;
    const twHealingWaves = healingWave.healingTwHits || 0;
    const twHealingSurges = healingSurge.healingTwHits || 0;

    const totalTwUsed = twHealingWaves + twHealingSurges;

    const unusedTwRate = 1 - totalTwUsed / totalTwGenerated;

    return {
      actual: unusedTwRate,
      isGreaterThan: {
        minor: 0.1,
        average: 0.35,
        major: 0.6,
      },
      style: 'percentage',
    };
  }
}

export default TidalWaves;

