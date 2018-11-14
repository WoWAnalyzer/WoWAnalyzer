/* eslint-disable */

// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only inclused the raids from Legion (showing older logs wouldn't make sense)

// TODO: Refactor this (it's kind of strange and feels misplaced)

const ZONES = [
  {
    "id": 19,
    "name": "Uldir",
    "encounters": [
      {
        "id": 2144,
        "name": "Taloc",
        "npcID": 137119
      },
      {
        "id": 2141,
        "name": "MOTHER",
        "npcID": 135452
      },
      {
        "id": 2128,
        "name": "Fetid Devourer",
        "npcID": 133298
      },
      {
        "id": 2136,
        "name": "Zek'voz",
        "npcID": 134445
      },
      {
        "id": 2134,
        "name": "Vectis",
        "npcID": 134442
      },
      {
        "id": 2145,
        "name": "Zul",
        "npcID": 138967
      },
      {
        "id": 2135,
        "name": "Mythrax",
        "npcID": 134546
      },
      {
        "id": 2122,
        "name": "G'huun",
        "npcID": 132998
      }
    ],
  },
];

export default ZONES;
