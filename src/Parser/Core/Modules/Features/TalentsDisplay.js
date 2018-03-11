import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Wrapper from 'common/Wrapper';
import Analyzer from 'Parser/Core/Analyzer';

import Combatants from '../Combatants';
import SpellLink from 'common/SpellLink';

/**
 * @property {Combatants} combatants
 */
class TalentsDisplay extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  // This is a special module, we're giving it a custom position. Normally we'd use "statistic" instead.
  render() {
    const talents = this.combatants.selected.talents;
    const rows = [15, 30, 45, 60, 75, 90, 100];

    return (
      <div className="panel" style={{ border: 0 }}>
        <div className="panel-heading" style={{ boxShadow: 'none', borderBottom: 0 }}>
          <h2>
            Talents
          </h2>
        </div>
        <div className="panel-body">
          <div>
            {talents.map((spellId, index) => (
              <div key={index} className="flex-main" style={{ height: '3.5em' }}>
                <div className="row" style={{ fontSize: 18 }}>
                  <div className="col-md-1" />
                  <div className="col-md-1">
                    {rows[index]}
                  </div>
                  {spellId ? (
                    <Wrapper>
                      <div className="col-md-2">
                        <SpellIcon id={spellId} style={{ width: '2em', height: '2em' }} />
                      </div>
                      <div className="col-md-8">
                        <SpellLink id={spellId}>
                          {SPELLS[spellId].name}
                        </SpellLink>
                      </div>
                    </Wrapper>
                  ) : (
                    <div className="col-md-offset-2 col-md-8">
                      <i>No talent active</i>
                    </div>
                  )}
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
