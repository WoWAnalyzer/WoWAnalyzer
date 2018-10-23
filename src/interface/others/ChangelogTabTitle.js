import React from 'react';
import PropTypes from 'prop-types';

import CORE_CHANGELOG from 'CHANGELOG';

class ChangelogTabTitle extends React.PureComponent {
  static contextTypes = {
    config: PropTypes.shape({
      changelog: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
    }).isRequired,
  };

  state = {
    newItems: 0,
    newItemsSet: false,
  }

  componentDidMount() {
    let changelog = this.context.config.changelog;
    if (changelog instanceof Array) {
      // The changelog includes entries from the spec and core, so the count should too
      changelog = [
        ...CORE_CHANGELOG,
        ...changelog,
      ];
      //this.getAndStore(changelog);
    }
  }

  getAndStore = (mergedChangelog) => {
    const clTempStorage = JSON.parse(localStorage.getItem('WowAnalyzerCLTracker'));

    if (clTempStorage === null) {
      localStorage.setItem('WowAnalyzerCLTracker', JSON.stringify(mergedChangelog.map(e => e.clIndex)));
      this.setState({newItems: mergedChangelog.length});
    }
    else {
      let currentItem = -1;
      let newItems = 0;
      mergedChangelog.forEach((element) => {
        currentItem++;
        if(!clTempStorage.includes(element.clIndex) || clTempStorage.length === 0) {
          clTempStorage.push(element.clIndex);
          newItems++;
        }
        if(currentItem === mergedChangelog.length - 1 && !this.state.newItemsSet) {
          localStorage.setItem('WowAnalyzerCLTracker', JSON.stringify(clTempStorage));
          this.setState({newItems: newItems, newItemsSet: true});
        }
      });
    }
  }

  render() {
    return (
      <>
        Changelog {this.state.newItems > 0 && <span className="badge">{this.state.newItems}</span>}
      </>
    );
  }
}

export default ChangelogTabTitle;
