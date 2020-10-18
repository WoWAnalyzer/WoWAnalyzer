import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
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
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ANGELIC_FEATHER_TALENT), this.onCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ANGELIC_FEATHER_TALENT), this.onApplyBuff);
  }

  onCast(event: CastEvent) {
    this.angelicFeatherCasts += 1;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.angelicFeatherEffects += 1;
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
