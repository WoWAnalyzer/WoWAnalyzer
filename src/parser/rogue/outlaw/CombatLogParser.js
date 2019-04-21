import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
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

import RollTheBonesBuffs from './modules/spells/RollTheBonesBuffs';
import RollTheBonesCastTracker from './modules/features/RollTheBonesCastTracker';
import RollTheBonesCounter from './modules/spells/RollTheBonesCounter';
import RestlessBlades from './modules/features/RestlessBlades';
import SliceAndDiceUptime from './modules/talents/SliceAndDiceUptime';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Feature
    abilities: Abilities,
    buffs: Buffs,
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
    rolltheBonesCastTracker: RollTheBonesCastTracker,    
    
    //Items

    //Casts
    rolltheBonesBuffs: RollTheBonesBuffs,
    rollTheBonesCounter: RollTheBonesCounter,

    //Talents
    sliceAndDiceUptime: SliceAndDiceUptime,

    // Outlaw's throughput benefit isn't as big as for other classes since we don't have a lot of free gcds to use
    arcaneTorrent: [ArcaneTorrent, {
      gcd: 1000,
      castEfficiency: 0.5,
      extraSuggestion: 'You should be using Arcane Torrent whenever you have a free GCD for it.',
    }],
  };
}

export default CombatLogParser;
