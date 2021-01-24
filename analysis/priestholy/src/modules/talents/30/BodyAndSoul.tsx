import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class BodyAndSoul extends Analyzer {
  buffCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BODY_AND_SOUL_TALENT.id);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BODY_AND_SOUL_TALENT), this.bodyAndSoulApplied);
  }

  bodyAndSoulApplied(event: ApplyBuffEvent) {
    this.buffCount += 1;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(2)}
      >
        <BoringSpellValueText spell={SPELLS.BODY_AND_SOUL_TALENT}>
          {this.buffCount} Speed Buffs
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BodyAndSoul;
