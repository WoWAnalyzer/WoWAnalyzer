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
    name: '4.4.0',
    timestamp: 1716242400000, // GMT: Monday, 20 May 2024 22:00:00
    urlPrefix: '',
    isCurrent: false,
    gameVersion: 5, // Cataclysm
    expansion: Expansion.Cataclysm,
  },
  {
    name: '11.2.0',
    timestamp: 1754431200000, // GMT: Tue Aug 05 2025 22:00:00
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
