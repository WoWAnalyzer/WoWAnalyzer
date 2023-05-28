import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import * as React from 'react';

const STAT_MODIFIER = 0.02;

class Redoubt extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.REDOUBT_TALENT);
    if (!this.active) {
      return;
    }
    const localStatTracker: StatTracker = options.statTracker as StatTracker;
    localStatTracker.add(SPELLS.REDOUBT_BUFF.id, {
      stamina: this.bonusStaminaGain(localStatTracker),
      strength: this.bonusStrenghGain(localStatTracker),
    });
  }

  bonusStaminaGain(statTracker: StatTracker) {
    return statTracker.startingStaminaRating * STAT_MODIFIER;
  }

  bonusStrenghGain(statTracker: StatTracker) {
    return statTracker.startingStrengthRating * STAT_MODIFIER;
  }

  get averageStacks() {
    return (
      this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.REDOUBT_BUFF.id) /
      this.owner.fightDuration
    );
  }

  statistic(): React.ReactNode {
    const averageStamGain = this.bonusStaminaGain(this.statTracker) * this.averageStacks;
    const averageStrengthGain = this.bonusStrenghGain(this.statTracker) * this.averageStacks;
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Taking the Redoubt talent gave you on average {formatNumber(averageStamGain)} Stamina
            and {formatNumber(averageStrengthGain)} Strength.
          </>
        }
      >
        <BoringSpellValue
          spellId={TALENTS.REDOUBT_TALENT.id}
          value={formatNumber(this.averageStacks)}
          label="Average Stacks"
        />
      </Statistic>
    );
  }
}

export default Redoubt;
