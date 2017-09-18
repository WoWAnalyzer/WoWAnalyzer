import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parer/Code/Modules/Combatants';

import SPELLS from 'common/SPELLS';

class HolyPowerTracker extends Module {
  static dependencies ={
    combatants: Combatants,
  };

  holyPowerSpent = 0;
  holyPowerWasted = 0;
}
