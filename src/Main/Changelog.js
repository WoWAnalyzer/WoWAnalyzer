import React from 'react';
import PropTypes from 'prop-types';

import Wrapper from 'common/Wrapper';

let _stringChangelogDeprecatedWarningSent = false;

const Changelog = ({ changelog, limit }) => {
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
              <li key={`${i}`} dangerouslySetInnerHTML={{ __html: change }} />
            ))}
        </ul>
      </div>
    );
  }
  if (changelog instanceof Array) {
    return (
      <div style={{ padding: 0 }}>
        <ul className="list text">
          {changelog
            .filter((_, i) => !limit || i < limit)
            .map(({ date, changes, contributors }, i) => (
              <li key={i} className="flex">
                <div className="flex-sub" style={{ minWidth: 100, paddingRight: 15 }}>
                  {date.toLocaleDateString()}
                </div>
                <div className="flex-main">
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
                    return null;
                  })}
                </div>
              </li>
            ))}
        </ul>
      </div>
    );
  }
  return null;
};
Changelog.propTypes = {
  changelog: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
  limit: PropTypes.number,
};

export default Changelog;
