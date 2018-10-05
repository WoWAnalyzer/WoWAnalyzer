import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import SpellIcon from 'common/SpellIcon';

// Example Log: /report/CaTNxpcDP6tRgrXG/3-Heroic+MOTHER+-+Kill+(4:12)/4-Iuxury
class DarkAscension extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DARK_ASCENSION_TALENT.id);
  }

  statistic() {
    return (

      <TalentStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.DARK_ASCENSION_TALENT.id} />}
        value={`VALUE`}
        label="Dark Ascension"
        tooltip={``}
        position={STATISTIC_ORDER.CORE(7)}
      />

    );
  }
}

export default DarkAscension;
