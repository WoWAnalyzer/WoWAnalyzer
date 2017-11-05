import React from 'react';
import PropTypes from 'prop-types';
import Wrapper from "../common/Wrapper";

const ChangelogTab = (_, { config }) => {
  const changelog = config.changelog;
  if (typeof changelog === 'string') {
    return (
      <div style={{ padding: 0 }}>
        <ul className="list text">
          {config.changelog
            .trim()
            .split('\n')
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
            .map((entry, i) => {
              let date;
              let changes;
              let contributors;
              if (entry instanceof Array) {
                date = entry[0];
                changes = entry[1];
                contributors = entry[2] instanceof Array ? entry[2] : [entry[2]];
              } else {
                date = entry.date;
                changes = entry.changes;
                contributors = entry.contributors;
              }

              return (
                <li key={`${i}`} className="flex">
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
                           <Wrapper>
                             <img src={contributor[1]} alt="Avatar" style={{ height: '1.6em', borderRadius: '50%' }} /> {contributor[0]}
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
};
ChangelogTab.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default ChangelogTab;
