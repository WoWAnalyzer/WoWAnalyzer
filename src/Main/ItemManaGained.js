import React from 'react';
import PropTypes from 'prop-types';

import ResourceIcon from 'common/ResourceIcon';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import connectParser from 'common/connectParser';

class ItemManaGained extends React.PureComponent {
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
        <ResourceIcon id={RESOURCE_TYPES.MANA.id} />{' '}
        {approximate && '≈'}{parser.formatManaRestored(amount)}
      </React.Fragment>
    );
  }
}

const mapParserToProps = parser => ({
  // Ensure the component is re-rendered when the Parser-context changes
  eventCount: parser.eventCount,
});
export default connectParser(mapParserToProps)(ItemManaGained);
