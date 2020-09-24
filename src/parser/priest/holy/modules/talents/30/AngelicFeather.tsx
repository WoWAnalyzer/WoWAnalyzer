import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class AngelicFeather extends Analyzer {
  angelicFeatherCasts = 0;
  angelicFeatherEffects = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ANGELIC_FEATHER_TALENT.id);
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ANGELIC_FEATHER_TALENT.id) {
      this.angelicFeatherCasts += 1;
    }
  }

  on_byPlayer_applybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ANGELIC_FEATHER_TALENT.id) {
      this.angelicFeatherEffects += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        talent={SPELLS.ANGELIC_FEATHER_TALENT.id}
        value={`${this.angelicFeatherCasts} Feather(s) cast`}
        category={STATISTIC_CATEGORY.TALENTS}
      />
    );
  }
}

export default AngelicFeather;
