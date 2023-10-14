import type Config from 'parser/Config';
import Expansion from 'game/Expansion';
import type { Spec } from 'game/SPECS';
import type Report from 'parser/core/Report';
import { PRIMARY_STAT } from 'parser/shared/modules/features/STAT';
import type { PlayerInfo } from 'parser/core/Player';
import type Fight from 'parser/core/Fight';
import type CharacterProfile from 'parser/core/CharacterProfile';

export const TEST_SPEC: Spec = {
  className: {
    id: '',
  },
  specName: {
    id: '',
  },
  wclClassName: 'Test',
  wclSpecName: 'Test',
  masterySpellId: 0,
  masteryCoefficient: 0,
  id: 0,
  index: 0,
  primaryStat: PRIMARY_STAT.STRENGTH,
  ranking: { class: 0, spec: 0 },
  role: 0,
};

export const DEFAULT_CONFIG: Config = {
  changelog: [],
  contributors: [],
  description: undefined,
  exampleReport: '',
  expansion: Expansion.Dragonflight,
  isPartial: false,
  patchCompatibility: null,
  path: '',
  spec: TEST_SPEC,
};

export const DEFAULT_REPORT: Report = {
  code: '',
  end: 0,
  enemies: [],
  enemyPets: [],
  exportedCharacters: [],
  fights: [],
  friendlies: [],
  friendlyPets: [],
  gameVersion: 0,
  isAnonymous: false,
  lang: '',
  logVersion: 0,
  owner: '',
  phases: [],
  start: 0,
  title: '',
  zone: 0,
};

export const DEFAULT_PLAYER_INFO: PlayerInfo = {
  fights: [],
  guid: 0,
  icon: '',
  id: 1,
  name: '',
  type: '',
};

export const DEFAULT_FIGHT: Fight = {
  boss: 0,
  end_time: 0,
  id: 0,
  name: '',
  offset_time: 0,
  start_time: 0,
  filtered: false,
};

export const DEFAULT_CHARACTER_PROFILE: CharacterProfile = {
  achievementPoints: 0,
  blizzardUpdatedAt: '',
  class: 0,
  createdAt: '',
  faction: 0,
  gender: 0,
  heartOfAzeroth: undefined,
  id: 0,
  lastSeenAt: '',
  name: '',
  race: 0,
  realm: '',
  region: '',
  role: '',
  spec: '',
  talents: '',
  thumbnail: '',
};
