import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

const Talent = ({ talent }) => {
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
        <main dangerouslySetInnerHTML={{ __html: SPELLS[talent].description }} />
      </div>
    </article>
  );
};
Talent.propTypes = {
  talent: React.PropTypes.number,
};

const Talents = ({ combatant }) => {
  if (!combatant) {
    return <div>Loading...</div>;
  }

  console.log(combatant);

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
};
Talents.propTypes = {
  combatant: React.PropTypes.shape({

  }).isRequired,
};

export default Talents;
