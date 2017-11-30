import React from 'react';

import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from '../Combatants';

/**
 * @property {Combatants} combatants
 */
class TalentsDisplay extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  extraPanelOrder = 1;
  extraPanel() {
    const talents = this.combatants.selected.talents;
    const rows = [15, 30, 45, 60, 75, 90, 100];

    return (
      <div className="panel">
        <div className="panel-body" style={{ padding: 0 }}>
          <div className="flex wrapable text-center" style={{ margin: '10px 0px 3px 0px' }}>
            {talents.map((spellId, index) => (
              <div className="flex-main">
                <SpellIcon
                  id={spellId}
                  style={{
                    width: '3em',
                    height: '3em',
                  }}
                /><br />
                <div style={{ fontSize: 10 }}>
                  {rows[index]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default TalentsDisplay;
