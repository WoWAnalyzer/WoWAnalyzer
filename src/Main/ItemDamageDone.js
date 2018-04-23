import React from 'react';
import PropTypes from 'prop-types';

import connectParser from 'common/connectParser';

class ItemDamageDone extends React.PureComponent {
  static propTypes = {
    amount: PropTypes.number.isRequired,
    approximate: PropTypes.bool,
  };
  static contextTypes = {
    parser: PropTypes.object.isRequired,
  };

  render() {
    const { amount, approximate } = this.props;
    const { parser } = this.context;

    return (
      <React.Fragment>
        <img
          src="/img/sword.png"
          alt="Damage"
          className="icon"
        />{' '}
        {approximate && '≈'}{parser.formatItemDamageDone(amount)}
      </React.Fragment>
    );
  }
}

const mapParserToProps = parser => ({
  // Ensure the component is re-rendered when the Parser-context changes
  eventCount: parser.eventCount,
});
export default connectParser(mapParserToProps)(ItemDamageDone);
