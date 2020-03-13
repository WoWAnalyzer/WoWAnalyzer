/**
 * This list is used to skip abilities for the purposes of *hit
 * counting*. These abilities produce many hits but generally aren't
 * worth mitigating, skewing the results of tracking.
 */

const SHARED = [
  // Ny'Alotha
  // Wrathion
  306015, // Searing Armor (DoT)
  311362, // Rising Heat (DoT)
  // Maut
  310455, // Shadow Wounds (DoT)
  306070, // Obsidian Skin
  308168, // Consuming Shadows (Raid Dmg)
  // Skitra
  309652, // Illusionary Bolt (Raid Dmg)
  312741, // Psychic Reverb (Raid Dmg)
  // Drest'agath
  310277, // Volatile Seed (DoT -- impact still counts)
  308947, // Throes of Agony (Raid Dmg)
  310499, // Void Miasma (DoT around Tentacles)
  // Xanesh
  305792, // Anguish (Raid Dmg)
  313228, // Void-Touched (DoT)
  // Vexiona
  313283, // Void Corruption (DoT)
  // Hivemind
  310403, // Devouring Frenzy (Raid Dmg)
  // Ra'den
  309854, // Ruin (Raid Dmg)
  // Il'gynoth
  311143, // Hemorrhage (Raid Dmg)
  // Carapace
  307061, // Mycelial Growth (Slow in P2)
  // N'zoth
  319346, // Infinity's Toll (Raid Dmg)
  315715, // Contempt (Raid Dmg in 2nd Psychus)
  // ETERNAL PALACE
  // Sivara
  302588, // Frost Mark
  294856, // Unstable Mixture
  300701, // Rimefrost
  300705, // Septic Taint
  302589, // Toxic Brand
  // Behemoth
  292138, // Radiant Biomass
  // Ashvane
  297333, // Briny Bubble -- can't ISB while stunned
  296688, // Rippling Wave
  296693, // Waterlogged
  296752, // Cutting Coral
  // Orgozoa
  295161, // Pervasive Shock
  // Za'qul
  295537, // Mind Tether
  292971, // Hysteria
  // Queen Azshara
  298782, // Arcane Orb
  301425, // Controlled Burst
  298756, // Serrated Edge
  299276, // Sanction
  298425, // Charged Spear
  // CRUCIBLE OF STORMS
  282743, // Cabal, Storm of Annihilation (Crown effect)
  295479, // Uu'nat, Touch of the End
  // BOD
  288806, // Mekkatorque, Gigavolt Blast
  286646, // Mekkatorque, Gigavolt Charge
  289648, // Mekkatorque (Spark Bot), Spark Shield -- RJW causes a bunch of events for this. not much you can do to avoid it
  288939, // Mekkatorque, Gigavolt Radiation
  284831, // Rastakhan, Scorching Detonation -- DoT
  285195, // Rastakhan, Deadly Withering
  285000, // Stormwall, Kelp-Wrapped
  287993, // Jaina, Chilling Touch
  287490, // Jaina, Frozen Solid
  // ULDIR
  266948, // Vectis, Plague Bomb (intermission soak)
];

export const BOF = SHARED.concat([
  // ULDIR
  265178, // Vectis, Evolving Affliction
  265143, // Vectis, Omega Vector (tank *shouldnt* get, but w/e)
  274358, // Zul, Rupturing Blood (dot interaction with bof is unknown; assuming that it won't change individual ticks for now)
  263334, // G'huun, Putrid Blood
  // ANTORUS
  // Kin'Garoth
  246779, // Empowered bombs (Kin'garoth)
]);

export const ISB = SHARED.concat([
]);
