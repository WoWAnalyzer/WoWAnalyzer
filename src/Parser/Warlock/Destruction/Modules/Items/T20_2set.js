import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

const CHAOS_BOLT_COST = 20;

class T20_2set extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  _totalCasts = 0;
  _totalDamage = 0;
  _bonusFragments = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.WARLOCK_DESTRO_T20_2P_BONUS.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.CHAOS_BOLT.id) {
      this._totalCasts += 1;
      this._totalDamage += event.amount + (event.absorbed || 0);
    } else if (event.ability.guid === SPELLS.INCINERATE.id) {
      const enemy = this.enemies.getEntity(event);

      if (!enemy || enemy.hasBuff(SPELLS.HAVOC.id, event.timestamp)) {
        // The set bonus doesn't seem to work on targets with Havoc
        return;
      }
      this._bonusFragments += 1;
    }
  }

  item() {
    // if we haven't cast any Chaos Bolts, _totalTicks would be 0 and we would get an exception
    // but with denominator 1 in this case, if this._totalDamage = 0, then dividing by 1 still gives correct result of average damage = 0
    const avgDamage = this._totalDamage / (this._totalCasts > 0 ? this._totalCasts : 1);
    const estimatedChaosBoltDamage = Math.floor(this._bonusFragments / CHAOS_BOLT_COST) * avgDamage;
    return {
      id: `spell-${SPELLS.WARLOCK_DESTRO_T20_2P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.WARLOCK_DESTRO_T20_2P_BONUS.id} />,
      title: <SpellLink id={SPELLS.WARLOCK_DESTRO_T20_2P_BONUS.id} />,
      result: (
        <dfn data-tip={`Estimated bonus damage - ${formatNumber(estimatedChaosBoltDamage)} damage - ${this.owner.formatItemDamageDone(estimatedChaosBoltDamage)} <br />This result is estimated by multiplying number of Soul Shard Fragments gained from this bonus, divided by 20 and floored down (because Chaos Bolt consumes 20 Soul Shard Fragments) by the average Chaos Bolt damage for the whole fight.`}>
          {this._bonusFragments} Soul Shard Fragments gained
        </dfn>
      ),
    };
  }
}

export default T20_2set;
