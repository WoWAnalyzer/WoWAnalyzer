import React from 'react';

import CHANGELOG from 'CHANGELOG';

class Changelog extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      expanded: false,
    };
  }

  render() {
    const limit = this.state.expanded ? null : 10;

    return (
      <div>
        {CHANGELOG.split('\n').filter((_, i) => limit === null || i <= limit).map((change, i) => (
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
