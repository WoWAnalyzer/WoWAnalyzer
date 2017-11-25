import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import DarkShadow from './DarkShadow';


class DarkShadowEvis extends DarkShadow {

  statistic() {    
    const danceEvis = this.totalEviscerateHitsInShadowDance / this.totalShadowDanceCast;
    return (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.EVISCERATE.id} />}
          value={`${danceEvis.toFixed(2)}`}
          label="Average Eviscerates in Shadow Dance"
          tooltip={`Your average Eviscerate casts per Shadow Dance. Your cast ${this.totalEviscerateHitsInShadowDance} Eviscerates in ${this.totalShadowDanceCast} Shadow Dances. This number includes Eviscerates cast from Death from Above. Subtlety rogue should cast as many as possible (usually 2 times) Eviscerates in a Shadow Dance to get benefit from 30% damage increasing of Dark Shadow talent.`}
          />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default DarkShadowEvis;
