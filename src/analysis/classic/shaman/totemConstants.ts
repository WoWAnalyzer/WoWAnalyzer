import SPELLS from 'common/SPELLS/classic/shaman';

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
    SPELLS.SEARING_TOTEM.id,
    SPELLS.FIRE_ELEMENTAL_TOTEM.id,
    SPELLS.TOTEM_OF_WRATH.id,
    SPELLS.MAGMA_TOTEM.id,
    SPELLS.FLAMETONGUE_TOTEM.id,
    SPELLS.FROST_RESISTANCE_TOTEM.id,
  ],
  [TotemElements.Water]: [
    SPELLS.MANA_TIDE_TOTEM.id,
    SPELLS.MANA_SPRING_TOTEM.id,
    SPELLS.HEALING_STREAM_TOTEM.id,
    SPELLS.CLEANSING_TOTEM.id,
    SPELLS.FIRE_RESISTANCE_TOTEM.id,
  ],
  [TotemElements.Earth]: [
    SPELLS.EARTHBIND_TOTEM.id,
    SPELLS.EARTH_ELEMENTAL_TOTEM.id,
    SPELLS.STONECLAW_TOTEM.id,
    SPELLS.STONESKIN_TOTEM.id,
    SPELLS.STRENGTH_OF_EARTH_TOTEM.id,
  ],
  [TotemElements.Air]: [
    SPELLS.GROUNDING_TOTEM.id,
    SPELLS.NATURE_RESISTANCE_TOTEM.id,
    SPELLS.WINDFURY_TOTEM.id,
    SPELLS.WRATH_OF_AIR_TOTEM.id,
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
  [SPELLS.SEARING_TOTEM.id]: 120000,
  [SPELLS.FIRE_ELEMENTAL_TOTEM.id]: 120000,
  [SPELLS.TOTEM_OF_WRATH.id]: 120000,
  [SPELLS.MAGMA_TOTEM.id]: 20000,
  [SPELLS.FLAMETONGUE_TOTEM.id]: 120000,
  [SPELLS.FROST_RESISTANCE_TOTEM.id]: 120000,
  [SPELLS.MANA_TIDE_TOTEM.id]: 12000,
  [SPELLS.MANA_SPRING_TOTEM.id]: 120000,
  [SPELLS.HEALING_STREAM_TOTEM.id]: 120000,
  [SPELLS.CLEANSING_TOTEM.id]: 120000,
  [SPELLS.FIRE_RESISTANCE_TOTEM.id]: 120000,
  [SPELLS.EARTHBIND_TOTEM.id]: 45000,
  [SPELLS.EARTH_ELEMENTAL_TOTEM.id]: 120000,
  [SPELLS.STONECLAW_TOTEM.id]: 15000,
  [SPELLS.STONESKIN_TOTEM.id]: 120000,
  [SPELLS.STRENGTH_OF_EARTH_TOTEM.id]: 120000,
  [SPELLS.GROUNDING_TOTEM.id]: 45000,
  [SPELLS.NATURE_RESISTANCE_TOTEM.id]: 120000,
  [SPELLS.WINDFURY_TOTEM.id]: 120000,
  [SPELLS.WRATH_OF_AIR_TOTEM.id]: 120000,
};

export const GetTotemElement = (totemSpellId: number): TotemElements | null => {
  for (const element of TotemElementsList) {
    if (TOTEMS_BY_ELEMENT[element].includes(totemSpellId)) {
      return element as TotemElements;
    }
  }

  return null;
};
