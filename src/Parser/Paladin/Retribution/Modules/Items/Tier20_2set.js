import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import GetDamageBonus from 'Parser/Paladin/Shared/Modules/GetDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const RET_PALADIN_T20_2SET_MODIFIER = 0.2;

class Tier20_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damageDone = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.RET_PALADIN_T20_2SET_BONUS.id);
  }

  get percentUptime() {
    // This calculates the total possible uptime based on buff duration (eight seconds) and the cooldown of judgement based on haste
    const maxUptime = 8 * (1 + this.combatants.selected.hastePercentage) / 12;
    const actualUptime = this.combatants.selected.getBuffUptime(SPELLS.RET_PALADIN_T20_2SET_BONUS_BUFF.id) / this.owner.fightDuration;
    // This is how much uptime you had over your actual uptime based on your haste
    return actualUptime / maxUptime;
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.RET_PALADIN_T20_2SET_BONUS_BUFF.id) && (event.ability.guid === SPELLS.BLADE_OF_JUSTICE.id || event.ability.guid === SPELLS.DIVINE_HAMMER_HIT.id)) {
      this.damageDone += GetDamageBonus(event, RET_PALADIN_T20_2SET_MODIFIER);
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.RET_PALADIN_T20_2SET_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.RET_PALADIN_T20_2SET_BONUS.id} />,
      title: <SpellLink id={SPELLS.RET_PALADIN_T20_2SET_BONUS.id} />,
      result: (
        <dfn data-tip={`
          The effective damage contributed by tier 20 2 peice.<br/>
          Total Damage: ${formatNumber(this.damageDone)}<br/>
          The percent uptime is your actual uptime over the max uptime based on your haste.<br/>
          Note: This does not account for haste procs over the fight so it may be over 100%.<br/>
          Percent Uptime: ${formatPercentage(this.percentUptime)}%`}>
          <ItemDamageDone amount={this.damageDone} />
        </dfn>
      ),
    };
  }
}

export default Tier20_2set;
