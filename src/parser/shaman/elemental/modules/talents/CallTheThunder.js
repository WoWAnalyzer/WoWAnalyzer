import React from 'react';

import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER, STATISTIC_CATEGORY } from 'interface/others/StatisticBox';
import SpellLink from 'common/SpellLink';

class CallTheThunder extends Analyzer {
  overcapPrevented = 0;
  maelstromAtPreviousEnergize = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CALL_THE_THUNDER_TALENT.id);
  }

  on_byPlayer_energize(event) {
    if (event.resourceChangeType === RESOURCE_TYPES.MAELSTROM.id) {
      event.classResources.forEach((resource) => {
        if (resource.type === RESOURCE_TYPES.MAELSTROM.id) {
          if (resource.amount > 100) {
            this.overcapPrevented += resource.amount - this.maelstromAtPreviousEnergize;
          }
          this.maelstromAtPreviousEnergize = resource.amount;
        }
      });
    }
  }

  statistic() {
    return (
      <StatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.CALL_THE_THUNDER_TALENT.id} />}
        value={`${formatNumber(this.overcapPrevented)}`}
        label="Wasted maelstrom prevented"
        tooltip={(
          <>
            The value indicates the maelstrom that would have been wasted if the <SpellLink id={SPELLS.CALL_THE_THUNDER_TALENT.id} /> talent wasn't selected.

            A zero or otherwise low value here suggests another tier 30 talent may be a better option in this fight.
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default CallTheThunder;
