import { formatPercentage } from 'common/format';
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
import { CHI_HARMONY_COLLECTION } from '../../../constants';

const TWO_PIECE_BONUS = 0.5;
//const FOUR_PIECE_SPELLS = [-1] // placeholder

export interface ChiHarmonySourceMap {
  rawAmount: number;
  effective: number;
  overheal: number;
}

class T31TierSet extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;
  fourPieceSourceMap: Map<number, ChiHarmonySourceMap> = new Map<number, ChiHarmonySourceMap>();
  fourPieceEffective: number = 0;
  fourPieceOverheal: number = 0;
  has2Piece: boolean = true;
  has4Piece: boolean = true;
  twoPieceHealing: number = 0;
  fourPieceHealing: number = 0;
  fourPieceHealingRaw: number = 0;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.T31);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.T31) && this.has2Piece;
    this.active = this.has2Piece;
    if (!this.active) {
      return;
    }

    //verify if we need to add absorb healing event listeners
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
    if (!combatant || event.ability.guid === SPELLS.CHI_HARMONY_HEAL.id) {
      return;
    }

    if (combatant.hasBuff(SPELLS.CHI_HARMONY_HEAL_BONUS.id)) {
      this.twoPieceHealing += calculateEffectiveHealing(event, TWO_PIECE_BONUS);
      this.fourPieceEffective += event.amount + (event.absorbed || 0);
      this.fourPieceOverheal += event.overheal || 0;
      this.addHealToSourceMap(event);
    }
  }
  handle4PcHeal(event: HealEvent) {
    this.fourPieceHealing += event.amount + (event.absorbed || 0);
    this.fourPieceHealingRaw += event.amount + (event.absorbed || 0) + (event.overheal || 0);
  }

  private addHealToSourceMap(event: HealEvent) {
    const current = this.fourPieceSourceMap.get(event.ability.guid);
    if (current) {
      current.effective += event.amount + (event.absorbed || 0);
      current.overheal += event.overheal || 0;
      current.rawAmount += event.amount + (event.absorbed || 0) + (event.overheal || 0);
    } else {
      this.fourPieceSourceMap.set(event.ability.guid, {
        effective: event.amount + (event.absorbed || 0),
        overheal: event.overheal || 0,
        rawAmount: event.amount + (event.absorbed || 0) + (event.overheal || 0),
      });
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            {this.has4Piece && (
              <>
                <strong>4 Set:</strong>
                <br />
                {formatPercentage(
                  (this.fourPieceEffective * CHI_HARMONY_COLLECTION) / this.fourPieceHealingRaw,
                )}
                % of healing from effective healing
                <br />
                {formatPercentage(
                  (this.fourPieceOverheal * CHI_HARMONY_COLLECTION) / this.fourPieceHealingRaw,
                )}
                % of healing from overhealing
              </>
            )}
          </>
        }
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
