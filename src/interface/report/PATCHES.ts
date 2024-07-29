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
    name: '10.2.6 Season 4',
    timestamp: 1713906000000, // GMT: Tuesday, 23 April 2024 21:00:00
    urlPrefix: '',
    isCurrent: false,
    gameVersion: 1, // retail
    expansion: Expansion.Dragonflight,
  },
  {
    name: '10.2.7',
    timestamp: 1715115600000, // GMT: Tuesday, 6 May 2024 21:00:00
    urlPrefix: '',
    isCurrent: false,
    gameVersion: 1, // retail
    expansion: Expansion.Dragonflight,
  },
  {
    name: '4.4.0',
    timestamp: 1716242400, // GMT: Sunday, 20 May 2024 22:00:00
    urlPrefix: '',
    isCurrent: true,
    gameVersion: 5, // Cataclysm
    expansion: Expansion.Cataclysm,
  },
  {
    name: '11.0.0',
    // TODO: Update this for actual 11.0.0 launch
    timestamp: 1715119200000, // GMT: Tuesday, 7 May 2024 22:00:00
    urlPrefix: '',
    isCurrent: true,
    gameVersion: 1, // retail
    expansion: Expansion.TheWarWithin,
  },
];

export default PATCHES;
