import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';
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

export const VERSATILITY_BASE = 4354;
export const BASE_ILVL = 940;

class AggramarsConviction extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  versatility = 0;
  versProc = 0;
  pantheonProc = 0;
  heal = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.AGGRAMARS_CONVICTION.id);
    if(!this.active) {
      return;
    }

    const item = this.combatants.selected.getItem(ITEMS.AGGRAMARS_CONVICTION.id);
    this.versatility = calculateSecondaryStatDefault(BASE_ILVL, VERSATILITY_BASE, item.itemLevel);
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
    const avgVers = this.versatility * versUptimePercent;

    return {
      item: ITEMS.AGGRAMARS_CONVICTION,
      result: (
        <React.Fragment>
          <SpellLink id={SPELLS.CELESTIAL_BULWARK.id} /><br/>
          <dfn data-tip={`From <b>${this.versProc}</b> procs (${formatPercentage(versUptimePercent)} % uptime) of ${formatNumber(this.versatility)} Versatility.`}>
            {formatNumber(avgVers)} Average Versatility
          </dfn><br />
          <SpellLink id={SPELLS.AGGRAMARS_FORTITUDE.id} /><br/>
          <dfn data-tip={`From <b>${this.pantheonProc}</b> procs.`}>
            <ItemHealingDone amount={this.heal} />
          </dfn>
        </React.Fragment>
      ),
    };
  }
}

export default AggramarsConviction;
