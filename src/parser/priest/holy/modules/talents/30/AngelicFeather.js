import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import React from 'react';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class AngelicFeather extends Analyzer {
  angelicFeatherCasts = 0;
  angelicFeatherEffects = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ANGELIC_FEATHER_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ANGELIC_FEATHER_TALENT.id) {
      this.angelicFeatherCasts += 1;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ANGELIC_FEATHER_TALENT.id) {
      this.angelicFeatherEffects += 1;
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.ANGELIC_FEATHER_TALENT.id}
        value={`${this.angelicFeatherCasts} Feather(s) cast`}
        position={STATISTIC_ORDER.CORE(2)}
      />
    );
  }
}

export default AngelicFeather;
