import React from 'react';
import PropTypes from 'prop-types';

const AverageTargetsHit = props => {
  const { casts, hits, unique, approximate } = props;
  const averageHits = (hits / casts) || 0;
  return (
    <>
      {approximate && '≈'}{averageHits.toFixed(1)} <small> {unique ? 'unique targets hit' : 'average'} {unique ? '' : averageHits === 1 ? 'hit' : 'hits'} per cast</small>
    </>
  );
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
  unique: false,
};

