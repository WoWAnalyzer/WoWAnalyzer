import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/macro';

const CharacterRace = (
  {
    race,
  },
) => (
    <>
      <div className="row">
        <div className="col-md-12">
          <h2>
            <Trans id="common.race">Race</Trans>
          </h2>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12 hpadding-lg-30">{/* some bonus padding so it looks to be aligned with the icon for stats */}
          {race ? race.name : 'Unknown'}
        </div>
      </div>
    </>
  );

CharacterRace.propTypes = {
  race: PropTypes.any.isRequired,
};

export default CharacterRace;
