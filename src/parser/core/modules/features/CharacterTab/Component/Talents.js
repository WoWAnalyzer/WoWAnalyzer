import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

class Talents extends React.PureComponent {
  static propTypes = {
    talents: PropTypes.array.isRequired,
  };

  render() {
    const talents = this.props.talents;
    const rows = [15, 30, 45, 60, 75, 90, 100];

    return (
      <React.Fragment>
        <div className="row">
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

export default Talents;
