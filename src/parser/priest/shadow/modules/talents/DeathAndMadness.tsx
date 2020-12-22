import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { EnergizeEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/index';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { formatNumber } from 'common/format';
import Insanity from 'interface/icons/Insanity'

class DeathAndMadness extends Analyzer {

  successes: number = 0;
  insanityGained: number = 0;
  insanityWasted: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DEATH_AND_MADNESS_TALENT.id);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_MADNESS_BUFF), this.onBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_MADNESS_BUFF), this.onBuff);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_MADNESS_BUFF), this.onEnergize);
  }

  // Since the actual buff only applies/refreshes as a reward for getting a kill within 7s of using SW: Death, don't have to do much to check
  onBuff() {
    this.successes += 1;
  }

  onEnergize(event: EnergizeEvent) {
    this.insanityGained += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Number of casts where the target was killed and insanity generated from it."
      >
        <BoringSpellValueText spell={SPELLS.DEATH_AND_MADNESS_TALENT}>
          <>
          {formatNumber(this.successes)} Procs<br />
          <Insanity /> {formatNumber(this.insanityGained)} <small>Insanity generated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DeathAndMadness;
