import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

import Wrapper from 'common/Wrapper';

import CORE_CHANGELOG from '../CHANGELOG';

let _stringChangelogDeprecatedWarningSent = false;

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

    if (typeof changelog === 'string') {
      if (!_stringChangelogDeprecatedWarningSent) {
        console.error('String based changelogs are deprecated. Convert the changelog to an array basis for more features, see the Holy Paladin changelog for an example.');
        _stringChangelogDeprecatedWarningSent = true;
      }
      return (
        <div style={{ padding: 0 }}>
          <ul className="list text">
            {changelog
              .trim()
              .split('\n')
              .filter((_, i) => !limit || i < limit)
              .map((change, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: change }} />
              ))}
          </ul>
        </div>
      );
    }
    if (changelog instanceof Array) {
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
              />
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
                      {date.getUTCMonth() + 1}/{date.getUTCDate()}/{date.getUTCFullYear()}
                    </div>
                    <div className="flex-main" style={{ minWidth: 200 }}>
                      {changes}
                    </div>
                    <div className="flex-sub" style={{ minWidth: 150, paddingLeft: 15, textAlign: 'right' }}>
                      {contributors.map(contributor => {
                        if (typeof contributor === 'string') {
                          return contributor;
                        }
                        if (contributor instanceof Array) {
                          return (
                            <Wrapper key={contributor[0]}>
                              <img src={contributor[1]} alt="Avatar" style={{ height: '1.6em', borderRadius: '50%' }} /> {contributor[0]}
                            </Wrapper>
                          );
                        }
                        if (typeof contributor === 'object') {
                          return (
                            <Wrapper key={contributor.nickname}>
                              {contributor.avatar && <img src={contributor.avatar} alt="Avatar" style={{ height: '1.6em', borderRadius: '50%' }} />}{' '}
                              {contributor.nickname}
                            </Wrapper>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      );
    }
    return null;
  }
}

export default Changelog;
