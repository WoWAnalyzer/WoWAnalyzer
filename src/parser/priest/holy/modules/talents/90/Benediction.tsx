import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import ItemHealingDone from 'interface/ItemHealingDone';
import Renew from 'parser/priest/holy/modules/spells/Renew';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class Benediction extends Analyzer {
  static dependencies = {
    renew: Renew,
  };
  protected renew!: Renew;

  get renewsFromBenediction() {
    return this.renew.renewsFromBenediction;
  }

  get healingFromBenedictionRenews() {
    const healing = this.renew.healingFromRenew(this.renew.renewsFromBenediction);
    return healing;
  }

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BENEDICTION_TALENT.id);
  }

  statistic() {
    return (
      <Statistic
        talent={SPELLS.BENEDICTION_TALENT.id}
        value={<ItemHealingDone amount={this.healingFromBenedictionRenews} />}
        tooltip={`${this.renewsFromBenediction} total Renews from Benediction`}
        category={STATISTIC_CATEGORY.TALENTS}
      />
    );
  }
}

export default Benediction;
