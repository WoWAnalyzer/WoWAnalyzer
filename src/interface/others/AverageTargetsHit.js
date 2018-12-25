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
    const averageHits = ((hits / casts) || 0).toFixed(1);
    if (!unique) {
      return (
        <>
          {approximate && '≈'}{averageHits}{' average '}{averageHits > 1 ? ' hits/cast' : 'target/cast'}
        </>
      );
    } else {
      return (
        <>
          {approximate && '≈'}{averageHits}{' unique '}{averageHits > 1 ? 'targets/cast' : 'target/cast'}
        </>
      );
    }
  }
}

export default AverageTargetsHit;

AverageTargetsHit.defaultProps = {
  approximate: false,
};

