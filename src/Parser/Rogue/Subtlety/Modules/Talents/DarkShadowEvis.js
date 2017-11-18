import React from 'react';

import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import ShadowDance from './../Features/ShadowDance';
import DarkShadow from './DarkShadow';


class DarkShadowEvis extends DarkShadow {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
    shadowDance: ShadowDance,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DARK_SHADOW_TALENT.id);
  }

  statistic() {    
    const danceEvis = this.shadowDance.totalEviscerateDamageInShadowDance / (this.shadowDance.totalShadowDanceCast * 2);
    return (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.EVISCERATE.id} />}
          value={`${formatPercentage(danceEvis)} %`}
          label={(
            <dfn data-tip={`Your Eviscerate casts in Shadow Dance / (Shadow Dance casts * 2). Your actual / max possible casts is ${danceEvis}. This number includes Eviscerates cast from Death from Above. Subtlety rogue should cast as many as possible (usually 2 times) Eviscerates in a Shadow Dance to get benefit from 30% damage increasing of Dark Shadow talent.`}>
            Actual/Possible Eviscerates in Shadow Dance
          </dfn>
          )}
          />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default DarkShadowEvis;
