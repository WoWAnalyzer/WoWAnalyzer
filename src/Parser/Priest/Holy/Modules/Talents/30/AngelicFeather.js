import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
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
      this.angelicFeatherCasts++;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ANGELIC_FEATHER_TALENT.id) {
      this.angelicFeatherEffects++;
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.ANGELIC_FEATHER_TALENT.id} />}
        value={`${this.angelicFeatherCasts} Feather(s) cast`}
        label="Angelic Feather"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default AngelicFeather;
