import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import Mastery from '../core/Mastery';

class CenarionWard extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  protected mastery!: Mastery;

  constructor(options: Options) {
    super(options);
    const hasCenarionWard = this.selectedCombatant.hasTalent(SPELLS.CENARION_WARD_TALENT.id);
    this.active = hasCenarionWard;
  }

  statistic() {
    const directHealing = this.mastery.getDirectHealing(SPELLS.CENARION_WARD_HEAL.id);
    const masteryHealing = this.mastery.getMasteryHealing(SPELLS.CENARION_WARD_HEAL.id);
    const totalHealing = directHealing + masteryHealing;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(15)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            This is the sum of the direct healing from Cenarion Ward and the healing enabled by
            Cenarion Ward's extra mastery stack.
            <ul>
              <li>
                Direct: <strong>{this.owner.formatItemHealingDone(directHealing)}</strong>
              </li>
              <li>
                Mastery: <strong>{this.owner.formatItemHealingDone(masteryHealing)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.CENARION_WARD_TALENT}>
          <ItemPercentHealingDone amount={totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CenarionWard;
