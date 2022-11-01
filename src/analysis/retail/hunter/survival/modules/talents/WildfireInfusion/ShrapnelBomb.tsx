import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  ApplyDebuffStackEvent,
  DamageEvent,
  EventType,
} from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Lace your Wildfire Bomb with extra reagents, randomly giving it one of the following enhancements each time you throw it:
 *
 * Shrapnel Bomb:
 * Shrapnel pierces the targets, causing Mongoose Bite, Raptor Strike, Butchery and Carve to apply a bleed for 9 sec that stacks up to 3 times.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/ZRALzNbMpqka1fTB#fight=17&type=summary&source=329
 */

class ShrapnelBomb extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;
  bleedDamage = 0;
  stacks = 0;
  applications = 0;

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.WILDFIRE_INFUSION_TALENT.id);

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.SHRAPNEL_BOMB_WFI_DOT,
          SPELLS.SHRAPNEL_BOMB_WFI_IMPACT,
          SPELLS.INTERNAL_BLEEDING_SV,
        ]),
      this.onDamage,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.INTERNAL_BLEEDING_SV),
      this.onDebuffApplication,
    );
    this.addEventListener(
      Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.INTERNAL_BLEEDING_SV),
      this.onDebuffApplication,
    );
  }

  onDamage(event: DamageEvent) {
    if (event.ability.guid === SPELLS.INTERNAL_BLEEDING_SV.id) {
      this.bleedDamage += event.amount + (event.absorbed || 0);
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  onDebuffApplication(event: ApplyDebuffEvent | ApplyDebuffStackEvent) {
    if (event.type === EventType.ApplyDebuff) {
      this.applications += 1;
    }
    this.stacks += 1;
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
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.SHRAPNEL_BOMB_WFI.id}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ShrapnelBomb;
