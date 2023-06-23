import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatTracker from 'parser/shared/modules/StatTracker';
import HIT_TYPES from 'game/HIT_TYPES';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import ItemSetLink from 'interface/ItemSetLink';
import { DRUID_T29_ID } from 'common/ITEMS/dragonflight';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SpellLink from 'interface/SpellLink';
import { calculateEffectiveHealingFromCritIncrease } from 'parser/core/EventCalculateLib';

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
const FOUR_PIECE_NS_CDR = 2000;

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
    spellUsable: SpellUsable,
  };
  protected stats!: StatTracker;
  protected hotTracker!: HotTrackerRestoDruid;
  protected spellUsable!: SpellUsable;

  has4pc: boolean;

  total2pcHealing: number = 0;

  wg4pcAttributor = HotTrackerRestoDruid.getNewAttribution('T29 4pc Wild Growth');
  effectiveNaturesSwiftnessCdr = 0;
  nsCasts = 0;

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
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_HOT_HEAL),
        this.onLbHeal,
      );
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.NATURES_SWIFTNESS),
        this.onNsCast,
      );
    }
  }

  on2pcHeal(event: HealEvent) {
    if (event.hitType === HIT_TYPES.CRIT) {
      this.total2pcHealing += calculateEffectiveHealingFromCritIncrease(
        event,
        this.stats.currentCritPercentage,
        TWO_PIECE_CRIT_BONUS,
      );
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

  onLbHeal(event: HealEvent) {
    if (event.hitType === HIT_TYPES.CRIT) {
      this.effectiveNaturesSwiftnessCdr += this.spellUsable.reduceCooldown(
        SPELLS.NATURES_SWIFTNESS.id,
        FOUR_PIECE_NS_CDR,
      );
    }
  }

  onNsCast(_: CastEvent) {
    this.nsCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <p>2pc healing amount assumes expected-value extra crits added to the listed spells.</p>
            {this.has4pc && (
              <p>
                4pc healing amount counts only the boost to <SpellLink spell={SPELLS.WILD_GROWTH} />
                .<br />
                {this.nsCasts === 0 ? (
                  <>
                    The second part of your 4pc bonus had no effect because you never used{' '}
                    <SpellLink spell={SPELLS.NATURES_SWIFTNESS} />!
                  </>
                ) : (
                  <>
                    In addition, <SpellLink spell={SPELLS.NATURES_SWIFTNESS} /> cooldown was reduced
                    by an average of{' '}
                    <strong>
                      {(this.effectiveNaturesSwiftnessCdr / this.nsCasts / 1000).toFixed(1)}s per
                      cast
                    </strong>
                  </>
                )}
              </p>
            )}
          </>
        }
      >
        <div className="pad boring-text">
          <label>
            <ItemSetLink id={DRUID_T29_ID}>
              <>
                Lost Landcaller's Vesture
                <br />
                (VotI Tier)
              </>
            </ItemSetLink>
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
