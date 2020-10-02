import AVAILABLE_CONFIGS from 'parser';

import CORE_CHANGELOG from './CHANGELOG';

/**
 * @returns {Array<{ category: 'CORE' | object date: Date changes: React.ReactNode contributors: any[] }>}
 */
export default function mergeAllChangelogs() {
  const allChangelogEntries = [].concat(CORE_CHANGELOG);
  AVAILABLE_CONFIGS.forEach(config => {
    config.changelog.forEach(changelogEntry => {
      allChangelogEntries.push({
        spec: config.spec,
        ...changelogEntry,
      });
    });
  });
  return allChangelogEntries;
}
