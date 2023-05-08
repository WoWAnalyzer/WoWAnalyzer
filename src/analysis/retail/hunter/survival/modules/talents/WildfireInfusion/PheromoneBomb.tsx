import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared/constants';
import { SV_KILL_COMMAND_FOCUS_GAIN } from 'analysis/retail/hunter/survival/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Lace your Wildfire Bomb with extra reagents, randomly giving it one of the following enhancements each time you throw it:
 *
 * Pheromone Bomb:
 * Kill Command has a 100% chance to reset against targets coated with Pheromones.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/ZRALzNbMpqka1fTB#fight=17&type=summary&source=329
 */

class PheromoneBomb extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;
  casts = 0;
  kcCastTimestamp = 0;
  focusGained = 0;
  resets = 0;

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.WILDFIRE_INFUSION_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.KILL_COMMAND_DAMAGE_SV),
      this.onPetDamage,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.PHEROMONE_BOMB_WFI_DOT, SPELLS.PHEROMONE_BOMB_WFI_IMPACT]),
      this.onPlayerDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PHEROMONE_BOMB_WFI),
      this.onBombCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.KILL_COMMAND_CAST_SV),
      this.onKillCommandCast,
    );
  }

  onPetDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.PHEROMONE_BOMB_WFI_DOT.id)) {
      return;
    }
    if (event.timestamp < this.kcCastTimestamp + MS_BUFFER_100) {
      this.focusGained += SV_KILL_COMMAND_FOCUS_GAIN;
      this.resets += 1;
    }
  }

  onPlayerDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onBombCast() {
    this.casts += 1;
  }

  onKillCommandCast(event: CastEvent) {
    this.kcCastTimestamp = event.timestamp;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={
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
        }
      >
        <BoringSpellValueText spellId={SPELLS.PHEROMONE_BOMB_WFI.id}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PheromoneBomb;
