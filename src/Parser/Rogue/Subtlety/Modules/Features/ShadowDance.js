import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

class ShadowDance extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };
  
  totalShadowDanceCast = 0;
  totalDamageDoneInShadowDance = 0;
  totalEviscerateDamageInShadowDance = 0;
  inShadowDance = false;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHADOW_DANCE.id) {
      this.totalShadowDanceCast += 1;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (this.inShadowDance) {
      this.totalDamageDoneInShadowDance += event.amount;
      if (spellId === SPELLS.EVISCERATE.id) {
        this.totalEviscerateDamageInShadowDance += 1;
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHADOW_DANCE_BUFF.id) {
      this.inShadowDance = true;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHADOW_DANCE_BUFF.id) {
      this.inShadowDance = false;
    }
  }

  statistic() {
    const shadowBladesUptime = this.combatants.selected.getBuffUptime(SPELLS.SHADOW_BLADES.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHADOW_BLADES.id} />}
        value={`${formatPercentage(shadowBladesUptime)} %`}
        label={(
          <dfn data-tip={'Shadow Blades up time'}>
            Shadow Blades up time
          </dfn>
        )}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default ShadowDance;
