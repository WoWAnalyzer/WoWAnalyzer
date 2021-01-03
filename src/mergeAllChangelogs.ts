import AVAILABLE_CONFIGS from 'parser';
import { Spec } from 'game/SPECS';
import { ChangelogEntry } from 'common/changelog';

import CORE_CHANGELOG from './CHANGELOG';

export default function mergeAllChangelogs() {
  const allChangelogEntries: Array<
    ChangelogEntry & {
      spec?: Spec;
    }
  > = [...CORE_CHANGELOG];
  AVAILABLE_CONFIGS.forEach((config) => {
    config.changelog.forEach((changelogEntry) => {
      allChangelogEntries.push({
        spec: config.spec,
        ...changelogEntry,
      });
    });
  });
  return allChangelogEntries;
}
