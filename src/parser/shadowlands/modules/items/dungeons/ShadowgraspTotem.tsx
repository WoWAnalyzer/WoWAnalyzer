import { formatNumber } from 'common/format';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { ItemIcon, ItemLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, HealEvent, Item } from 'parser/core/Events';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const COOLDOWN_REDUCTION_SECONDS = 15;

/**
 * Track damage, healing and cooldown reset by Shadowgrasp Totem
 *
 * ## Example log:
 *
 * - https://www.warcraftlogs.com/reports/fZGa6X23CWbm9v8B#fight=9&type=damage-done&source=1
 */
class ShadowgraspTotem extends Analyzer {
  private item: Item;

  private numberCasts = 0;
  private totalDamage = 0;
  private totalHealing = 0;
  private numberHeals = 0;

  constructor(options: Options) {
    super(options);

    this.item = this.selectedCombatant.getItem(ITEMS.SHADOWGRASP_TOTEM.id)!;
    if (this.item == null) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOWGRASP_TOTEM_SUMMON),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.SHADOWGRASP_TOTEM_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).to(SELECTED_PLAYER).spell(SPELLS.SHADOWGRASP_TOTEM_HEAL),
      this.onHeal,
    );
  }

  onCast(event: CastEvent) {
    this.numberCasts += 1;
  }

  onDamage(event: DamageEvent) {
    this.totalDamage += (event.amount || 0) + (event.absorbed || 0);
  }

  onHeal(event: HealEvent) {
    this.numberHeals += 1;
    this.totalHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  private get cooldownReductionSeconds() {
    // The heal is triggered at the same point as the cooldown reduction
    return this.numberHeals * COOLDOWN_REDUCTION_SECONDS;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <ItemLink id={this.item.id} details={this.item} /> did {formatNumber(this.totalDamage)}{' '}
            damage in the {formatNumber(this.numberCasts)} times it was used.
            <br />
            Targets died {this.numberHeals} times, which healed a total of{' '}
            {formatNumber(this.totalHealing)} and reduced the cooldown by a total of{' '}
            {this.cooldownReductionSeconds} seconds.
          </>
        }
      >
        <BoringItemValueText item={this.item}>
          <ItemDamageDone amount={this.totalDamage} />
          <div>
            <img src="/img/healing.png" alt="Healing" className="icon" />{' '}
            {formatNumber(this.totalHealing)} HP <small>{this.numberHeals} heals</small>
          </div>
          <div>
            <ItemIcon id={this.item.id} details={this.item} /> {this.cooldownReductionSeconds}{' '}
            <small>Seconds reduced</small>
          </div>
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default ShadowgraspTotem;
