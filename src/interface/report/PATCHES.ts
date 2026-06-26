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
    name: '12.0.7',
    timestamp: 1781647200000, // GMT: Tue Jun 16 2026 22:00:00 GMT+0000
    urlPrefix: '',
    isCurrent: true,
    gameVersion: 1, // retail
    expansion: Expansion.TheWarWithin,
  },
  {
    name: '5.5.0',
    timestamp: 0,
    urlPrefix: '',
    isCurrent: true,
    gameVersion: 6,
    expansion: Expansion.MistsOfPandaria,
  },
];

export default PATCHES;
