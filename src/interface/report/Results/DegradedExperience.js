import React from 'react';
import PropTypes from 'prop-types';
import styles from 'interface/layout/Theme.scss';
import Danger from 'interface/common/Alert/Danger';

class DegradedExperience extends React.PureComponent {
  static propTypes = {
    disabledModules: PropTypes.array.isRequired,
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

  render() {
    const { disabledModules } = this.props;
    return (
      <div className="container">
        <Danger style={{ marginBottom: 30 }}>
        <h2> Degraded Experience </h2>
          One or more modules have encountered an error and have been disabled along with modules depending on them. Results may be inaccurate and / or incomplete. <br />
          Please report this issue to us on <a href="https://wowanalyzer.com/discord">Discord</a> or <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> so we can fix it! <br />
          {this.state.expanded && (
            <><br />The following modules have been disabled due to errors: <br />
              <div style={{color: "white"}}>
                {disabledModules.sort((a,b) => a.name.localeCompare(b.name)).map(m => <>{m.name}<br /></>)}<br />
              </div>
            </>
          )}
          <span style={{ color: styles.primaryColor, cursor: "pointer" }} onClick={this.toggleDetails}>{this.state.expanded ? <>Show Less</> : <>Show More</>}</span>
        </Danger>
      </div>
    );
  }
}

export default DegradedExperience;
