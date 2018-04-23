import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

/**
 * Aggramar's Conviction
 *
 * Equip: Taking damage has a chance to increase your Versatility by 4354 for 14 sec.
 *
 * Aggramar's Fortitude
 * When empowered by the Pantheon, your maximum health is increased by 1619540 for 15 sec, and you are healed to full health.
 */

class AggramarsConviction extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  versProc = 0;
  pantheonProc = 0;
  heal = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.AGGRAMARS_CONVICTION.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CELESTIAL_BULWARK.id) {
      this.versProc++;
    }
    if (spellId === SPELLS.AGGRAMARS_FORTITUDE.id) {
      this.pantheonProc++;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CELESTIAL_BULWARK.id) {
      this.versProc++;
    }
    if (spellId === SPELLS.AGGRAMARS_FORTITUDE.id) {
      this.pantheonProc++;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AGGRAMARS_FORTITUDE.id) {
      return;
    }
    this.heal += (event.amount || 0) + (event.absorbed || 0);
  }

  item() {
    const versUptimePercent = this.combatants.selected.getBuffUptime(SPELLS.CELESTIAL_BULWARK.id) / this.owner.fightDuration;

    return {
      item: ITEMS.AGGRAMARS_CONVICTION,
      result: (
        <React.Fragment>
          <dfn data-tip={`Procced the vers buff <b>${this.versProc}</b> times`}>
            {formatPercentage(versUptimePercent)} % uptime on <SpellLink id={SPELLS.CELESTIAL_BULWARK.id} />
          </dfn><br />
          <dfn data-tip={`Procced the pantheon buff <b>${this.pantheonProc}</b> times`}>
            <ItemHealingDone amount={this.heal} /> from <SpellLink id={SPELLS.AGGRAMARS_FORTITUDE.id} />
          </dfn>
        </React.Fragment>
      ),
    };
  }
}

export default AggramarsConviction;
