import React from 'react';

import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';
import CORE_CHANGELOG from '../CHANGELOG';

class Changelog extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      expanded: false,
      changelogType: 0,
    };
  }

  render() {
    const limit = this.state.expanded ? null : 10;

    return (
      <div className="form-group">
        <select className="form-control" value={this.state.changelogType} onChange={(e) => this.setState({ changelogType: Number(e.target.value) })}>
          <option value={0}>Core</option>
          {AVAILABLE_CONFIGS.map(config => (
            <option value={config.spec.id} key={config.spec.id}>{config.spec.specName} {config.spec.className}</option>
          ))}
        </select>

        {(this.state.changelogType ? AVAILABLE_CONFIGS.find(config => config.spec.id === this.state.changelogType).changelog : CORE_CHANGELOG)
          .split('\n')
          .filter((_, i) => limit === null || i <= limit)
          .map((change, i) => (
            <div key={`${i}`} dangerouslySetInnerHTML={{ __html: change }} />
          ))}
        {limit !== null && (
          <a onClick={() => this.setState({ expanded: true })}>More</a>
        )}
      </div>
    );
  }
}

export default Changelog;
