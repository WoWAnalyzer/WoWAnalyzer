import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Enemies from 'parser/shared/modules/Enemies';
import StatTracker from 'parser/shared/modules/StatTracker';
import ItemDamageDone from 'interface/others/ItemDamageDone';

/**
 * Lace your Wildfire Bomb with extra reagents, randomly giving it one of the following enhancements each time you throw it:
 *
 * Shrapnel Bomb:
 * Shrapnel pierces the targets, causing Mongoose Bite, Raptor Strike, Butchery and Carve to apply a bleed for 9 sec that stacks up to 3 times.
 *
 * Pheromone Bomb:
 * Kill Command has a 100% chance to reset against targets coated with Pheromones.
 *
 * Volatile Bomb:
 * Reacts violently with poison, causing an extra explosion against enemies suffering from your Serpent Sting and refreshes your Serpent Stings.
 *
 * Example log: https://www.warcraftlogs.com/reports/n8AHdKCL9k3rtRDb#fight=36&type=damage-done
 */

class ShrapnelBomb extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    statTracker: StatTracker,
  };

  damage = 0;
  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHRAPNEL_BOMB_WFI_DOT.id && spellId !== SPELLS.SHRAPNEL_BOMB_WFI_IMPACT.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHRAPNEL_BOMB_WFI.id) {
      return;
    }
    this.casts += 1;
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
              <th>Refreshes</th>
              <th>Avg</th>
              <th>Total</th>
              <th>Focus saved</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>:)</td>
              <td>:)</td>
              <td>:)</td>
              <td>:)</td>
            </tr>
          </tbody>
        </table>
      </TalentStatisticBox>
    );
  }
}

export default ShrapnelBomb;
