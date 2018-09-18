import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';

// Example Log: /report/1bgY6k8ADWJLzjPN/7-Mythic+Taloc+-+Kill+(5:45)/1-Cruzco
class AngelsMercy extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ANGELS_MERCY_TALENT.id);
  }

  statistic() {
    return (

      <TraitStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.ANGELS_MERCY_TALENT.id} />}
        value={"Value"}
        label="Angels Mercy"
        tooltip={``}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default AngelsMercy;
