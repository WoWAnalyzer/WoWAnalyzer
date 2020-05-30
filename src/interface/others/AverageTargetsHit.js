import React from 'react';
import PropTypes from 'prop-types';

const AverageTargetsHit = props => {
  const { casts, hits, unique, approximate } = props;
  const averageHits = ((hits / casts) || 0).toFixed(1);
  if (!unique) {
    return (
      <>
        {approximate && '≈'}{averageHits} <small>average {averageHits > 1 ? 'targets hit per cast' : 'target hit per cast'}</small>
      </>
    );
  } else {
    return (
      <>
        {approximate && '≈'}{averageHits} <small>unique {averageHits > 1 ? 'targets per cast' : 'target per cast'}</small>
      </>
    );
  }
};

AverageTargetsHit.propTypes = {
  casts: PropTypes.number.isRequired,
  hits: PropTypes.number.isRequired,
  unique: PropTypes.bool,
  approximate: PropTypes.bool,
};

export default AverageTargetsHit;

AverageTargetsHit.defaultProps = {
  approximate: false,
};

