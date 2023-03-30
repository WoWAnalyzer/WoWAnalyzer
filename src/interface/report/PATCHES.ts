/*
  Using https://www.epochconverter.com/ to find the epoch timestamp for dates
  Multiply the timestamp by 1000 as JS does timestamps in MS rather than S

  Timestamps are for the NA Region to match WCL
*/

import Expansion from 'game/Expansion';

export interface Patch {
  name: string;
  timestamp: number;
  urlPrefix: string;
  isCurrent: boolean;
  gameVersion: number;
  expansion: Expansion;
}

const PATCHES: Patch[] = [
  {
    name: '3.4.0',
    timestamp: 1664229600000, // GMT: Monday, 26 September 2022 22:00:00
    urlPrefix: '',
    isCurrent: true,
    gameVersion: 4, // WotLK
    expansion: Expansion.WrathOfTheLichKing,
  },
  {
    name: '9.0.2',
    timestamp: 1605564000000, // GMT: Monday, 16 November 2020 22:00:00
    urlPrefix: 'shadowlands',
    isCurrent: false,
    gameVersion: 1, // retail
    expansion: Expansion.Shadowlands,
  },
  {
    name: '9.0.5',
    timestamp: 1615240800000, // GMT: Monday, 8 March 2021 22:00:00
    urlPrefix: 'shadowlands',
    isCurrent: false,
    gameVersion: 1, // retail
    expansion: Expansion.Shadowlands,
  },
  {
    name: '9.1.0',
    timestamp: 1624917600000, // GMT: Monday, 28 June 2021 22:00:00
    urlPrefix: 'shadowlands',
    isCurrent: false,
    gameVersion: 1, // retail
    expansion: Expansion.Shadowlands,
  },
  {
    name: '9.1.5',
    timestamp: 1635804000000, // GMT: Monday, 1 November 2021 22:00:00
    urlPrefix: 'shadowlands',
    isCurrent: false,
    gameVersion: 1, // retail
    expansion: Expansion.Shadowlands,
  },
  {
    name: '9.2.0',
    timestamp: 1645480800000, // GMT: Monday, 21 February 2022 22:00:00
    urlPrefix: 'shadowlands',
    isCurrent: false,
    gameVersion: 1, // retail
    expansion: Expansion.Shadowlands,
  },
  {
    name: '9.2.5 Season 3',
    timestamp: 1653948000000, // GMT: Monday, 30 May 2022 22:00:00
    urlPrefix: 'shadowlands',
    isCurrent: false,
    gameVersion: 1, // retail
    expansion: Expansion.Shadowlands,
  },
  {
    name: '9.2.5 Season 4',
    timestamp: 1659391200000, // GMT: Monday, 1 August 2022 22:00:00
    urlPrefix: 'shadowlands',
    isCurrent: false,
    gameVersion: 1, // retail
    expansion: Expansion.Shadowlands,
  },
  {
    name: '9.2.7',
    timestamp: 1660600800000, // GMT: Monday, 15 August 2022 22:00:00
    urlPrefix: 'shadowlands',
    isCurrent: false,
    gameVersion: 1, // retail
    expansion: Expansion.Shadowlands,
  },
  {
    name: '10.0.0',
    timestamp: 1666728000000, // GMT: Tuesday, 25 October 2022 22:00:00
    urlPrefix: '',
    isCurrent: false,
    gameVersion: 1, // retail
    expansion: Expansion.Dragonflight,
  },
  {
    name: '10.0.2',
    timestamp: 1668549600000, // GMT: Tuesday, 15 November 2022 22:00:00
    urlPrefix: '',
    isCurrent: false,
    gameVersion: 1, // retail
    expansion: Expansion.Dragonflight,
  },
  {
    name: '10.0.2 Dragonflight Launch',
    timestamp: 1669676400000, // GMT: Monday, 28 November 2022 23:00:00
    urlPrefix: '',
    isCurrent: false,
    gameVersion: 1, // retail
    expansion: Expansion.Dragonflight,
  },
  {
    name: '10.0.5',
    timestamp: 1674597600000, // GMT: Tuesday, 24 January 2023 22:00:00
    urlPrefix: '',
    isCurrent: false,
    gameVersion: 1, // retail
    expansion: Expansion.Dragonflight,
  },
  {
    name: '10.0.7',
    timestamp: 1679436000000, // GMT: Tuesday, 21 March 2023 22:00:00
    urlPrefix: '',
    isCurrent: true,
    gameVersion: 1, // retail
    expansion: Expansion.Dragonflight,
  },
];

export default PATCHES;
