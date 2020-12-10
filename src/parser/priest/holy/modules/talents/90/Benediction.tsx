import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import ItemHealingDone from 'interface/ItemHealingDone';
import Renew from 'parser/priest/holy/modules/spells/Renew';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class Benediction extends Analyzer {
  static dependencies = {
    renew: Renew,
  };
  protected renew!: Renew;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BENEDICTION_TALENT.id);
  }

  get renewsFromBenediction() {
    return this.renew.renewsFromBenediction;
  }

  get healingFromBenedictionRenews() {
    const healing = this.renew.healingFromRenew(this.renew.renewsFromBenediction);
    return healing;
  }

  statistic() {
    return (
      <Statistic
        tooltip={`${this.renewsFromBenediction} total Renews from Benediction`}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(6)}
      >
        <BoringSpellValueText spell={SPELLS.BENEDICTION_TALENT}>
          <ItemHealingDone amount={this.healingFromBenedictionRenews} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Benediction;
