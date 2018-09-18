import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';
import Renew from 'Parser/Priest/Holy/Modules/Spells/Renew';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class Benediction extends Analyzer {
  static dependencies = {
    renew: Renew,
  };

  get renewsFromBenediction() {
    return this.renew.renewsFromBenediction;
  }

  get healingFromBenedictionRenews() {
    const healing = this.renew.healingFromRenew(this.renew.renewsFromBenediction);
    return healing;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BENEDICTION_TALENT.id);
  }

  statistic() {
    return (

      <TraitStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.BENEDICTION_TALENT.id} />}
        value={(
          <ItemHealingDone amount={this.healingFromBenedictionRenews} />
        )}
        label="Benediction"
        tooltip={`${this.renewsFromBenediction} total Renews from Benediction`}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default Benediction;
