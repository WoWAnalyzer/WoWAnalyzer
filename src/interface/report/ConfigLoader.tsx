import React from 'react';
import PropTypes from 'prop-types';

import getConfig from 'parser/getConfig';
import Config from 'parser/Config';

interface Props {
  specId: number;
  children: (config: Config) => React.ReactNode;
}

interface State {
  config: Config|null;
}

class ConfigLoader extends React.PureComponent<Props, State> {
  static getDerivedStateFromProps(props: Props, state: State) {
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
