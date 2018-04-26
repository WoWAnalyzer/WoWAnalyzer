import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

// Chaos Bolt increases the critical strike chance of Incinerate on the target by 40% for 8 sec.
class T21_2set extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  incinerateCrits = 0; // while target is affected by the T21 2p debuff

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.WARLOCK_DESTRO_T21_2P_BONUS.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.INCINERATE.id || event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.WARLOCK_DESTRO_T21_2P_DEBUFF.id, event.timestamp)) {
      return;
    }
    this.incinerateCrits += 1;
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.WARLOCK_DESTRO_T21_2P_DEBUFF.id) / this.owner.fightDuration;
  }

  item() {
    return {
      id: `spell-${SPELLS.WARLOCK_DESTRO_T21_2P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.WARLOCK_DESTRO_T21_2P_BONUS.id} />,
      title: <SpellLink id={SPELLS.WARLOCK_DESTRO_T21_2P_BONUS.id} icon={false} />,
      result:
        (<React.Fragment>
          {formatPercentage(this.uptime)} % uptime on <SpellLink id={SPELLS.WARLOCK_DESTRO_T21_2P_DEBUFF.id} /> <br />
          <dfn data-tip="Precise number of Soul Shard Fragments is impossible to determine but can be estimated from the Incinerate crits during the debuff.">
            {this.incinerateCrits} <SpellLink id={SPELLS.INCINERATE.id} /> crits during <SpellLink id={SPELLS.WARLOCK_DESTRO_T21_2P_DEBUFF.id} />
          </dfn>
        </React.Fragment>),
    };
  }
}

export default T21_2set;
