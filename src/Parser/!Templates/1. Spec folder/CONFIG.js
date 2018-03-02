import { MyHandle } from 'MAINTAINERS';

import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.MY_NEW_SPEC,
  maintainers: [MyHandle],
  // TODO: specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/milestone/2',

  // Shouldn't have to change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec
  path: __dirname,
};
