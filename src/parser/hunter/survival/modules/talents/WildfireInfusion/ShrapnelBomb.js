import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Enemies from 'parser/shared/modules/Enemies';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import { formatNumber } from 'common/format';

/**
 * Lace your Wildfire Bomb with extra reagents, randomly giving it one of the following enhancements each time you throw it:
 *
 * Shrapnel Bomb:
 * Shrapnel pierces the targets, causing Mongoose Bite, Raptor Strike, Butchery and Carve to apply a bleed for 9 sec that stacks up to 3 times.
 *
 * Example log: https://www.warcraftlogs.com/reports/n8AHdKCL9k3rtRDb#fight=36&type=damage-done
 */

class ShrapnelBomb extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;
  bleedDamage = 0;
  stacks = 0;
  applications = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHRAPNEL_BOMB_WFI_DOT.id && spellId !== SPELLS.SHRAPNEL_BOMB_WFI_IMPACT.id && spellId !== SPELLS.INTERNAL_BLEEDING_SV.id) {
      return;
    }
    if (spellId === SPELLS.INTERNAL_BLEEDING_SV.id) {
      this.bleedDamage += event.amount + (event.absorbed || 0);
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.INTERNAL_BLEEDING_SV.id) {
      return;
    }
    this.stacks += 1;
    this.applications += 1;
  }

  on_byPlayer_applydebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.INTERNAL_BLEEDING_SV.id) {
      return;
    }
    this.stacks += 1;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.SHRAPNEL_BOMB_WFI.id}
        value={<ItemDamageDone amount={this.damage} />}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Average stacks</th>
              <th>Total stacks</th>
              <th>Bleed damage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{(this.stacks / this.applications).toFixed(1)}</td>
              <td>{this.stacks}</td>
              <td>{formatNumber(this.bleedDamage / (this.owner.fightDuration / 1000))} DPS</td>
            </tr>
          </tbody>
        </table>
      </TalentStatisticBox>
    );
  }
}

export default ShrapnelBomb;
