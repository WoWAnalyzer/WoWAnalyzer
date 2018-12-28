import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS/index';
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
      <>
        <h3>
          Talents
        </h3>
        <div className="talent-info">
          {talents.map((spellId, index) => (
            <div className="talent-info-row" key={index} style={{ marginBottom: '0.8em', fontSize: '1.3em' }}>
              <div className="talent-level">
                {rows[index]}
              </div>
              {spellId ? (
                <>
                  <div className="talent-icon">
                    <SpellIcon id={spellId} style={{ width: '2em', height: '2em' }} />
                  </div>
                  <div className="talent-name">
                    <SpellLink id={spellId} icon={false}>
                      {SPELLS[spellId] ? SPELLS[spellId].name : `Unknown spell: ${spellId}`}
                    </SpellLink>
                  </div>
                </>
              ) : (
                <div className="col-xs-offset-2 col-xs-7">
                  <i>No talent active</i>
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );
  }
}

export default Talents;
