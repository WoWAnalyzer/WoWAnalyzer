import React from 'react';
import PropTypes from 'prop-types';

import AVAILABLE_CONFIGS from 'parser';

class ConfigLoader extends React.PureComponent {
  static propTypes = {
    children: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    specId: PropTypes.number.isRequired,
  };
  static getDerivedStateFromProps(props, state) {
    if (!state.config || props.specId !== state.config.spec.id) {
      return {
        config: ConfigLoader.getConfig(props.specId),
      };
    }
    return state;
  }
  static getConfig(specId) {
    const config = AVAILABLE_CONFIGS.find(config => config.spec.id === specId);
    //find visible builds, if any exist
    const activeBuilds = config.builds && Object.keys(config.builds).filter(b => config.builds[b].visible);
    //remove all inactive builds
    config.builds = (activeBuilds && activeBuilds.length > 0 && activeBuilds.reduce((obj, key) => {
        obj[key] = config.builds[key];
        return obj;
      }, {})) || undefined;
    return config;
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
