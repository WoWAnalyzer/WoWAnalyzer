import React from 'react';
import PropTypes from 'prop-types';

function connectParser(mapper) {
  return function connectParserWrapper(WrappedComponent) {
    return class extends React.Component {
      static contextTypes = {
        parser: PropTypes.object.isRequired,
      };

      render() {
        return <WrappedComponent {...mapper(this.context.parser)} {...this.props} />;
      }
    };
  };
}

export default connectParser;
