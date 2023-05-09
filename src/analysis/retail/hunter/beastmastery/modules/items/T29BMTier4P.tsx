import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';

const BARBED_SHOT_INCREASED_DAMAGE = 0.05;
const KILL_COMMAND_INCREASED_DAMAGE = 0.2;
/**
 * Hunter Beast Mastery Class Set 4pc
 * Barbed Shot damage increased by 5% and Barbed Shot increases damage of your next Kill Command by 20%.
 */
export default class T29BMTier4P extends Analyzer {
  increasedBarbedShotDamage: number = 0;
  increasedKCDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T29);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.BARBED_SHOT_TALENT),
      this.onBarbedShotDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.KILL_COMMAND_SHARED_DAMAGE),
      this.onKillCommandDamage,
    );
  }

  onBarbedShotDamage(event: DamageEvent) {
    this.increasedBarbedShotDamage += calculateEffectiveDamage(event, BARBED_SHOT_INCREASED_DAMAGE);
  }

  onKillCommandDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.LETHAL_COMMAND.id)) {
      return;
    }
    this.increasedKCDamage += calculateEffectiveDamage(event, KILL_COMMAND_INCREASED_DAMAGE);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <ul>
              <li>
                Barbed Shot Damage: <ItemDamageDone amount={this.increasedBarbedShotDamage} />
              </li>
              <li>
                Kill Command Damage: <ItemDamageDone amount={this.increasedKCDamage} />
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.T29_4P_BONUS_BEAST_MASTERY}>
          <ItemDamageDone amount={this.increasedBarbedShotDamage + this.increasedKCDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
