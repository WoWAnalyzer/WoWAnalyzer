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
  // Kazzara
  401898, // Terror Claws DoT
  408370, // Infernal Heart (pulsing raid AoE)
  // Assault of the Zaq'ali
  405618, // Ignara's Fury (pulsing raid AoE)
  // Rashok
  404448, // Scorching Heatwave (pulsing raid AoE)
  // Magmorax
  408966, // Incinerating Maws DoT
  413546, // Igniting Roar DoT
  // Neltharion
  407048, // Surrender to Corruption (pulsing raid AoE)
  // Sarkareth
  401339, // Burning Claws DoT
  402053, // Seared DoT
  401801, // Disintigrated DoT
  401952, // Oblivion DoT
  411240, // Void Claws DoT
  408431, // Void Slash DoT
];

export default IGNORED;
