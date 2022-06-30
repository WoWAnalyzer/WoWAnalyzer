/**
 * This list is used to skip abilities for the purposes of *hit
 * counting*. These abilities produce many hits but generally aren't
 * worth mitigating, skewing the results of tracking.
 */

const IGNORED: number[] = [
  360288, // Lords of Dread, Anguishing Strike DoT
  360302, // Lords of Dread, Swarm of Decay
  360303, // Lords of Dread, Swarm of Darkness
];

export default IGNORED;
