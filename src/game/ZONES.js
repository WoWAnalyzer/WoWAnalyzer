/* eslint-disable */

// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only inclused the raids from Legion (showing older logs wouldn't make sense)

// TODO: Refactor this (it's kind of strange and feels misplaced)

const ZONES = [
  {
    "id": 23,
    "name": "The Eternal Palace",
    "frozen": true,
    "encounters": [
      {
        "id": 2298,
        "name": "Abyssal Commander Sivarra",
        "npcID": 145371
      },
      {
        "id": 2305,
        "name": "Radiance of Azshara",
        "npcID": 145371
      },
      {
        "id": 2289,
        "name": "Blackwater Behemoth",
        "npcID": 145371
      },
      {
        "id": 2304,
        "name": "Lady Ashvane",
        "npcID": 145371
      },
      {
        "id": 2303,
        "name": "Orgozoa",
        "npcID": 145371
      },
      {
        "id": 2311,
        "name": "The Queen's Court",
        "npcID": 145371
      },
      {
        "id": 2293,
        "name": "Za'qul, Harbinger of Ny'alotha",
        "npcID": 145371
      },
      {
        "id": 2299,
        "name": "Queen Azshara",
        "npcID": 145371
      }
    ],
    "brackets": {
      "min": 400,
      "max": 457,
      "bucket": 3,
      "type": "Item Level"
    }
  },
  {
    "id": 22,
    "name": "Crucible of Storms",
    "frozen": false,
    "encounters": [
      {
        "id": 2269,
        "name": "The Restless Cabal",
        "npcID": 146497
      },
      {
        "id": 2273,
        "name": "Uu'nat, Harbinger of the Void",
        "npcID": 145371
      }
    ],
    "brackets": {
      "min": 370,
      "max": 427,
      "bucket": 3,
      "type": "Item Level"
    }
  },
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
    "brackets": {
      "min": 370,
      "max": 427,
      "bucket": 3,
      "type": "Item Level"
    },
    "partitions": [
      {
        "name": "8.1",
        "compact": "8.1"
      },
      {
        "name": "8.1.5",
        "compact": "8.1.5",
        "default": true
      }
    ]
  },
  {
    "id": 19,
    "name": "Uldir",
    "frozen": true,
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
    "brackets": {
      "min": 340,
      "max": 397,
      "bucket": 3,
      "type": "Item Level"
    },
    "partitions": [
      {
        "name": "8.0",
        "compact": "8.0",
        "default": true
      },
      {
        "name": "8.1",
        "compact": "8.1"
      }
    ]
  },
];

export default ZONES;
