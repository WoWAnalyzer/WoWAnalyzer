import React from 'react';

import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import ShadowDance from './../Features/ShadowDance';
import DarkShadow from './DarkShadow';


class DarkShadowEvis extends DarkShadow {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
    shadowDance: ShadowDance,
  };

  statistic() {    
    const danceEvis = this.shadowDance.totalEviscerateDamageInShadowDance / this.shadowDance.totalShadowDanceCast;
    return (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.EVISCERATE.id} />}
          value={`${danceEvis.toFixed(2)}`}
          label="Average Eviscerates in Shadow Dance"
          tooltip={`Your average Eviscerate casts per Shadow Dance. Your cast ${this.shadowDance.totalEviscerateDamageInShadowDance} Eviscerates in ${this.shadowDance.totalShadowDanceCast} Shadow Dances. This number includes Eviscerates cast from Death from Above. Subtlety rogue should cast as many as possible (usually 2 times) Eviscerates in a Shadow Dance to get benefit from 30% damage increasing of Dark Shadow talent.`}
          />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default DarkShadowEvis;
