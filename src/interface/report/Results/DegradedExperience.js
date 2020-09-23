import React from 'react';
import PropTypes from 'prop-types';

import Danger from 'interface/Alert/Danger';
import ModuleError from 'parser/core/ModuleError';

const toTitleCase = s => s.substr(0, 1).toUpperCase() + s.substr(1);

class DegradedExperience extends React.Component {
  static propTypes = {
    disabledModules: PropTypes.object.isRequired,
  };

  constructor(...args) {
    super(...args);
    this.state = {
      expanded: false,
    };
    this.toggleDetails = this.toggleDetails.bind(this);
  }

  toggleDetails() {
    this.setState({ expanded: !this.state.expanded });
  }

  get firstError() {
    const { disabledModules } = this.props;
    const existingErrorTypes = Object.values(ModuleError).filter(state => disabledModules[state] && disabledModules[state].length !== 0);
    if (existingErrorTypes.length > 0) {
      return disabledModules[existingErrorTypes[0]][0].key;
    }
    return '';
  }

  get disabledModuleCount() {
    const { disabledModules } = this.props;
    let amount = 0;
    if (disabledModules) {
      amount = Object.values(ModuleError).reduce((total, cur) => {
        if (cur === ModuleError.DEPENDENCY) { //dont count dependency errors for total
          return total;
        }
        return total + (disabledModules[cur] ? disabledModules[cur].length : 0);
      }, 0);
    }
    return amount;
  }

  get disabledDependencyCount() {
    const { disabledModules } = this.props;
    if (disabledModules[ModuleError.DEPENDENCY]) {
      return disabledModules[ModuleError.DEPENDENCY].length;
    }
    return 0;
  }

  render() {
    const { disabledModules } = this.props;
    if (this.disabledModuleCount === 0) {
      return null;
    }

    /* eslint-disable no-script-url */
    /* eslint-disable jsx-a11y/anchor-is-valid */

    return (
      <div className="container">
        <Danger style={{ marginBottom: 30 }}>
          <h2>Degraded experience</h2>
          <span style={{ color: 'white' }}>{toTitleCase(this.firstError)}</span> {this.disabledModuleCount > 1 && <>and {this.disabledModuleCount - 1} other module{this.disabledModuleCount > 2 && 's'} </>}encountered an error and had to be disabled. {this.disabledDependencyCount > 1 && <>As a consequence <span style={{ color: 'white' }}>{this.disabledDependencyCount}</span> other modules had to be disabled as they depend on these modules.</>} Results may be incomplete. Please report this issue to us on <a href="https://wowanalyzer.com/discord">Discord</a> so we can fix it!{' '}
          <a href="javascript:" onClick={this.toggleDetails}>
            {this.state.expanded ? 'Less information' : 'More information'}
          </a>

          {this.state.expanded && (
            <>
              <br /><br />{Object.values(ModuleError)
              .filter(state => disabledModules[state] && disabledModules[state].length !== 0)
              .map(state => (
                <div key={state}>
                  The following modules have been disabled due to errors during {state}:<br />
                  <div style={{ color: 'white' }}>
                    {disabledModules[state]
                      .sort((a, b) => a.key.localeCompare(b.key))
                      .map(m => (
                        <React.Fragment key={m.key}>
                          {toTitleCase(m.key)}<br />
                          {m.error && <pre>{m.error.stack ? m.error.stack : m.error.toString()}</pre>}
                        </React.Fragment>
                      ))}
                  </div>
                  <br />
                </div>
              ))}
            </>
          )}
        </Danger>
      </div>
    );
  }
}

export default DegradedExperience;
