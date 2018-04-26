/**
 * This list is used to skip abilities for the purposes of *hit
 * counting*. These abilities produce many hits but generally aren't
 * worth mitigating, skewing the results of tracking.
 */

const SHARED = [
  // ANTORUS
  // Garothi Worldbreaker
  247159, // Luring Destruction, intermission pulse
  // Felhounds of Sargeras
  // Antoran High Command
  // Eonar (SKIP)
  // Portal Keeper
  // Imonar
  248424, // Gathering Power (Imonar bridge phase)
  // Kin'Garoth
  246646, // Flames of the Forge (Kin'garoth intermission pulsing aoe)
  // Varimathras
  // Coven of Shivarra
  258018, // Sense of Dread, pulsing aoe from inactive shivarra
  // Aggramar
  244912, // Blazing Eruption, the pulse of Embers on Aggramar
  254329, // Unleashed Flame, Embers on Aggramar
  245632, // Unchecked Flame, Flames on Aggramar (there are two that can't be stack, can't bof both)
  // Argus
  256396, // Reorigination pulse, aoe hit from orbs. generally don't get bof on these
];

export const BOF = SHARED.concat([
  // ANTORUS
  // Kin'Garoth
  246779, // Empowered bombs (Kin'garoth)
]);

export const ISB = SHARED.concat([
]);
