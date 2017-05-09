import React from 'react';

class Changelog extends React.PureComponent {
  static contextTypes = {
    config: React.PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {
      expanded: false,
    };
  }

  render() {
    const limit = this.state.expanded ? null : 5;

    return (
      <div>
        {this.context.config.changelog.split('\n').filter((_, i) => limit === null || i <= limit).map((change, i) => (
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
