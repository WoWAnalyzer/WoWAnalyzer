import React from 'react';
import PropTypes from 'prop-types';

class AverageTargetsHit extends React.PureComponent {
  static propTypes = {
    casts: PropTypes.number.isRequired,
    hits: PropTypes.number.isRequired,
    unique: PropTypes.bool,
    approximate: PropTypes.bool,
  };

  render() {
    const { casts, hits, unique, approximate } = this.props;
    if (!unique) {
      const averageHits = (hits / casts).toFixed(1);
      return (
        <>
          {approximate && '≈'}{averageHits}{' average '}{averageHits > 1 ? 'targets hit' : 'target hit'}
        </>
      );
    } else {
      const averageHits = (hits / casts).toFixed(1);
      return (
        <>
          {approximate && '≈'}{averageHits}{' unique '}{averageHits > 1 ? 'targets per cast' : 'target per cast'}
        </>
      );
    }
  }
}

export default AverageTargetsHit;
