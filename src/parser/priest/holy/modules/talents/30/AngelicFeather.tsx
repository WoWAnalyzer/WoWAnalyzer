import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class AngelicFeather extends Analyzer {
  angelicFeatherCasts = 0;
  angelicFeatherEffects = 0;

  constructor(options: Options) {
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
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(2)}
      >
        <BoringSpellValueText spell={SPELLS.ANGELIC_FEATHER_TALENT}>
          {this.angelicFeatherCasts} Feather(s) cast
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AngelicFeather;
