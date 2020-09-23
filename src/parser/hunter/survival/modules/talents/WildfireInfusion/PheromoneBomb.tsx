import React from 'react';

import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Enemies from 'parser/shared/modules/Enemies';
import ItemDamageDone from 'interface/ItemDamageDone';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';

/**
 * Lace your Wildfire Bomb with extra reagents, randomly giving it one of the following enhancements each time you throw it:
 *
 * Pheromone Bomb:
 * Kill Command has a 100% chance to reset against targets coated with Pheromones.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/ZRALzNbMpqka1fTB#fight=17&type=summary&source=329
 */

const KILL_COMMAND_FOCUS_GAIN = 15;
const MS_BUFFER = 100;

class PheromoneBomb extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  damage = 0;
  casts = 0;
  kcCastTimestamp = 0;
  focusGained = 0;
  resets = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.KILL_COMMAND_DAMAGE_SV), this.onPetDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.PHEROMONE_BOMB_WFI_DOT, SPELLS.PHEROMONE_BOMB_WFI_IMPACT]), this.onPlayerDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PHEROMONE_BOMB_WFI), this.onBombCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.KILL_COMMAND_CAST_SV), this.onKillCommandCast);
  }

  onPetDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.PHEROMONE_BOMB_WFI_DOT.id)) {
      return;
    }
    if (event.timestamp < (this.kcCastTimestamp + MS_BUFFER)) {
      this.focusGained += KILL_COMMAND_FOCUS_GAIN;
      this.resets += 1;
    }
  }

  onPlayerDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onBombCast() {
    this.casts += 1;
  }
  onKillCommandCast(event:CastEvent) {
    this.kcCastTimestamp = event.timestamp;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={(
          <>
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
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.PHEROMONE_BOMB_WFI}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PheromoneBomb;
