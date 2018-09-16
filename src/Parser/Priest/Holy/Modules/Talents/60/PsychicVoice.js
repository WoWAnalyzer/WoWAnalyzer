import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';

class PsychicVoice extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PSYCHIC_VOICE_TALENT.id);
  }

  statistic() {
    return (

      <StatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.PSYCHIC_VOICE_TALENT.id} />}
        value={"Value"}
        label="Psychic Voice"
        tooltip={``}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default PsychicVoice;
