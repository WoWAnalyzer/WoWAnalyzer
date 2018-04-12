import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

import ReadableList from 'common/ReadableList';
import Contributor from 'Main/Contributor';

import CORE_CHANGELOG from '../CHANGELOG';

class Changelog extends React.PureComponent {
  static propTypes = {
    changelog: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
    limit: PropTypes.number,
    includeCore: PropTypes.bool,
  };
  static defaultProps = {
    includeCore: true,
  };
  constructor() {
    super();
    this.state = {
      includeCore: true,
    };
  }

  render() {
    const { changelog, limit, includeCore } = this.props;

    const mergedChangelog = includeCore && this.state.includeCore ? [ ...CORE_CHANGELOG, ...changelog ].sort((a, b) => b.date - a.date) : changelog;
    return (
      <div style={{ padding: 0 }}>
        {includeCore && (
          <div className="panel-heading text-right toggle-control text-muted" style={{ padding: '10px 15px' }}>
            <Toggle
              defaultChecked={this.state.includeCore}
              icons={false}
              onChange={event => this.setState({ includeCore: event.target.checked })}
              id="core-entries-toggle"
            />{' '}
            <label htmlFor="core-entries-toggle">
              <dfn data-tip="Turn this off to only see changes to this spec's implementation.">Shared changes</dfn>
            </label>
          </div>
        )}
        <ul className="list text">
          {mergedChangelog
            .filter((_, i) => !limit || i < limit)
            .map((entry, i) => {
              const { date, changes, contributors } = entry;
              const isFromCoreChangelog = CORE_CHANGELOG.includes(entry);
              // The index of the entry provides us with a unique never changing key, which speeds up the Shared Changes toggle
              const index = isFromCoreChangelog ? CORE_CHANGELOG.indexOf(entry) : changelog.indexOf(entry);

              return (
                <li
                  key={isFromCoreChangelog ? `core-${index}` : `spec-${index}`}
                  className={`flex wrapable ${includeCore && isFromCoreChangelog ? 'text-muted' : ''}`}
                >
                  <div className="flex-sub" style={{ minWidth: 100, paddingRight: 15 }}>
                    {date.toLocaleDateString()}
                  </div>
                  <div className="flex-main" style={{ minWidth: 200 }}>
                    {changes}
                  </div>
                  <div className="flex-sub" style={{ minWidth: 150, paddingLeft: 15, textAlign: 'right' }}>
                    <ReadableList>
                      {contributors.map(contributor => <Contributor key={contributor.nickname} {...contributor} />)}
                    </ReadableList>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    );
  }
}

export default Changelog;
