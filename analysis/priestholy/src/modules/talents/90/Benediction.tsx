import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import Renew from '@wowanalyzer/priest-holy/src/modules/spells/Renew';

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
        <BoringSpellValueText spellId={SPELLS.BENEDICTION_TALENT.id}>
          <ItemHealingDone amount={this.healingFromBenedictionRenews} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Benediction;
