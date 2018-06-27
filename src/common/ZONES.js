/* eslint-disable */

// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only inclused the raids from Legion (showing older logs wouldn't make sense)
// partitions-prop needs to be updated manually with the release of a new partion to allow filtering
// most recent partition needs to be the first item in the array

const ZONES = [
  {
    "id": 10,
    "name": "Emerald Nightmare",
    "frozen": true,
    "encounters": [
      {
        "id": 1853,
        "name": "Nythendra",
        "npcID": 103160
      },
      {
        "id": 1873,
        "name": "Il'gynoth, Heart of Corruption",
        "npcID": 105393
      },
      {
        "id": 1876,
        "name": "Elerethe Renferal",
        "npcID": 111000
      },
      {
        "id": 1841,
        "name": "Ursoc",
        "npcID": 100497
      },
      {
        "id": 1854,
        "name": "Dragons of Nightmare",
        "npcID": 102679
      },
      {
        "id": 1877,
        "name": "Cenarius",
        "npcID": 113534
      },
      {
        "id": 1864,
        "name": "Xavius",
        "npcID": 103769
      }
    ],
  },
  {
    "id": 11,
    "name": "The Nighthold",
    "frozen": true,
    "encounters": [
      {
        "id": 1849,
        "name": "Skorpyron",
        "npcID": 102263
      },
      {
        "id": 1865,
        "name": "Chronomatic Anomaly",
        "npcID": 104415
      },
      {
        "id": 1867,
        "name": "Trilliax",
        "npcID": 104288
      },
      {
        "id": 1871,
        "name": "Spellblade Aluriel",
        "npcID": 107699
      },
      {
        "id": 1862,
        "name": "Tichondrius",
        "npcID": 103685
      },
      {
        "id": 1863,
        "name": "Star Augur Etraeus",
        "npcID": 103758
      },
      {
        "id": 1842,
        "name": "Krosus",
        "npcID": 101002
      },
      {
        "id": 1886,
        "name": "High Botanist Tel'arn",
        "npcID": 104528
      },
      {
        "id": 1872,
        "name": "Grand Magistrix Elisande",
        "npcID": 110965
      },
      {
        "id": 1866,
        "name": "Gul'dan",
        "npcID": 105503
      }
    ],
  },
  {
    "id": 12,
    "name": "Trial of Valor",
    "frozen": true,
    "encounters": [
      {
        "id": 1958,
        "name": "Odyn",
        "npcID": 115323
      },
      {
        "id": 1962,
        "name": "Guarm",
        "npcID": 114344
      },
      {
        "id": 2008,
        "name": "Helya",
        "npcID": 93394
      }
    ],
  },
  {
    "id": 13,
    "name": "Tomb of Sargeras",
    "frozen": true,
    "encounters": [
      {
        "id": 2032,
        "name": "Goroth",
        "npcID": 115844
      },
      {
        "id": 2048,
        "name": "Demonic Inquisition",
        "npcID": 116689
      },
      {
        "id": 2036,
        "name": "Harjatan",
        "npcID": 116407
      },
      {
        "id": 2037,
        "name": "Mistress Sassz'ine",
        "npcID": 115767
      },
      {
        "id": 2050,
        "name": "Sisters of the Moon",
        "npcID": 118523
      },
      {
        "id": 2054,
        "name": "The Desolate Host",
        "npcID": 118460
      },
      {
        "id": 2052,
        "name": "Maiden of Vigilance",
        "npcID": 118289
      },
      {
        "id": 2038,
        "name": "Fallen Avatar",
        "npcID": 116939
      },
      {
        "id": 2051,
        "name": "Kil'jaeden",
        "npcID": 117269
      }
    ],
  },
  {
    "id": 17,
    "name": "Antorus, The Burning Throne",
    "frozen": false,
    "partitions": [
      {
        "id": 2,
        "name": "Empowered Artifacts",
      },
      {
        "id": 1,
        "name": "Normal Artifacts",
      },
    ],
    "encounters": [
      {
        "id": 2076,
        "name": "Garothi Worldbreaker",
        "npcID": 122450
      },
      {
        "id": 2074,
        "name": "Felhounds of Sargeras",
        "npcID": 122477
      },
      {
        "id": 2070,
        "name": "Antoran High Command",
        "npcID": 122367
      },
      {
        "id": 2075,
        "name": "Eonar the Life-Binder",
        "npcID": 122500
      },
      {
        "id": 2064,
        "name": "Portal Keeper Hasabel",
        "npcID": 122104
      },
      {
        "id": 2082,
        "name": "Imonar the Soulhunter",
        "npcID": 124158
      },
      {
        "id": 2088,
        "name": "Kin'garoth",
        "npcID": 122578
      },
      {
        "id": 2069,
        "name": "Varimathras",
        "npcID": 122366
      },
      {
        "id": 2073,
        "name": "The Coven of Shivarra",
        "npcID": 122468
      },
      {
        "id": 2063,
        "name": "Aggramar",
        "npcID": 121975
      },
      {
        "id": 2092,
        "name": "Argus the Unmaker",
        "npcID": 124828
      }
    ],
  },
]

export default ZONES;