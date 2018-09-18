import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TalentStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';

class Apotheosis extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.APOTHEOSIS_TALENT.id);
    this.active = false;
  }

  statistic() {
    return (

      <TalentStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.APOTHEOSIS_TALENT.id} />}
        value={"Value"}
        label="Apotheosis"
        tooltip={``}
        position={STATISTIC_ORDER.CORE(7)}
      />

    );
  }
}

export default Apotheosis;
