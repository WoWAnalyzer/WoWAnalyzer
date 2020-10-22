import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { Trans } from '@lingui/macro';

const FALLBACK_ICON = 'inv_misc_questionmark';

const Talents = (
  {
    talents,
  },
) => {
  const rows = [15, 25, 30, 35, 40, 45, 50];

  return (
    <>
      <h3>
        <Trans id="common.talents">Talents</Trans>
      </h3>
      <div className="talent-info">
        {talents.map((spellId, index) => (
          <div key={index} className="talent-info-row" style={{ marginBottom: '0.8em', fontSize: '1.3em' }}>
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
              <>
                <div className="talent-icon">
                  <Icon icon={FALLBACK_ICON} style={{ width: '2em', height: '2em' }} />
                </div>
                <div className="talent-name">
                  <i>No talent active</i>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

Talents.propTypes = {
  talents: PropTypes.array.isRequired,
};

export default Talents;
