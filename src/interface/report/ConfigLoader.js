import React from 'react';
import PropTypes from 'prop-types';

import AVAILABLE_CONFIGS from 'parser/AVAILABLE_CONFIGS';

class ConfigLoader extends React.PureComponent {
  static propTypes = {
    children: PropTypes.func.isRequired,
    specId: PropTypes.number.isRequired,
  };
  state = {
    config: null,
  };

  // TODO: It probably makes more sense to put this in the Report or Results component, as that's where it becomes necessary. Defining the child context here, with no clear usage, seems misplaced
  static childContextTypes = {
    config: PropTypes.object,
  };
  getChildContext() {
    return {
      config: this.state.config,
    };
  }

  componentDidMount() {
    this.setState({
      config: this.getConfig(this.props.specId),
    });
  }
  componentDidUpdate(prevProps) {
    if (this.props.specId !== prevProps.specId) {
      this.setState({
        config: this.getConfig(this.props.specId),
      });
    }
  }

  getConfig(specId) {
    return AVAILABLE_CONFIGS.find(config => config.spec.id === specId);
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
