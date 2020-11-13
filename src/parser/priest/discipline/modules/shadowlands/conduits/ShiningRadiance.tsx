import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveDamage';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { SHINING_RADIANCE_INCREASE } from 'parser/priest/discipline/constants';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ConduitSpellText from 'interface/statistics/components/ConduitSpellText';
import ItemHealingDone from 'interface/ItemHealingDone';

class ShiningRadiance extends Analyzer {

  conduitRank: number = 0;
  bonusRadianceHealing: number = 0;

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.SHINING_RADIANCE.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_RADIANCE), this.onRadianceHeal);
  }

  onRadianceHeal(event: HealEvent) {
    this.bonusRadianceHealing += calculateEffectiveHealing(event,SHINING_RADIANCE_INCREASE[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spell={SPELLS.SHINING_RADIANCE} rank={this.conduitRank}>
          <>
            <ItemHealingDone amount={this.bonusRadianceHealing} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }


}
export default ShiningRadiance;