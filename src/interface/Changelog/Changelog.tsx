import React from 'react';

import CORE_CHANGELOG from 'CHANGELOG';
import { change } from 'common/changelog';
import ReadableListing from 'interface/ReadableListing';
import Contributor from 'interface/ContributorButton';

interface Props {
  changelog: ReturnType<typeof change>[];
  limit?: number;
  includeCore?: boolean;
}

const Changelog = ({ changelog, limit, includeCore = true }: Props) => {
  const mergedChangelog: ReturnType<typeof change>[] = includeCore
    ? [...CORE_CHANGELOG, ...changelog].sort((a: any, b: any) => b.date - a.date)
    : changelog;

  return (
    <ul className="list text">
      {mergedChangelog
        .filter((_, i) => !limit || i < limit)
        .map(entry => {
          const { date, changes, contributors } = entry;
          const isFromCoreChangelog = CORE_CHANGELOG.includes(entry);
          // The index of the entry provides us with a unique never changing key, which speeds up the Shared Changes toggle
          const index = isFromCoreChangelog
            ? CORE_CHANGELOG.indexOf(entry)
            : changelog.indexOf(entry);
          return (
            <li
              key={isFromCoreChangelog ? `core-${index}` : `spec-${index}`}
              className={`flex wrapable ${
                includeCore && isFromCoreChangelog ? 'text-muted' : ''
              }`}
            >
              <div
                className="flex-sub"
                style={{ minWidth: 100, paddingRight: 15 }}
              >
                {date.toLocaleDateString()}
              </div>
              <div className="flex-main" style={{ minWidth: 200 }}>
                {changes}
              </div>
              <div
                className="flex-sub"
                style={{ minWidth: 150, paddingLeft: 15, textAlign: 'right' }}
              >
                <ReadableListing>
                  {contributors.map(contributor => (
                    <Contributor key={contributor.nickname} {...contributor} />
                  ))}
                </ReadableListing>
              </div>
            </li>
          );
        })}
    </ul>
  );
};

export default Changelog;
