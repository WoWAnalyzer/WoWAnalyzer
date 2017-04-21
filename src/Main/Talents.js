import React from 'react';

import ABILITY_INFO from './ABILITY_INFO';

const Talent = ({ talent }) => {
  if (!talent) {
    return <i>No talent selected.</i>;
  }

  if (!ABILITY_INFO[talent]) {
    return <i>Talent not recognized: {talent}</i>;
  }

  return (
    <article>
      <figure>
        <img src={`./img/icons/${ABILITY_INFO[talent].icon}.jpg`} alt={ABILITY_INFO[talent].name} />
      </figure>
      <div>
        <header>
          <a href={`http://www.wowhead.com/spell=${talent}`} target="_blank">
            {ABILITY_INFO[talent].name}
          </a>
        </header>
        <main dangerouslySetInnerHTML={{ __html: ABILITY_INFO[talent].description }} />
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
        <li className="item clearfix text-muted" style={{ paddingTop: 10, paddingBottom: 10 }}>
          Parts of the descriptions for talents came from the <a href="http://www.wowhead.com/holy-paladin-talent-guide" target="_blank">Holy Paladin Wowhead guide</a> by Pelinal.
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
