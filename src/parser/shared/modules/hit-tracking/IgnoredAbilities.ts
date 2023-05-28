/**
 * This list is used to skip abilities for the purposes of *hit
 * counting*. These abilities produce many hits but generally aren't
 * worth mitigating, skewing the results of tracking.
 */

const IGNORED: number[] = [
  // Sepulcher of the First Ones
  368530, // Halondrus, Eternity Overdrive DoT
  361312, // Halondrus, Lightshatter Beam DoT
  368146, // Halondrus, Eternity Engine DoT
  360288, // Lords of Dread, Anguishing Strike DoT
  360302, // Lords of Dread, Swarm of Decay
  360303, // Lords of Dread, Swarm of Darkness
  // Raszageth
  381250, // Electric Scales
  395907, // Electrified Jaws (DoT)
  391282, // Crackling Energy
  395930, // Storm's Spite
];

export default IGNORED;
