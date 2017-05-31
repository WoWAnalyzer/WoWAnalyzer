import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

const Talent = ({ talent, spec }) => {
  if (!talent) {
    return <i>No talent selected.</i>;
  }

  if (!SPELLS[talent]) {
    return <i>Talent not recognized: {talent}</i>;
  }

  let descriptionHtml = ''
  if (typeof SPELLS[talent].description === 'string') {
    descriptionHtml = SPELLS[talent].description
  } else {
    if (SPELLS[talent].description && SPELLS[talent].description[spec]) {
      descriptionHtml = SPELLS[talent].description[spec]
    }
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
        <main dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
      </div>
    </article>
  );
};
Talent.propTypes = {
  talent: React.PropTypes.number,
  spec: React.PropTypes.number
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
          <Talent talent={combatant.lv15Talent} spec={combatant._combatantInfo.specID} />
        </li>
        <li className="item clearfix">
          <Talent talent={combatant.lv30Talent} spec={combatant._combatantInfo.specID} />
        </li>
        <li className="item clearfix">
          <Talent talent={combatant.lv45Talent} spec={combatant._combatantInfo.specID} />
        </li>
        <li className="item clearfix">
          <Talent talent={combatant.lv60Talent} spec={combatant._combatantInfo.specID} />
        </li>
        <li className="item clearfix">
          <Talent talent={combatant.lv75Talent} spec={combatant._combatantInfo.specID} />
        </li>
        <li className="item clearfix">
          <Talent talent={combatant.lv90Talent} spec={combatant._combatantInfo.specID} />
        </li>
        <li className="item clearfix">
          <Talent talent={combatant.lv100Talent} spec={combatant._combatantInfo.specID} />
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
