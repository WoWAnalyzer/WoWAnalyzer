import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import Panel from 'interface/others/Panel';

import LowHealthHealingComponent from './Component';

class LowHealthHealing extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  tab() {
    return {
      title: 'Triage',
      url: 'triage',
      render: () => (
        <Panel>
          <LowHealthHealingComponent
            healEvents={this.owner.eventHistory.filter(event => event.type === 'heal' && (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)))}
            fightStart={this.owner.fight.start_time}
            combatants={this.combatants}
          />
        </Panel>
      ),
    };
  }
}

export default LowHealthHealing;
