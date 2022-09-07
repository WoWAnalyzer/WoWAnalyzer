import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import TreeOfLife from '../../../modules/talents/TreeOfLife';

/**
 * Resto Druid Tier 28 - 4pc - Ephemeral Incarnation
 * Every 3 casts of Swiftmend grants you Incarnation: Tree of Life for 9 sec.
 */
class Tier28_4pc extends Analyzer {
  static dependencies = {
    treeOfLife: TreeOfLife,
  };

  protected treeOfLife!: TreeOfLife;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4Piece();
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(40)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            This is the healing caused by the Tree of Life procs from the{' '}
            <strong>Tier 28 4-piece set bonus</strong>. The healing amount is the sum of all
            benefits from gaining Tree of Life form, which are listed below
            <ul>
              <li>
                Overall Increased Healing:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(
                      this.treeOfLife.t28_4pc.allBoostHealing,
                    ),
                  )}
                  %
                </strong>
              </li>
              <li>
                Rejuv Increased Healing:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(
                      this.treeOfLife.t28_4pc.rejuvBoostHealing,
                    ),
                  )}
                  %
                </strong>
              </li>
              <li>
                Rejuv Mana Saved:{' '}
                <strong>
                  {formatNumber(this.treeOfLife._getManaSaved(this.treeOfLife.t28_4pc))}
                </strong>{' '}
                (assuming mana used to fill with Rejuvs:{' '}
                <strong>
                  ≈
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(
                      this.treeOfLife._getManaSavedHealing(this.treeOfLife.t28_4pc),
                    ),
                  )}
                  %
                </strong>{' '}
                healing)
              </li>
              <li>
                Increased Wild Growths:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(
                      this.treeOfLife.t28_4pc.extraWgsAttribution.healing,
                    ),
                  )}
                  %
                </strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.RESTO_DRUID_TIER_28_4P_SET_BONUS.id}>
          <ItemPercentHealingDone
            amount={this.treeOfLife._getTotalHealing(this.treeOfLife.t28_4pc)}
          />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Tier28_4pc;
