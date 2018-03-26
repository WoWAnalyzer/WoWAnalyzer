import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Wrapper from 'common/Wrapper';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatPercentage } from 'common/format';
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

  item() {
    return {
      item: ITEMS.RIFTWORLD_CODEX,
      result: (
        <Wrapper>
          <dfn data-tip={`Procced the HoT <b>${this.hotprocs}</b> times and did ${formatPercentage(this.hotoverhealing / (this.hothealing + this.hotoverhealing))}% overhealing`}>
            <ItemHealingDone amount={this.hothealing} /> from <SpellLink id={SPELLS.WINDS_OF_KARETH.id} />
          </dfn>
          <br/>
          <dfn data-tip={`Procced the absorb buff <b>${this.absorbprocs}</b> times and did ${formatPercentage(this.absorboverhealing / (this.absorbhealing + this.absorboverhealing))}% overhealing`}>
            <ItemHealingDone amount={this.absorbhealing} /> from <SpellLink id={SPELLS.LIGHT_OF_ABSOLARN.id} />
          </dfn>
          <br/>
          <dfn data-tip={`Procced the aura buff <b>${this.immolationprocs}</b> times`}>
            <ItemDamageDone amount={this.immolationdamage} /> from <SpellLink id={SPELLS.FLAMES_OF_RUVARAAD.id} />
          </dfn>
          <br/>
          <dfn data-tip={`Procced the aura buff <b>${this.immolationprocs}</b> times and did ${formatPercentage(this.immolationoverhealing / (this.immolationhealing + this.immolationoverhealing))}% overhealing`}>
            <ItemHealingDone amount={this.immolationhealing} /> from <SpellLink id={SPELLS.FLAMES_OF_RUVARAAD.id} />
          </dfn>
        </Wrapper>
      ),
    };
  }
}

export default RiftworldCodex;
