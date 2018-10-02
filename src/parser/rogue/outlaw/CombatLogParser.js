import CoreCombatLogParser from 'parser/core/CombatLogParser';

import DamageDone from 'parser/core/modules/DamageDone';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';

import ComboPointDetails from '../shared/resources/ComboPointDetails';
import ComboPointTracker from '../shared/resources/ComboPointTracker';
import ComboPoints from './modules/core/ComboPoints';
import EnergyDetails from '../shared/resources/EnergyDetails';
import EnergyTracker from '../shared/resources/EnergyTracker';
import EnergyCapTracker from '../shared/resources/EnergyCapTracker';
import Energy from './modules/core/Energy';
import SpellEnergyCost from '../shared/resources/SpellEnergyCost';

import RestlessBlades from './modules/core/RestlessBlades';
import SliceAndDiceUptime from './modules/spells/SliceAndDiceUptime';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Feature
    damageDone: [DamageDone, { showStatistic: true }],
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,

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
    sliceAndDiceUptime: SliceAndDiceUptime,
    restlessBlades: RestlessBlades,
    //Items

    //Casts
    
    //Talents
  };
}

export default CombatLogParser;
