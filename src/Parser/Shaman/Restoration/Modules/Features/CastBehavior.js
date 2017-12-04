import React from 'react';

import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';

import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class TidalWaves extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  statistic() {
    const healingWave = this.abilityTracker.getAbility(SPELLS.HEALING_WAVE.id);
    const healingSurge = this.abilityTracker.getAbility(SPELLS.HEALING_SURGE_RESTORATION.id);
    const twHealingWaves = healingWave.healingTwHits || 0;
    const twHealingSurges = healingSurge.healingTwHits || 0;

    return (
          <StatisticBox
            icon={<SpellIcon id={SPELLS.TIDAL_WAVES_BUFF.id} />}
            value={`${twHealingWaves} : ${twHealingSurges}`}
            label={(
              <dfn data-tip={`The Tidal Waves Healing Wave to Healing Surge usage ratio is how many Healing Waves you cast compared to Healing Surges during the Tidal Waves proc. You cast ${twHealingWaves} Healing Waves and ${twHealingSurges} Healing Surges during Tidal Waves.`}>
                TW HW : TW HS cast ratio
              </dfn>
            )}
          />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(70);
}

export default TidalWaves;

