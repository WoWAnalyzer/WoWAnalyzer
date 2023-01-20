import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatTracker from 'parser/shared/modules/StatTracker';
import HIT_TYPES from 'game/HIT_TYPES';
import { formatNumber } from 'common/format';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import ItemSetLink from 'interface/ItemSetLink';
import { DRUID_T29_ID } from 'common/ITEMS/dragonflight';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';

const TWO_PIECE_CRIT_BONUS = 0.08;

const TWO_PIECE_SPELLS = [
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
  SPELLS.LIFEBLOOM_BLOOM_HEAL,
  SPELLS.LIFEBLOOM_HOT_HEAL,
  SPELLS.TRANQUILITY_HEAL,
  SPELLS.EFFLORESCENCE_HEAL,
  SPELLS.WILD_GROWTH,
];

const FOUR_PIECE_WG_BOOST_PER_STACK = 0.05;
const FOUR_PIECE_FALL_BUFFER = 100;

/**
 * **Resto Druid T29 (Vault of the Incarnates)**
 *
 * 2pc: Rejuvenation, Lifebloom, Wild Growth, Efflorescence,
 *      and Tranquility chance to critically heal is increased by 8%.
 *
 * 4pc: Efflorescence critical heals increase the healing of your next Wild Growth by 5%,
 *      stacking up to 5 times. Lifebloom critical heals reduces
 *      the cooldown of Nature's Swiftness by 2 sec.
 */
class Tier29 extends Analyzer {
  static dependencies = {
    stats: StatTracker,
    hotTracker: HotTrackerRestoDruid,
  };
  protected stats!: StatTracker;
  protected hotTracker!: HotTrackerRestoDruid;

  has4pc: boolean;

  total2pcHealing: number = 0;

  wg4pcAttributor = HotTrackerRestoDruid.getNewAttribution('T29 4pc Wild Growth');

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T29);
    this.has4pc = this.selectedCombatant.has4PieceByTier(TIERS.T29);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(TWO_PIECE_SPELLS), this.on2pcHeal);

    if (this.has4pc) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
        this.onWgApply,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
        this.onWgApply,
      );
    }
  }

  on2pcHeal(event: HealEvent) {
    if (event.hitType === HIT_TYPES.CRIT) {
      this.total2pcHealing += (event.amount / 2) * this.critIncrease;
    }
  }

  onWgApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    const criticalGrowthStacks = this.selectedCombatant.getBuffStacks(
      SPELLS.CRITICAL_GROWTH.id,
      null,
      FOUR_PIECE_FALL_BUFFER,
    );
    if (criticalGrowthStacks > 0) {
      this.hotTracker.addBoostFromApply(
        this.wg4pcAttributor,
        criticalGrowthStacks * FOUR_PIECE_WG_BOOST_PER_STACK,
        event,
      );
    }
  }

  get critIncrease() {
    return TWO_PIECE_CRIT_BONUS / (TWO_PIECE_CRIT_BONUS + this.stats.currentCritPercentage);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            Total healing from 2 Piece: <strong>{formatNumber(this.total2pcHealing)} </strong>
          </>
        }
      >
        <div className="pad boring-text">
          <label>
            <ItemSetLink id={DRUID_T29_ID}>Lost Landcaller's Vesture (VotI Tier)</ItemSetLink>
          </label>
          <div className="value">
            2pc: <ItemPercentHealingDone amount={this.total2pcHealing} />
          </div>
          {this.has4pc && (
            <div className="value">
              4pc: <ItemPercentHealingDone amount={this.wg4pcAttributor.healing} />
            </div>
          )}
        </div>
      </Statistic>
    );
  }
}

export default Tier29;
