import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import React from 'react';
import ItemHealingDone from 'Main/ItemHealingDone';
import CoreEonarsCompassion from 'Parser/Core/Modules/Items/Legion/AntorusTheBurningThrone/EonarsCompassion';
import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

const PANTHEON_MAX_SHIELD_PER_PROC = 4;

class EonarsCompassion extends CoreEonarsCompassion {
  static dependencies = {
    ...CoreEonarsCompassion.dependencies,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  item() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.EONARS_COMPASSION_HEAL.id);
    
    const minutes = this.owner.fightDuration / 1000 / 60;
    const basicPpm = this.trinketProc / minutes;
    const pantheonPpm = this.pantheonProc / minutes;
    const possibleShields = this.pantheonProc * PANTHEON_MAX_SHIELD_PER_PROC;
  
    return {
      item: ITEMS.EONARS_COMPASSION,
      result: (
        <dfn
          data-tip={`
            Basic Procs
            <ul>
              <li>${this.owner.formatItemHealingDone(this.trinketHealing)}</li>
              <li>${this.trinketProc} procs (${basicPpm.toFixed(1)} PPM)</li>
            </ul>
            Pantheon Procs
            <ul>
              <li>${this.owner.formatItemHealingDone(this.pantheonShieldHealing)}</li>
              <li>${this.pantheonProc} procs (${pantheonPpm.toFixed(1)} PPM)</li>
              ${this.pantheonProc ? `<li>Applied ${this.pantheonShieldCast} shields (out of ${possibleShields} possible)</li>` : ``}
            </ul>
            Feeding
            <ul>
              <li>${this.owner.formatItemHealingDone(feeding)}</li>
            </ul>
          `}
        >
          <ItemHealingDone amount={this.totalHealing + feeding} />
        </dfn>
      ),
    };
  }
}

export default EonarsCompassion;
