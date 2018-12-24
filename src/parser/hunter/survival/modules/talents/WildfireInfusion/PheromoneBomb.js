import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Enemies from 'parser/shared/modules/Enemies';
import ItemDamageDone from 'interface/others/ItemDamageDone';

/**
 * Lace your Wildfire Bomb with extra reagents, randomly giving it one of the following enhancements each time you throw it:
 *
 * Pheromone Bomb:
 * Kill Command has a 100% chance to reset against targets coated with Pheromones.
 *
 * Example log: https://www.warcraftlogs.com/reports/n8AHdKCL9k3rtRDb#fight=36&type=damage-done
 */

const KILL_COMMAND_FOCUS_GAIN = 15;
const MS_BUFFER = 100;

class PheromoneBomb extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;
  casts = 0;
  kcCastTimestamp = 0;
  focusGained = 0;
  resets = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.KILL_COMMAND_DAMAGE_SV.id) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.PHEROMONE_BOMB_WFI_DOT.id)) {
      return;
    }
    if (event.timestamp < (this.kcCastTimestamp + MS_BUFFER)) {
      this.focusGained += KILL_COMMAND_FOCUS_GAIN;
      this.resets += 1;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PHEROMONE_BOMB_WFI_DOT.id && spellId !== SPELLS.PHEROMONE_BOMB_WFI_IMPACT.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PHEROMONE_BOMB_WFI.id && spellId !== SPELLS.KILL_COMMAND_CAST_SV.id) {
      return;
    }
    if (spellId === SPELLS.PHEROMONE_BOMB_WFI.id) {
      this.casts += 1;
      return;
    }
    //Because the talent Bloodseeker applies a bleed dot that has the same damage tick as the regular damage event, we log the cast timestamp to check it at a later time
    if (spellId === SPELLS.KILL_COMMAND_CAST_SV.id) {
      this.kcCastTimestamp = event.timestamp;
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.PHEROMONE_BOMB_WFI.id}
        value={<ItemDamageDone amount={this.damage} />}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Average resets</th>
              <th>Total resets</th>
              <th>Focus gain</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{(this.resets / this.casts).toFixed(1)}</td>
              <td>{this.resets}</td>
              <td>{this.focusGained}</td>
            </tr>
          </tbody>
        </table>
      </TalentStatisticBox>
    );
  }
}

export default PheromoneBomb;
