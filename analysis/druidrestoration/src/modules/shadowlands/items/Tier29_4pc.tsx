import Analyzer from 'parser/core/Analyzer';
import TreeOfLife from '../../../modules/talents/TreeOfLife';
import { Options } from 'parser/core/Module';
import Events from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import React from 'react';
import { formatNumber, formatPercentage } from 'common/format';

class Tier29_4pc extends Analyzer {
  static dependencies = {
    treeOfLife: TreeOfLife,
  };

  protected treeOfLife!: TreeOfLife;

  constructor(options: Options) {
    super(options);

    // FIXME so far on PTR, no bonus ID shows if player has set or not
    //       We'll instead check at fight end if any healing from it was detected.
    //       Update this later if a bonusID gets added
    this.addEventListener(Events.fightend, this.checkActive);
  }

  checkActive() {
    this.active = this.treeOfLife.t29_4pc.allBoostHealing !== 0;
  }

  // TODO improve the wording?
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(40)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            This is the healing caused by the Tree of Life procs from the Tier 29 4 pc bonus.
            The healing amount is the sum of all benefits from gaining Tree of Life form, which
            are listed below
            <ul>
              <li>
                Overall Increased Healing:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.treeOfLife.t29_4pc.allBoostHealing),
                  )}
                  %
                </strong>
              </li>
              <li>
                Rejuv Increased Healing:{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.treeOfLife.t29_4pc.rejuvBoostHealing),
                  )}
                  %
                </strong>
              </li>
              <li>
                Rejuv Mana Saved: <strong>{formatNumber(this.treeOfLife._getManaSaved(this.treeOfLife.t29_4pc))}</strong>{' '}
                (assuming mana used to fill with Rejuvs:{' '}
                <strong>
                  ≈
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(
                      this.treeOfLife._getManaSavedHealing(this.treeOfLife.t29_4pc),
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
                    this.owner.getPercentageOfTotalHealingDone(this.treeOfLife.t29_4pc.extraWgsAttribution.healing),
                  )}
                  %
                </strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.RESTO_DRUID_TIER_29_4P_SET_BONUS.id}>
          <ItemPercentHealingDone amount={this.treeOfLife._getTotalHealing(this.treeOfLife.t29_4pc)} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default Tier29_4pc;
