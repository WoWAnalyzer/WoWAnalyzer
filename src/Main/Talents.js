import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

class Talent extends React.Component {
  static propTypes = {
    talent: PropTypes.number,
  };

  render() {
    const { talent } = this.props;
    if (!talent) {
      return <i>No talent selected.</i>;
    }

    if (!SPELLS[talent]) {
      return <i>Talent not recognized: {talent}</i>;
    }

    return (
      <article>
        <figure>
          <SpellIcon id={talent} />
        </figure>
        <div>
          <header>
            <SpellLink id={talent} />
          </header>
        </div>
      </article>
    );
  }
}

class Talents extends React.Component {
  static propTypes = {
    combatant: PropTypes.shape({
      lv15Talent: PropTypes.number,
      lv30Talent: PropTypes.number,
      lv45Talent: PropTypes.number,
      lv60Talent: PropTypes.number,
      lv75Talent: PropTypes.number,
      lv90Talent: PropTypes.number,
      lv100Talent: PropTypes.number,
    }).isRequired,
  };

  render() {
    const { combatant } = this.props;

    if (!combatant) {
      return <div>Loading...</div>;
    }

    return (
      <div style={{ marginTop: -10, marginBottom: -10 }}>
        <ul className="list">
          <li className="item clearfix">
            <Talent talent={combatant.lv15Talent} />
          </li>
          <li className="item clearfix">
            <Talent talent={combatant.lv30Talent} />
          </li>
          <li className="item clearfix">
            <Talent talent={combatant.lv45Talent} />
          </li>
          <li className="item clearfix">
            <Talent talent={combatant.lv60Talent} />
          </li>
          <li className="item clearfix">
            <Talent talent={combatant.lv75Talent} />
          </li>
          <li className="item clearfix">
            <Talent talent={combatant.lv90Talent} />
          </li>
          <li className="item clearfix">
            <Talent talent={combatant.lv100Talent} />
          </li>
        </ul>
      </div>
    );
  }
}

export default Talents;
