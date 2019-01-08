/*
  Using https://www.epochconverter.com/ to find the epoch timestamp for dates
  Multiply the timestamp by 1000 as JS does timestamps in MS rather than S

  Timestamps are for the NA Region to match WCL
*/

const PATCHES = [
  {
    name: '8.0',
    timestamp: 1534197600000, // GMT: Monday, 13 August 2018 22:00:00
    urlPrefix: '80',
    isCurrent: false,
  },
  {
    name: '8.1',
    timestamp: 1544565600000, // GMT: Tuesday, 11 December 2018 22:00:00, PST: Tuesday, 11 December 2018 14:00:00
    urlPrefix: '',
    isCurrent: true,
  },
];

export default PATCHES;
