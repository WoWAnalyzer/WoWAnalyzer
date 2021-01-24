import React from 'react';
import PropTypes from 'prop-types';

import getConfig from 'parser/getConfig';

class ConfigLoader extends React.PureComponent {
  static propTypes = {
    children: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    specId: PropTypes.number.isRequired,
  };
  static getDerivedStateFromProps(props, state) {
    if (!state.config || props.specId !== state.config.spec.id) {
      return {
        config: getConfig(props.specId),
      };
    }
    return state;
  }
  // TODO: It probably makes more sense to put this in the Report or Results component, as that's where it becomes necessary. Defining the child context here, with no clear usage, seems misplaced
  static childContextTypes = {
    config: PropTypes.object,
  };

  state = {
    config: null,
  };
  getChildContext() {
    return {
      config: this.state.config,
    };
  }

  render() {
    const config = this.state.config;
    if (!config) {
      return null;
    }

    return this.props.children(config);
  }
}

export default ConfigLoader;
