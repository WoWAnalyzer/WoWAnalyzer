import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import SoulFragmentsConsume from '../Statistics/SoulFragmentsConsume';

class SoulCleaveSoulsConsumed extends Analyzer {
  static dependencies = {
    soulFragmentsConsume: SoulFragmentsConsume,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id) && !this.selectedCombatant.hasTalent(SPELLS.FEED_THE_DEMON_TALENT.id);
    console.log("Requirements met");
  }

  soulsConsumedPercent = this.soulFragmentsConsume.soulCleaveSouls() / this.soulFragmentsConsume.totalSoulsConsumed;

  get suggestionThresholdsEfficiency() {
    return {
      actual: this.soulsConsumedPercent,
      isLessThan: {
        minor: 0.05,
        average: 0.10,
        major: .15,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    console.log("test #", this.soulFragmentsConsume.soulCleaveSouls());
    when(this.suggestionThresholdsEfficiency)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You should avoid consuming souls with <SpellLink id={SPELLS.SOUL_CLEAVE.id} /> and instead try to consume them only with <SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id} /> for the increased dps. Your talent choices suggests your going for a balanced approch versus a defensive one with <SpellLink id={SPELLS.FEED_THE_DEMON_TALENT.id} />.</React.Fragment>)
          .icon(SPELLS.SOUL_CLEAVE.icon)
          .actual(`${formatPercentage(actual)}% of souls consumed.`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

}

export default SoulCleaveSoulsConsumed;
