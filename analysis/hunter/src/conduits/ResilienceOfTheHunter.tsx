import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import { formatNumber } from 'common/format';
import React from 'react';

import { RESILIENCE_OF_THE_HUNTER_EFFECT_BY_RANK } from '../constants';

/**
 * When Feign Death ends, you take x% reduced damage for 8 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/1FV4MbPcn9gJLp7f#fight=5&type=auras&source=23&ability=339461
 */
class ResilienceOfTheHunter extends Analyzer {

  conduitRank = 0;
  conduitDR = 0;
  totalDamageReduction = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.RESILIENCE_OF_THE_HUNTER_CONDUIT.id);
    if (!this.active) {
      return;
    }

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.RESILIENCE_OF_THE_HUNTER_CONDUIT.id);
    this.conduitDR = RESILIENCE_OF_THE_HUNTER_EFFECT_BY_RANK[this.conduitRank];

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.damageTaken);
  }

  damageTaken(event: DamageEvent) {
    if (!event.unmitigatedAmount) {
      return;
    }
    if (!this.selectedCombatant.hasBuff(SPELLS.RESILIENCE_OF_THE_HUNTER_BUFF.id)) {
      return;
    }
    this.totalDamageReduction += event.unmitigatedAmount * this.conduitDR;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spell={SPELLS.RESILIENCE_OF_THE_HUNTER_CONDUIT} rank={this.conduitRank}>
          <>
            {formatNumber(this.totalDamageReduction)} <small> damage prevented </small>
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default ResilienceOfTheHunter;
