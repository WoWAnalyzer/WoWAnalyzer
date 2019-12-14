import React from 'react';
import PropTypes from 'prop-types';

const Race = (
  {
    race,
  },
) => {
  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <h2>
            Race
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
};

Race.propTypes = {
  race: PropTypes.any.isRequired,
};

export default Race;
