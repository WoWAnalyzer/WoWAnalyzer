import React from 'react';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { EnergizeEvent } from 'parser/core/Events';

class EndlessRage extends Analyzer {
  rageGen: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.ENDLESS_RAGE_TALENT.id);

    if(!this.active) {
      return;
    }

    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.ENDLESS_RAGE_ENERGISE), this.onPlayerBuff);
  }

  onPlayerBuff(event: EnergizeEvent) {
    this.rageGen += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.ENDLESS_RAGE_TALENT}>
          <>
          {this.rageGen} rage generated
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EndlessRage;
