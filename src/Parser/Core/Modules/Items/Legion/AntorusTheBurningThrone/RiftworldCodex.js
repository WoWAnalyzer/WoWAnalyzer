import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatPercentage, formatNumber } from 'common/format';
import Abilities from 'Parser/Core/Modules/Abilities';
import ItemHealingDone from 'Main/ItemHealingDone';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Riftworld Codex
 * Procs stuff
*/
class RiftworldCodex extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
  };

  hotprocs = 0;
  absorbprocs = 0;
  immolationprocs = 0;

  hothealing = 0;
  hotoverhealing = 0;

  absorbhealing = 0;
  absorboverhealing = 0;

  immolationhealing = 0;
  immolationoverhealing = 0;
  immolationdamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.RIFTWORLD_CODEX.id);
  }

  countProcs(event) {
    if (event.ability.guid === SPELLS.WINDS_OF_KARETH.id) {
      this.hotprocs += 1;
    }

    if (event.ability.guid === SPELLS.LIGHT_OF_ABSOLARN.id) {
      this.absorbprocs += 1;
    }
    
    if (event.ability.guid === SPELLS.FLAMES_OF_RUVARAAD.id) {
      this.immolationprocs += 1;
    }
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.WINDS_OF_KARETH.id || event.ability.guid === SPELLS.LIGHT_OF_ABSOLARN.id || event.ability.guid === SPELLS.FLAMES_OF_RUVARAAD.id) {
      this.countProcs(event);
    }
  }

  on_byPlayer_buffrefresh(event) {
    if (event.ability.guid === SPELLS.WINDS_OF_KARETH.id || event.ability.guid === SPELLS.LIGHT_OF_ABSOLARN.id || event.ability.guid === SPELLS.FLAMES_OF_RUVARAAD.id) {
      this.countProcs(event);
    }
  }

  on_byPlayer_absorbed(event) {
    if (event.ability.guid === SPELLS.LIGHT_OF_ABSOLARN.id) {
      this.absorbhealing += event.amount;
    }
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid === SPELLS.LIGHT_OF_ABSOLARN.id) {
      this.absorboverhealing += event.absorb || 0;
    }
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid === SPELLS.WINDS_OF_KARETH.id) {
      this.hothealing += event.amount + (event.absorbed || 0);
      this.hotoverhealing += event.overheal || 0;
    }

    if (event.ability.guid === SPELLS.FLAMES_OF_RUVARAAD_HEALING.id) {
      this.immolationhealing += event.amount + (event.absorbed || 0);
      this.immolationoverhealing += event.overheal || 0;
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.FLAMES_OF_RUVARAAD_HEALING.id) {
      this.immolationdamage += event.amount + (event.absorbed || 0);
    }
  }

  get totalhealing() {
    return this.hothealing + this.absorbhealing + this.immolationhealing;
  }

  item() {
    return {
      item: ITEMS.RIFTWORLD_CODEX,
      result: (
        <React.Fragment>
          <ItemDamageDone amount={this.immolationdamage} /><br/>
          <dfn data-tip={`
            All 3 buffs did a total of ${formatNumber(this.totalhealing)} healing
            <ul>
              <li>HoT (${this.hotprocs} procs): ${formatNumber(this.hothealing)} healing (${formatPercentage(this.hotoverhealing / (this.hothealing + this.hotoverhealing))}% overhealing)</li>
              <li>Absorb buff (${this.absorbprocs} procs): ${formatNumber(this.absorbhealing)} healing (${formatPercentage(this.absorboverhealing / (this.absorbhealing + this.absorboverhealing))}% overhealing)</li>
              <li>Immolation-aura (${this.immolationprocs} procs): ${formatNumber(this.immolationhealing)} healing (${formatPercentage(this.immolationoverhealing / (this.immolationhealing + this.immolationoverhealing))}% overhealing)</li>
            </ul>
          `}>
            <ItemHealingDone amount={this.totalhealing} />
          </dfn>
        </React.Fragment>
      ),
    };
  }
}

export default RiftworldCodex;
