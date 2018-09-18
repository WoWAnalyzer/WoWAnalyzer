import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TalentStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';

// Example Log: /report/p3WGPqTcdFLBkH9j/22-Normal+Zek'voz+-+Kill+(6:41)/71-Sulfurya
class LightOfTheNaru extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LIGHT_OF_THE_NAARU_TALENT.id);
  }

  statistic() {
    return (

      <TalentStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.LIGHT_OF_THE_NAARU_TALENT.id} />}
        value={"Value"}
        label="Light of the Naaru"
        tooltip={``}
        position={STATISTIC_ORDER.CORE(7)}
      />

    );
  }
}

export default LightOfTheNaru;
