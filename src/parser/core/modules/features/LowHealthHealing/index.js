import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/core/modules/Combatants';
import Tab from 'interface/others/Tab';

import LowHealthHealingComponent from './Component';

class LowHealthHealing extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  tab() {
    return {
      title: 'Low health healing',
      url: 'low-health-healing',
      render: () => (
        <Tab>
          <LowHealthHealingComponent
            healEvents={this.owner.eventHistory.filter(event => event.type === 'heal' && (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)))}
            fightStart={this.owner.fight.start_time}
            combatants={this.combatants}
          />
        </Tab>
      ),
    };
  }
}

export default LowHealthHealing;
