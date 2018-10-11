import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class DivinePurpose extends Analyzer {
  divinePurposeProcs = 0;

  constructor(...args) {
    super(...args);
    const hasDivinePurpose = this.selectedCombatant.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_RETRIBUTION.id);
    this.active = hasDivinePurpose;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DIVINE_PURPOSE_BUFF.id) {
      this.divinePurposeProcs++;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DIVINE_PURPOSE_BUFF.id) {
      this.divinePurposeProcs++;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DIVINE_PURPOSE_TALENT_RETRIBUTION.id} />}
        value={`${formatNumber(this.divinePurposeProcs)}`}
        label="Divine Purpose procs"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default DivinePurpose;
