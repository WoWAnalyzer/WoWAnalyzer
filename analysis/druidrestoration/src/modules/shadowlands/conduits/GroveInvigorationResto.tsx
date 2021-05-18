import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import Mastery from '../../../modules/core/Mastery';

/**
 * **Grove Invigoration**
 * Soulbind Conduit - Night Fae
 *
 * Healing or dealing damage has a chance to grant you a stack of Redirected Anima.
 * Redirected Anima increases your maximum health by 1% and your Mastery by 25 for 30 sec, and stacks overlap.
 * Activating Convoke the Spirits grants you 16 stacks of Redirected Anima.
 */
class GroveInvigorationResto extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  protected mastery!: Mastery;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasSoulbindTrait(SPELLS.GROVE_INVIGORATION.id);
  }

  get totalHealing() {
    const buffAtt = this.mastery.getBuffBenefit(SPELLS.REDIRECTED_ANIMA.id);
    return buffAtt === undefined ? 0 : buffAtt.attributable;
  }

  get avgStacks() {
    return (
      this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.REDIRECTED_ANIMA.id) /
      this.owner.fightDuration
    );
  }

  get avgRatingGain() {
    const buffAtt = this.mastery.getBuffBenefit(SPELLS.REDIRECTED_ANIMA.id);
    return buffAtt === undefined ? 0 : this.avgStacks * buffAtt.buffAmount;
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(100)}
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            This is the healing attributable to the mastery proc from Grove Invigoration.
            <br />
            You averaged{' '}
            <strong>
              {this.avgStacks.toFixed(1)} stacks / {formatNumber(this.avgRatingGain)} bonus mastery
            </strong>{' '}
            over the course of the encounter.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.GROVE_INVIGORATION}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GroveInvigorationResto;
