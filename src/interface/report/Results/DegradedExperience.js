import React from 'react';
import PropTypes from 'prop-types';
import styles from 'interface/layout/Theme.scss';
import Danger from 'interface/common/Alert/Danger';
import MODULE_ERROR from 'parser/core/MODULE_ERROR';

class DegradedExperience extends React.Component {
  static propTypes = {
    disabledModules: PropTypes.object.isRequired,
  };

  constructor(...args){
    super(...args);
    this.state = {
      expanded: false,
    };
    this.toggleDetails = this.toggleDetails.bind(this);
  }

  toggleDetails() {
    this.setState({expanded: !this.state.expanded});
  }

  get firstError() {
    const { disabledModules } = this.props;
    const existingErrorTypes = Object.values(MODULE_ERROR).filter(state => disabledModules[state] && disabledModules[state].length !== 0);
    if(existingErrorTypes.length > 0){
      return disabledModules[existingErrorTypes[0]][0].module.name;
    }
    return "";
  }

  get disabledModuleCount() {
    const { disabledModules } = this.props;
    let amount = 0;
    if(disabledModules){
      amount = Object.values(MODULE_ERROR).reduce((total, cur) => {
        if(cur === MODULE_ERROR.DEPENDENCY){ //dont count dependency errors for total
          return total;
        }
        return total + (disabledModules[cur] ? disabledModules[cur].length : 0);
      }, 0);
    }
    return amount;
  }

  get disabledDependencyCount() {
    const { disabledModules } = this.props;
    if(disabledModules[MODULE_ERROR.DEPENDENCY]){
      return disabledModules[MODULE_ERROR.DEPENDENCY].length;
    }
    return 0;
  }

  render() {
    const { disabledModules } = this.props;
    return this.disabledModuleCount > 0 && (
      <div className="container">
        <Danger style={{ marginBottom: 30 }}>
        <h2> Degraded Experience </h2>
          <span style={{color: "white"}}>{this.firstError} </span>
          {this.disabledModuleCount > 1 && <>and <span style={{color: "white"}}>{this.disabledModuleCount - 1}</span> other modules have encountered an error and have been disabled. </>}
          {this.disabledModuleCount === 1 && <>has encountered an error and has been disabled. </>}
          <br />
          <span style={{color: "white"}}>{this.disabledDependencyCount}</span> module{this.disabledDependencyCount === 1 ? <> has</> : <>s have</>} been disabled as they depend on these modules. <br /><br />
          Results may be incomplete. <br />
          Please report this issue to us on <a href="https://wowanalyzer.com/discord">Discord</a> or <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> so we can fix it! <br />
          {this.state.expanded && Object.values(MODULE_ERROR).filter(state => disabledModules[state] && disabledModules[state].length !== 0).map(state => {
            return (
              <div key={state}>
                <br />The following modules have been disabled due to errors during {state}: <br />
                <div style={{color: "white"}}>
                  {disabledModules[state].sort((a,b) => a.module.name.localeCompare(b.module.name)).map((m, i) => <ModuleError module={m.module.name} error={m.error} key={i} />)}
                </div>
              </div>
            );
          })}
          <br />
          <span style={{ color: styles.primaryColor, cursor: "pointer" }} onClick={this.toggleDetails}>{this.state.expanded ? <>Show Less</> : <>Show More</>}</span>
        </Danger>
      </div>
    );
  }
}

class ModuleError extends React.Component {
  static propTypes = {
    module: PropTypes.string.isRequired,
    error: PropTypes.object,
  };

  constructor(...args){
    super(...args);
    this.state = {
      expanded: false,
    };
    this.toggleError = this.toggleError.bind(this);
  }

  toggleError() {
    this.setState({expanded: !this.state.expanded});
  }

  render() {
    const {module, error} = this.props;
    return (
      <>
        {module}  {error && <span style={{ color: styles.primaryColor, cursor: "pointer" }} onClick={this.toggleError}>{this.state.expanded ? <>Hide Error</> : <>Show Error</>}</span>}<br />
        {this.state.expanded && error && <pre>{error.stack}</pre>}
      </>
    );
  }
}
export default DegradedExperience;
