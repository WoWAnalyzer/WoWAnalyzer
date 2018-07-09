import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Tab from 'Main/Tab';

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
