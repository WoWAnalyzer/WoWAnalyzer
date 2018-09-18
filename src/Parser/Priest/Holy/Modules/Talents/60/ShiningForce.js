import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';

// Example Log: /report/NcKyHD94nrj31tG2/10-Mythic+Zek'voz+-+Kill+(9:35)/3-旧时印月
class ShiningForce extends Analyzer {
  shiningForceCasts = 0;
  shiningForceHits = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SHINING_FORCE_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHINING_FORCE_TALENT.id) {
      this.shiningForceCasts++;
    }
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHINING_FORCE_TALENT.id) {
      this.shiningForceHits++;
    }
  }

  statistic() {
    return (

      <TraitStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.SHINING_FORCE_TALENT.id} />}
        value={`${this.shiningForceHits} Knock Back(s)`}
        label="Shining Force"
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default ShiningForce;
