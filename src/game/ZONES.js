/* eslint-disable */

// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only inclused the raids from Legion (showing older logs wouldn't make sense)

// TODO: Refactor this (it's kind of strange and feels misplaced)

const ZONES = [
  {
    "id": 21,
    "name": "Battle of Dazar'alor",
    "encounters": [
      {
        "id": 2265,
        "name": "Champion of the Light",
        "npcID": 144680
      },
      {
        "id": 2266,
        "name": "Jadefire Masters",
        "npcID": 144690
      },
      {
        "id": 2263,
        "name": "Grong",
        "npcID": 144637
      },
      {
        "id": 2271,
        "name": "Opulence",
        "npcID": 145261
      },
      {
        "id": 2268,
        "name": "Conclave of the Chosen",
        "npcID": 144747
      },
      {
        "id": 2272,
        "name": "King Rastakhan",
        "npcID": 145616
      },
      {
        "id": 2276,
        "name": "Mekkatorque",
        "npcID": 144796
      },
      {
        "id": 2280,
        "name": "Stormwall Blockade",
        "npcID": 146256
      },
      {
        "id": 2281,
        "name": "Lady Jaina Proudmoore",
        "npcID": 146416
      }
    ],
   }, {
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
