// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only includes the raids from Shadowlands (showing older logs wouldn't make sense)

// TODO: Refactor this (it's kind of strange and feels misplaced)

interface Encounter {
  id: number;
  name: string;
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
    id: 26,
    name: 'Castle Nathria',
    frozen: false,
    encounters: [
      {
        id: 2398,
        name: 'Shriekwing',
      },
      {
        id: 2418,
        name: 'Huntsman Altimor',
      },
      {
        id: 2383,
        name: 'Hungering Destroyer',
      },
      {
        id: 2402,
        name: "Sun King's Salvation",
      },
      {
        id: 2405,
        name: "Artificer Xy'mox",
      },
      {
        id: 2406,
        name: 'Lady Inerva Darkvein',
      },
      {
        id: 2412,
        name: 'The Council of Blood',
      },
      {
        id: 2399,
        name: 'Sludgefist',
      },
      {
        id: 2417,
        name: 'Stone Legion Generals',
      },
      {
        id: 2407,
        name: 'Sire Denathrius',
      },
    ],
    brackets: {
      min: 173,
      max: 230,
      bucket: 3,
      type: 'Item Level',
    },
    partitions: [
      {
        name: '9.0',
        compact: '9.0',
      },
      {
        name: '9.0.5',
        compact: '9.0.5',
        default: true,
      },
      {
        name: '9.1',
        compact: '9.1',
      },
    ],
  },
  {
    id: 28,
    name: 'Sanctum of Domination',
    frozen: false,
    encounters: [
      {
        id: 2423,
        name: 'The Tarragrue',
      },
      {
        id: 2433,
        name: 'The Eye of the Jailer',
      },
      {
        id: 2429,
        name: 'The Nine',
      },
      {
        id: 2432,
        name: "Remnant of Ner'zhul",
      },
      {
        id: 2434,
        name: 'Soulrender Dormazain',
      },
      {
        id: 2430,
        name: 'Painsmith Raznal',
      },
      {
        id: 2436,
        name: 'Guardian of the First Ones',
      },
      {
        id: 2431,
        name: 'Fatescribe Roh-Kalo',
      },
      {
        id: 2422,
        name: "Kel'Thuzad",
      },
      {
        id: 2435,
        name: 'Sylvanas Windrunner',
      },
    ],
    brackets: {
      min: 203,
      max: 260,
      bucket: 3,
      type: 'Item Level',
    },
  },
];

export default ZONES;
