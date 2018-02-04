import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatNumber } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';
import Wrapper from 'common/Wrapper';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Norgannon's Prowess
 *
 * Equip: Your damaging spells have a chance to increase your Intellect by 3257 for 12 sec.
 *
 * Norgannon's Command
 * When empowered by the Pantheon, you gain 6 charges of Norgannon's Command for 15 sec. Your damaging spells expend a charge to inflict an additional 161332 damage to the target, from a random school of magic.
 */
const NORGANNONS_COMMAND_SPELLS = new Set([
  SPELLS.NORGANNONS_FIREBALL.id,
  SPELLS.NORGANNONS_FROSTBOLT.id,
  SPELLS.NORGANNONS_SHADOW_BOLT.id,
  SPELLS.NORGANNONS_ARCANE_MISSLE.id,
  SPELLS.NORGANNONS_DIVINE_SMITE.id,
  SPELLS.NORGANNONS_WRATH.id,
]);

class NorgannonsProwess extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  intProc = 0;
  intBuff = 0;
  pantheonProc = 0;
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.NORGANNONS_PROWESS.id);
    if(this.active) {
      this.intBuff = calculatePrimaryStat(940, 3257, this.combatants.selected.getItem(ITEMS.NORGANNONS_PROWESS.id).itemLevel);
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.RUSH_OF_KNOWLEDGE.id) {
      this.intProc++;
    }
    if (spellId === SPELLS.NORGANNONS_COMMAND.id) {
      this.pantheonProc++;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.RUSH_OF_KNOWLEDGE.id) {
      this.intProc++;
    }
    if (spellId === SPELLS.NORGANNONS_COMMAND.id) {
      this.pantheonProc++;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!NORGANNONS_COMMAND_SPELLS.has(spellId)) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  get intUptimePercent() {
    return this.combatants.selected.getBuffUptime(SPELLS.RUSH_OF_KNOWLEDGE.id) / this.owner.fightDuration;
  }

  item() {
    const averageInt = this.intUptimePercent * this.intBuff;

    return {
      item: ITEMS.NORGANNONS_PROWESS,
      result: (
        <Wrapper>
          <dfn data-tip={`Procced the int buff <b>${this.intProc}</b> times with <b>${formatPercentage(this.intUptimePercent)}%</b> uptime`}>
            {formatNumber(averageInt)} average Intellect gained from <SpellLink id={SPELLS.RUSH_OF_KNOWLEDGE.id} icon/>
          </dfn><br />
          <dfn data-tip={`Procced the pantheon buff <b>${this.pantheonProc}</b> times`}>
            <ItemDamageDone amount={this.damage} /> from <SpellLink id={SPELLS.NORGANNONS_COMMAND.id}/>
          </dfn>
        </Wrapper>
      ),
    };
  }
}

export default NorgannonsProwess;
