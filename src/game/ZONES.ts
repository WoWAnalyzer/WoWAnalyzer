// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only includes the raids from Shadowlands (showing older logs wouldn't make sense)

// TODO: Refactor this (it's kind of strange and feels misplaced)

interface Encounter {
  id: number;
  name: string;
  npcID: number;
}

interface Bracket {
  min: number;
  max: number;
  bucket: number;
  type: string;
}

interface Partition {
  name: string;
  compact: string;
  default?: boolean;
}

interface Zone {
  id: number;
  name: string;
  frozen?: boolean;
  encounters: Encounter[];
  brackets: Bracket;
  partitions?: Partition[];
}

const ZONES: Zone[] = [
  {
    'id': 26,
    'name': 'Castle Nathria',
    'frozen': false,
    'brackets': {
      'min': 173,
      'max': 230,
      'bucket': 3,
      'type': 'Item Level',
    },
    'encounters': [
      {
        'id': 2398,
        'name': 'Shriekwing',
        'npcID': 164406,
      },
      {
        'id': 2418,
        'name': 'Huntsman Altimor',
        'npcID': 165066,
      },
      {
        'id': 2383,
        'name': 'Hungering Destroyer',
        'npcID': 164261,
      },
      {
        'id': 2402,
        'name': 'Sun King\'s Salvation',
        'npcID': 168973, //High Torturer Darithos
      },
      {
        'id': 2405,
        'name': 'Artificer Xy\'mox',
        'npcID': 166644,
      },
      {
        'id': 2406,
        'name': 'Lady Inerva Darkvein',
        'npcID': 165521,
      },
      {
        'id': 2412,
        'name': 'The Council of Blood',
        'npcID': 166969,
      },
      {
        'id': 2399,
        'name': 'Sludgefist',
        'npcID': 164407,
      },
      {
        'id': 2417,
        'name': 'Stone Legion Generals',
        'npcID': 168113,
      },
      {
        'id': 2407,
        'name': 'Sire Denathrius',
        'npcID': 167406,
      },
    ],
  },
];

export default ZONES;
