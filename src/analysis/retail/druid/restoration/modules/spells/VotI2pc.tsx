import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import Events, { HealEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatTracker from 'parser/shared/modules/StatTracker';
import HIT_TYPES from 'game/HIT_TYPES';
import { formatNumber } from 'common/format';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

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

/**
 **Vault of the Incarnates 2pc**
 *
 * Rejuvenation, Lifebloom, Wild Growth, Efflorescence, and Tranquility chance to critically heal is increased by 8%.
 */
class VotI2pc extends Analyzer {
  static dependencies = {
    stats: StatTracker,
  };
  protected stats!: StatTracker;
  has2Piece: boolean = true;
  twoPieceHealing: number = 0;

  get critPercentage() {
    return this.stats.currentCritPercentage;
  }

  get critIncrease() {
    return TWO_PIECE_CRIT_BONUS / (TWO_PIECE_CRIT_BONUS + this.critPercentage);
  }

  get totalHealing() {
    return this.twoPieceHealing;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T29);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TWO_PIECE_SPELLS),
      this.handle2PcHeal,
    );
  }

  handle2PcHeal(event: HealEvent) {
    if (event.hitType === HIT_TYPES.CRIT) {
      this.twoPieceHealing += calculateEffectiveHealing(event, this.critIncrease) / 2;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)} // number based on talent row
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            Total healing from 2 Piece: <strong>{formatNumber(this.totalHealing)} </strong>
          </>
        }
      >
        <BoringValueText label="Vault of the Incarnates 2 Piece">
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default VotI2pc;
