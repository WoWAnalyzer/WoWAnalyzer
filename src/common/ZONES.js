/* eslint-disable */

// a butchered version of https://www.warcraftlogs.com:443/v1/zones
// only inclused the raids from Legion (showing older logs wouldn't make sense)

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
      "brackets": [
          {
              "id": 1,
              "name": "827-829"
          },
          {
              "id": 2,
              "name": "830-832"
          },
          {
              "id": 3,
              "name": "833-835"
          },
          {
              "id": 4,
              "name": "836-838"
          },
          {
              "id": 5,
              "name": "839-841"
          },
          {
              "id": 6,
              "name": "842-844"
          },
          {
              "id": 7,
              "name": "845-847"
          },
          {
              "id": 8,
              "name": "848-850"
          },
          {
              "id": 9,
              "name": "851-853"
          },
          {
              "id": 10,
              "name": "854-856"
          },
          {
              "id": 11,
              "name": "857-859"
          },
          {
              "id": 12,
              "name": "860-862"
          },
          {
              "id": 13,
              "name": "863-865"
          },
          {
              "id": 14,
              "name": "866-868"
          },
          {
              "id": 15,
              "name": "869-871"
          },
          {
              "id": 16,
              "name": "872-874"
          },
          {
              "id": 17,
              "name": "875-877"
          },
          {
              "id": 18,
              "name": "878-880"
          },
          {
              "id": 19,
              "name": "881-883"
          },
          {
              "id": 20,
              "name": "884-886"
          },
          {
              "id": 21,
              "name": "887-889"
          },
          {
              "id": 22,
              "name": "890-892"
          },
          {
              "id": 23,
              "name": "893-895"
          },
          {
              "id": 24,
              "name": "896-898"
          },
          {
              "id": 25,
              "name": "899-901"
          },
          {
              "id": 26,
              "name": "902-904"
          },
          {
              "id": 27,
              "name": "905-907"
          },
          {
              "id": 28,
              "name": "908-910"
          },
          {
              "id": 29,
              "name": "911-913"
          },
          {
              "id": 30,
              "name": "914-916"
          },
          {
              "id": 31,
              "name": "917-919"
          },
          {
              "id": 32,
              "name": "920+"
          }
      ]
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
      "brackets": [
          {
              "id": 1,
              "name": "842-844"
          },
          {
              "id": 2,
              "name": "845-847"
          },
          {
              "id": 3,
              "name": "848-850"
          },
          {
              "id": 4,
              "name": "851-853"
          },
          {
              "id": 5,
              "name": "854-856"
          },
          {
              "id": 6,
              "name": "857-859"
          },
          {
              "id": 7,
              "name": "860-862"
          },
          {
              "id": 8,
              "name": "863-865"
          },
          {
              "id": 9,
              "name": "866-868"
          },
          {
              "id": 10,
              "name": "869-871"
          },
          {
              "id": 11,
              "name": "872-874"
          },
          {
              "id": 12,
              "name": "875-877"
          },
          {
              "id": 13,
              "name": "878-880"
          },
          {
              "id": 14,
              "name": "881-883"
          },
          {
              "id": 15,
              "name": "884-886"
          },
          {
              "id": 16,
              "name": "887-889"
          },
          {
              "id": 17,
              "name": "890-892"
          },
          {
              "id": 18,
              "name": "893-895"
          },
          {
              "id": 19,
              "name": "896-898"
          },
          {
              "id": 20,
              "name": "899-901"
          },
          {
              "id": 21,
              "name": "902-904"
          },
          {
              "id": 22,
              "name": "905-907"
          },
          {
              "id": 23,
              "name": "908-910"
          },
          {
              "id": 24,
              "name": "911-913"
          },
          {
              "id": 25,
              "name": "914-916"
          },
          {
              "id": 26,
              "name": "917-919"
          },
          {
              "id": 27,
              "name": "920-922"
          },
          {
              "id": 28,
              "name": "923-925"
          },
          {
              "id": 29,
              "name": "926-928"
          },
          {
              "id": 30,
              "name": "929-931"
          },
          {
              "id": 31,
              "name": "932-934"
          },
          {
              "id": 32,
              "name": "935+"
          }
      ]
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
      "brackets": [
          {
              "id": 1,
              "name": "827-829"
          },
          {
              "id": 2,
              "name": "830-832"
          },
          {
              "id": 3,
              "name": "833-835"
          },
          {
              "id": 4,
              "name": "836-838"
          },
          {
              "id": 5,
              "name": "839-841"
          },
          {
              "id": 6,
              "name": "842-844"
          },
          {
              "id": 7,
              "name": "845-847"
          },
          {
              "id": 8,
              "name": "848-850"
          },
          {
              "id": 9,
              "name": "851-853"
          },
          {
              "id": 10,
              "name": "854-856"
          },
          {
              "id": 11,
              "name": "857-859"
          },
          {
              "id": 12,
              "name": "860-862"
          },
          {
              "id": 13,
              "name": "863-865"
          },
          {
              "id": 14,
              "name": "866-868"
          },
          {
              "id": 15,
              "name": "869-871"
          },
          {
              "id": 16,
              "name": "872-874"
          },
          {
              "id": 17,
              "name": "875-877"
          },
          {
              "id": 18,
              "name": "878-880"
          },
          {
              "id": 19,
              "name": "881-883"
          },
          {
              "id": 20,
              "name": "884-886"
          },
          {
              "id": 21,
              "name": "887-889"
          },
          {
              "id": 22,
              "name": "890-892"
          },
          {
              "id": 23,
              "name": "893-895"
          },
          {
              "id": 24,
              "name": "896-898"
          },
          {
              "id": 25,
              "name": "899-901"
          },
          {
              "id": 26,
              "name": "902-904"
          },
          {
              "id": 27,
              "name": "905-907"
          },
          {
              "id": 28,
              "name": "908-910"
          },
          {
              "id": 29,
              "name": "911-913"
          },
          {
              "id": 30,
              "name": "914-916"
          },
          {
              "id": 31,
              "name": "917-919"
          },
          {
              "id": 32,
              "name": "920+"
          }
      ]
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
      "brackets": [
          {
              "id": 1,
              "name": "862-864"
          },
          {
              "id": 2,
              "name": "865-867"
          },
          {
              "id": 3,
              "name": "868-870"
          },
          {
              "id": 4,
              "name": "871-873"
          },
          {
              "id": 5,
              "name": "874-876"
          },
          {
              "id": 6,
              "name": "877-879"
          },
          {
              "id": 7,
              "name": "880-882"
          },
          {
              "id": 8,
              "name": "883-885"
          },
          {
              "id": 9,
              "name": "886-888"
          },
          {
              "id": 10,
              "name": "889-891"
          },
          {
              "id": 11,
              "name": "892-894"
          },
          {
              "id": 12,
              "name": "895-897"
          },
          {
              "id": 13,
              "name": "898-900"
          },
          {
              "id": 14,
              "name": "901-903"
          },
          {
              "id": 15,
              "name": "904-906"
          },
          {
              "id": 16,
              "name": "907-909"
          },
          {
              "id": 17,
              "name": "910-912"
          },
          {
              "id": 18,
              "name": "913-915"
          },
          {
              "id": 19,
              "name": "916-918"
          },
          {
              "id": 20,
              "name": "919-921"
          },
          {
              "id": 21,
              "name": "922-924"
          },
          {
              "id": 22,
              "name": "925-927"
          },
          {
              "id": 23,
              "name": "928-930"
          },
          {
              "id": 24,
              "name": "931-933"
          },
          {
              "id": 25,
              "name": "934-936"
          },
          {
              "id": 26,
              "name": "937-939"
          },
          {
              "id": 27,
              "name": "940-942"
          },
          {
              "id": 28,
              "name": "943-945"
          },
          {
              "id": 29,
              "name": "946-948"
          },
          {
              "id": 30,
              "name": "949-951"
          },
          {
              "id": 31,
              "name": "952-954"
          },
          {
              "id": 32,
              "name": "955+"
          }
      ]
  },
  {
      "id": 17,
      "name": "Antorus, The Burning Throne",
      "frozen": false,
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
      "brackets": [
          {
              "id": 1,
              "name": "908-910"
          },
          {
              "id": 2,
              "name": "911-913"
          },
          {
              "id": 3,
              "name": "914-916"
          },
          {
              "id": 4,
              "name": "917-919"
          },
          {
              "id": 5,
              "name": "920-922"
          },
          {
              "id": 6,
              "name": "923-925"
          },
          {
              "id": 7,
              "name": "926-928"
          },
          {
              "id": 8,
              "name": "929-931"
          },
          {
              "id": 9,
              "name": "932-934"
          },
          {
              "id": 10,
              "name": "935-937"
          },
          {
              "id": 11,
              "name": "938-940"
          },
          {
              "id": 12,
              "name": "941-943"
          },
          {
              "id": 13,
              "name": "944-946"
          },
          {
              "id": 14,
              "name": "947-949"
          },
          {
              "id": 15,
              "name": "950-952"
          },
          {
              "id": 16,
              "name": "953-955"
          },
          {
              "id": 17,
              "name": "956-958"
          },
          {
              "id": 18,
              "name": "959-961"
          },
          {
              "id": 19,
              "name": "962-964"
          },
          {
              "id": 20,
              "name": "965-967"
          },
          {
              "id": 21,
              "name": "968-970"
          },
          {
              "id": 22,
              "name": "971-973"
          },
          {
              "id": 23,
              "name": "974-976"
          },
          {
              "id": 24,
              "name": "977-979"
          },
          {
              "id": 25,
              "name": "980-982"
          },
          {
              "id": 26,
              "name": "983-985"
          },
          {
              "id": 27,
              "name": "986+"
          }
      ]
  },
]

export default ZONES;