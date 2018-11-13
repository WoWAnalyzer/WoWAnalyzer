import React from 'react';
import PropTypes from 'prop-types';

class AverageTargetsHit extends React.PureComponent {
  static propTypes = {
    casts: PropTypes.string.isRequired,
    hits: PropTypes.string.isRequired,
    approximate: PropTypes.bool,
  };

  render() {
    const { casts, hits, approximate } = this.props;
    const averageHits = ((hits / casts) || 0).toFixed(1);
    return (
      <>
        {approximate && '≈'}{averageHits}{' average '}{averageHits > 1 ? 'targets hit' : 'target hit'}
      </>
    );
  }
}

export default AverageTargetsHit;

AverageTargetsHit.defaultProps = {
  approximate: false,
};
