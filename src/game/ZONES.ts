// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only includes the raids from Dragonflight (showing older logs wouldn't make sense)
import vaultOfTheIncarnates from 'game/raids/vaultoftheincarnates';

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
    id: 31,
    name: 'Vault of the Incarnates',
    frozen: false,
    encounters: [
      vaultOfTheIncarnates.bosses.Eranog,
      vaultOfTheIncarnates.bosses.Terros,
      vaultOfTheIncarnates.bosses.PrimalCouncil,
      vaultOfTheIncarnates.bosses.Sennarth,
      vaultOfTheIncarnates.bosses.Dathea,
      vaultOfTheIncarnates.bosses.KurogGrimtotem,
      vaultOfTheIncarnates.bosses.BroodkeeperDiurna,
      vaultOfTheIncarnates.bosses.Raszageth,
    ],
    brackets: {
      min: 376,
      max: 424,
      bucket: 3,
      type: 'Item Level',
    },
    partitions: [
      {
        name: '10.0',
        compact: '10.0',
      },
      {
        name: '10.0.7',
        compact: '10.0.7',
        default: true,
      },
    ],
  },
];

export default ZONES;
