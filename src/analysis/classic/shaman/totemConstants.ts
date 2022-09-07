import * as SPELLS from './SPELLS';

export enum TotemElements {
  Fire = 'Fire',
  Water = 'Water',
  Earth = 'Earth',
  Air = 'Air',
}

export const TotemElementsList = [
  TotemElements.Fire,
  TotemElements.Water,
  TotemElements.Earth,
  TotemElements.Air,
];

export const TOTEMS_BY_ELEMENT = {
  [TotemElements.Fire]: [
    SPELLS.SEARING_TOTEM,
    SPELLS.FIRE_ELEMENTAL_TOTEM,
    SPELLS.TOTEM_OF_WRATH,
    SPELLS.MAGMA_TOTEM,
    SPELLS.FIRE_NOVA_TOTEM,
    SPELLS.FLAMETONGUE_TOTEM,
    SPELLS.FROST_RESISTANCE_TOTEM,
  ],
  [TotemElements.Water]: [
    SPELLS.MANA_TIDE_TOTEM,
    SPELLS.MANA_SPRING_TOTEM,
    SPELLS.HEALING_STREAM_TOTEM,
    SPELLS.POISON_CLEANSING_TOTEM,
    SPELLS.DISEASE_CLEANSING_TOTEM,
    SPELLS.FIRE_RESISTANCE_TOTEM,
  ],
  [TotemElements.Earth]: [
    SPELLS.EARTHBIND_TOTEM,
    SPELLS.EARTH_ELEMENTAL_TOTEM,
    SPELLS.STONECLAW_TOTEM,
    SPELLS.STONESKIN_TOTEM,
    SPELLS.STRENGTH_OF_EARTH_TOTEM,
  ],
  [TotemElements.Air]: [
    SPELLS.GROUNDING_TOTEM,
    SPELLS.GRACE_OF_AIR_TOTEM,
    SPELLS.NATURE_RESISTANCE_TOTEM,
    SPELLS.WINDFURY_TOTEM,
    SPELLS.WINDWALL_TOTEM,
    SPELLS.WRATH_OF_AIR_TOTEM,
  ],
};

export const All_TOTEMS = [
  ...TOTEMS_BY_ELEMENT[TotemElements.Fire],
  ...TOTEMS_BY_ELEMENT[TotemElements.Water],
  ...TOTEMS_BY_ELEMENT[TotemElements.Earth],
  ...TOTEMS_BY_ELEMENT[TotemElements.Air],
];

export const TotemFilter = (element: TotemElements) =>
  TOTEMS_BY_ELEMENT[element].map((totemId) => ({ id: totemId }));
export const AllTotemsFilter = () => All_TOTEMS.map((totemId) => ({ id: totemId }));

export const TotemDurations = {
  [SPELLS.SEARING_TOTEM]: 120000,
  [SPELLS.FIRE_ELEMENTAL_TOTEM]: 120000,
  [SPELLS.TOTEM_OF_WRATH]: 120000,
  [SPELLS.MAGMA_TOTEM]: 20000,
  [SPELLS.FIRE_NOVA_TOTEM]: 5000,
  [SPELLS.FLAMETONGUE_TOTEM]: 120000,
  [SPELLS.FROST_RESISTANCE_TOTEM]: 120000,
  [SPELLS.MANA_TIDE_TOTEM]: 12000,
  [SPELLS.MANA_SPRING_TOTEM]: 120000,
  [SPELLS.HEALING_STREAM_TOTEM]: 120000,
  [SPELLS.POISON_CLEANSING_TOTEM]: 120000,
  [SPELLS.DISEASE_CLEANSING_TOTEM]: 120000,
  [SPELLS.FIRE_RESISTANCE_TOTEM]: 120000,
  [SPELLS.EARTHBIND_TOTEM]: 45000,
  [SPELLS.EARTH_ELEMENTAL_TOTEM]: 120000,
  [SPELLS.STONECLAW_TOTEM]: 15000,
  [SPELLS.STONESKIN_TOTEM]: 120000,
  [SPELLS.STRENGTH_OF_EARTH_TOTEM]: 120000,
  [SPELLS.GROUNDING_TOTEM]: 45000,
  [SPELLS.GRACE_OF_AIR_TOTEM]: 120000,
  [SPELLS.NATURE_RESISTANCE_TOTEM]: 120000,
  [SPELLS.WINDFURY_TOTEM]: 120000,
  [SPELLS.WINDWALL_TOTEM]: 120000,
  [SPELLS.WRATH_OF_AIR_TOTEM]: 120000,
};

export const GetTotemElement = (totemSpellId: number): TotemElements | null => {
  for (const element of TotemElementsList) {
    if (TOTEMS_BY_ELEMENT[element].includes(totemSpellId)) {
      return element as TotemElements;
    }
  }

  return null;
};
