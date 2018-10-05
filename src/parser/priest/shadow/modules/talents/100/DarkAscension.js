import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import SpellIcon from 'common/SpellIcon';

// Example Log: /report/CaTNxpcDP6tRgrXG/3-Heroic+MOTHER+-+Kill+(4:12)/4-Iuxury
class DarkAscension extends Analyzer {
  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DARK_ASCENSION_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DARK_ASCENSION_TALENT.id) {
      this.casts++;
    }
  }

  statistic() {
    return (

      <TalentStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.DARK_ASCENSION_TALENT.id} />}
        value={`${this.casts} Total Dark Ascension Casts`}
        label="Dark Ascension"
        tooltip={``}
        position={STATISTIC_ORDER.CORE(7)}
      />

    );
  }
}

export default DarkAscension;
