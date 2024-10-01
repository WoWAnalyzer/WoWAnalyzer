// Source: https://us.api.blizzard.com/wow/data/character/races?locale=en_US&accessToken=

export interface Race {
  id: number;
  mask?: number;
  side: string;
  name: string;
}

const RACES = {
  Human: {
    id: 1,
    mask: 1,
    side: 'alliance',
    name: 'Human',
  },
  Orc: {
    id: 2,
    mask: 2,
    side: 'horde',
    name: 'Orc',
  },
  Dwarf: {
    id: 3,
    mask: 4,
    side: 'alliance',
    name: 'Dwarf',
  },
  NightElf: {
    id: 4,
    mask: 8,
    side: 'alliance',
    name: 'Night Elf',
  },
  Undead: {
    id: 5,
    mask: 16,
    side: 'horde',
    name: 'Undead',
  },
  Tauren: {
    id: 6,
    mask: 32,
    side: 'horde',
    name: 'Tauren',
  },
  Gnome: {
    id: 7,
    mask: 64,
    side: 'alliance',
    name: 'Gnome',
  },
  Troll: {
    id: 8,
    mask: 128,
    side: 'horde',
    name: 'Troll',
  },
  Goblin: {
    id: 9,
    mask: 256,
    side: 'horde',
    name: 'Goblin',
  },
  BloodElf: {
    id: 10,
    mask: 512,
    side: 'horde',
    name: 'Blood Elf',
  },
  Draenei: {
    id: 11,
    mask: 1024,
    side: 'alliance',
    name: 'Draenei',
  },
  Worgen: {
    id: 22,
    mask: 2097152,
    side: 'alliance',
    name: 'Worgen',
  },
  PandarenNeutral: {
    id: 24,
    mask: 8388608,
    side: 'neutral',
    name: 'Pandaren',
  },
  PandarenAlliance: {
    id: 25,
    mask: 16777216,
    side: 'alliance',
    name: 'Pandaren',
  },
  PandarenHorde: {
    id: 26,
    mask: 33554432,
    side: 'horde',
    name: 'Pandaren',
  },
  Nightborne: {
    id: 27,
    mask: 67108864,
    side: 'horde',
    name: 'Nightborne',
  },
  HighmountainTauren: {
    id: 28,
    mask: 134217728,
    side: 'horde',
    name: 'Highmountain Tauren',
  },
  VoidElf: {
    id: 29,
    mask: 268435456,
    side: 'alliance',
    name: 'Void Elf',
  },
  LightforgedDraenei: {
    id: 30,
    mask: 536870912,
    side: 'alliance',
    name: 'Lightforged Draenei',
  },
  ZandalariTroll: {
    id: 31,
    side: 'horde',
    name: 'Zandalari Troll',
  },
  KulTiran: {
    id: 32,
    side: 'alliance',
    name: 'Kul Tiran',
  },
  DarkIronDwarf: {
    id: 34,
    mask: 2,
    side: 'alliance',
    name: 'Dark Iron Dwarf',
  },
  Vulpera: {
    id: 35,
    side: 'horde',
    name: 'Vulpera',
  },
  MagharOrc: {
    id: 36,
    mask: 8,
    side: 'horde',
    name: "Mag'har Orc",
  },
  Mechagnome: {
    id: 37,
    name: 'Mechagnome',
    side: 'alliance',
  },
  DracthyrAlliance: {
    id: 52,
    mask: 16777216,
    side: 'alliance',
    name: 'Dracthyr',
  },
  DracthyrHorde: {
    id: 70,
    mask: 33554432,
    side: 'horde',
    name: 'Dracthyr',
  },
  EarthenHorde: {
    id: 84,
    name: 'Earthen',
    side: 'horde',
  },
  EarthenAlliance: {
    id: 85,
    name: 'Earthen',
    side: 'alliance',
  },
} satisfies Record<string, Race>;

export default RACES;
