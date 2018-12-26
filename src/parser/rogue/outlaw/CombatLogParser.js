import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import SpellUsable from '../shared/SpellUsable';

import ComboPointDetails from '../shared/resources/ComboPointDetails';
import ComboPointTracker from '../shared/resources/ComboPointTracker';
import ComboPoints from './modules/core/ComboPoints';
import EnergyDetails from '../shared/resources/EnergyDetails';
import EnergyTracker from '../shared/resources/EnergyTracker';
import EnergyCapTracker from '../shared/resources/EnergyCapTracker';
import Energy from './modules/core/Energy';
import SpellEnergyCost from '../shared/resources/SpellEnergyCost';

import Alacrity from './modules/talents/Alacrity';
import AlacrityTimesByStacks from './modules/talents/AlacrityTimesByStacks';
import BladeRush from './modules/talents/BladeRush';
import RestlessBlades from './modules/core/RestlessBlades';
import SliceAndDiceUptime from './modules/talents/SliceAndDiceUptime';
import QuickDraw from './modules/talents/QuickDraw';
import WeaponMaster from './modules/talents/WeaponMaster';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Feature
    damageDone: [DamageDone, { showStatistic: true }],
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    spellUsable: SpellUsable,

    //Resource
    comboPointTracker: ComboPointTracker,
    comboPointDetails: ComboPointDetails,
    comboPoints: ComboPoints,
    energyTracker: EnergyTracker,
    energyCapTracker: EnergyCapTracker,
    energyDetails: EnergyDetails,
    energy: Energy,
    spellEnergyCost: SpellEnergyCost,

    //Core
    restlessBlades: RestlessBlades,
    //Items

    //Casts

    //Talents
    alacrity: Alacrity,
    alacrityTimesByStacks: AlacrityTimesByStacks,
    bladeRush: BladeRush,
    sliceAndDiceUptime: SliceAndDiceUptime,
    quickDraw: QuickDraw,
    weaponMaster: WeaponMaster,

    // Outlaw's throughput benefit isn't as big as for other classes since we don't have a lot of free gcds to use
    arcaneTorrent: [ArcaneTorrent, {
      gcd: 1000,
      castEfficiency: 0.5,
      extraSuggestion: 'You should be using Arcane Torrent whenever you have a free GCD for it.',
    }],
  };
}

export default CombatLogParser;
