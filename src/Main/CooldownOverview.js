import React from 'react';

import Cooldown from './Cooldown';

const CooldownOverview = ({ fightStart, fightEnd, cooldowns }) => (
  <div style={{ marginTop: -10, marginBottom: -10 }}>
    <ul className="list">
      {cooldowns.map((cooldown) => (
        <li key={`${cooldown.ability.id}-${cooldown.start}`} className="item clearfix" style={{ padding: '1em' }}>
          <Cooldown cooldown={cooldown} fightStart={fightStart} fightEnd={fightEnd} />
        </li>
      ))}
    </ul>
  </div>
);
CooldownOverview.propTypes = {
  fightStart: React.PropTypes.number.isRequired,
  fightEnd: React.PropTypes.number.isRequired,
  cooldowns: React.PropTypes.arrayOf(React.PropTypes.shape({
    ability: React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      name: React.PropTypes.string.isRequired,
      icon: React.PropTypes.string.isRequired,
    }),
    start: React.PropTypes.number.isRequired,
    end: React.PropTypes.number,
    events: React.PropTypes.arrayOf(React.PropTypes.shape({
      type: React.PropTypes.string.isRequired,
    })).isRequired,
  })).isRequired,
};

export default CooldownOverview;
