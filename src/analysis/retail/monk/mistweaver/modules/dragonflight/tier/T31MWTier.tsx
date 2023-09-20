import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

//const FOUR_PIECE_COLLECTION = 0.2;
const TWO_PIECE_BONUS = 0.5;
//const FOUR_PIECE_SPELLS = [-1] // placeholder

class T31TierSet extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;
  has2Piece: boolean = true;
  has4Piece: boolean = true;
  twoPieceHealing: number = 0;
  fourPieceHealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.T31);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.T31) && this.has2Piece;
    this.active = this.has2Piece;
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handle2pcHeal);

    if (this.has4Piece) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHI_HARMONY_HEAL),
        this.handle4PcHeal,
      );
    }
  }

  handle2pcHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (!combatant) {
      return;
    }

    if (combatant.hasBuff(SPELLS.CHI_HARMONY_HEAL_BONUS.id)) {
      this.twoPieceHealing += calculateEffectiveHealing(event, TWO_PIECE_BONUS);
    }
  }
  handle4PcHeal(event: HealEvent) {
    this.fourPieceHealing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        // tooltip={
        //   <ul>
        //     <li>
        //
        //     </li>
        //     <li>
        //
        //     </li>
        //     <li>
        //
        //     </li>
        //   </ul>
        // }
      >
        <BoringValueText label="Amirdrassil Tier Set (T31 Set Bonus)">
          <h4>2 Piece</h4>
          <ItemHealingDone amount={this.twoPieceHealing} />
          <br />
          {/* {formatPercentage(this.twoSetUptime)}%<small> uptime</small> */}
          <hr />
          {this.has4Piece && (
            <>
              <h4>4 Piece</h4>
              <ItemHealingDone amount={this.fourPieceHealing} />
            </>
          )}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default T31TierSet;
