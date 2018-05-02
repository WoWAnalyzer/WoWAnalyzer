import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';

import Combatants from '../Combatants';

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
      <React.Fragment>
        <div className="row" style={{ marginBottom: '2em' }}>
          <div className="col-md-12">
            <h2>
              Talents
            </h2>
          </div>
        </div>
        {talents.map((spellId, index) => (
          <div key={index} className="row" style={{ marginBottom: '0.8em', fontSize: '1.3em' }}>
            <div className="col-sm-1 col-sm-offset-1 col-xs-3">
              {rows[index]}
            </div>
            {spellId ? (
              <React.Fragment>
                <div className="col-xs-2">
                  <SpellIcon id={spellId} style={{ width: '2em', height: '2em' }} />
                </div>
                <div className="col-xs-7">
                  <SpellLink id={spellId} icon={false}>
                    {SPELLS[spellId] ? SPELLS[spellId].name : `Unknown spell: ${spellId}`}
                  </SpellLink>
                </div>
              </React.Fragment>
            ) : (
              <div className="col-xs-offset-2 col-xs-7">
                <i>No talent active</i>
              </div>
            )}
          </div>
        ))}
      </React.Fragment>
    );
  }
}

export default TalentsDisplay;
