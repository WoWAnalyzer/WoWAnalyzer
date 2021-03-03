import AVAILABLE_CONFIGS from 'parser';
import { Spec } from 'game/SPECS';
import { ChangelogEntry } from 'common/changelog';

import CORE_CHANGELOG from './CHANGELOG';

export type ChangeLogItem = ChangelogEntry & {spec?: Spec}

export default function mergeAllChangelogs() {
  const allChangelogEntries: ChangeLogItem[] = [...CORE_CHANGELOG];
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
