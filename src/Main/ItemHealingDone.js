import React from 'react';
import PropTypes from 'prop-types';

import connectParser from 'common/connectParser';

class ItemHealingDone extends React.PureComponent {
  static propTypes = {
    amount: PropTypes.number.isRequired,
    approximate: PropTypes.bool,  
    greaterThan: PropTypes.bool,
  };
  static contextTypes = {
    parser: PropTypes.object.isRequired,
  };

  render() {
    const { amount, approximate, greaterThan } = this.props;
    const { parser } = this.context;

    return (
      <React.Fragment>
        <img
          src="/img/healing.png"
          alt="Healing"
          className="icon"
        />{' '}
        {approximate && '≈'}
        {greaterThan && '>'}{parser.formatItemHealingDone(amount)}
      </React.Fragment>
    );
  }
}

const mapParserToProps = parser => ({
  // Ensure the component is re-rendered when the Parser-context changes
  eventCount: parser.eventCount,
});
export default connectParser(mapParserToProps)(ItemHealingDone);
