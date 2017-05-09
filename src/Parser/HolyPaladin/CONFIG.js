import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CPM_ABILITIES, { SPELL_CATEGORY } from './CPM_ABILITIES';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.HOLY_PALADIN,
  githubUrl: 'https://github.com/MartijnHols/HolyPaladinAnalyzer',
  changelog: CHANGELOG,
  parser: CombatLogParser,
  CPM_ABILITIES,
  CPM_ABILITIES_CATEGORIES: SPELL_CATEGORY,
};
