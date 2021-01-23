import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options } from 'parser/core/Analyzer';

import { STATISTIC_ORDER } from 'interface/StatisticBox';
import Events, { EnergizeEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/STATISTIC_CATEGORY';
import ResourceGenerated from 'interface/ResourceGenerated';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

class Aftershock extends Analyzer {
  refund = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AFTERSHOCK_TALENT.id);

    this.addEventListener(Events.energize.spell(SPELLS.AFTERSHOCK), this.onAftershock);
  }

  onAftershock(event: EnergizeEvent) {
    this.refund += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.AFTERSHOCK_TALENT}>
          <>
            <ResourceGenerated resourceType={RESOURCE_TYPES.MAELSTROM} amount={this.refund} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Aftershock;
