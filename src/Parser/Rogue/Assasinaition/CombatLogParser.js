import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Features/Abilities';


import MantleOfTheMasterAssassin from '../Common/Legendaries/MantleOfTheMasterAssassin';
import SoulOfTheShadowblade from '../Common/Legendaries/SoulOfTheShadowblade';
import InsigniaOfRavenholdt from '../Common/Legendaries/InsigniaOfRavenholdt';
import DreadlordsDeceit from '../Common/Legendaries/DreadlordsDeceit';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Feature
    damageDone: [DamageDone, { showStatistic: true }],

    //Resource
    // comboPointTracker: ComboPointTracker,
    // comboPointDetails: ComboPointDetails,
    // energyTracker: EnergyTracker,
    // energyDetails: EnergyDetails,

    //Trackers
    // symbolsDamageTracker: SymbolsDamageTracker,
    // danceDamageTracker: DanceDamageTracker,
    // mantleDamageTracker: MantleDamageTracker,

    //Core

    //Items

    //Legendaries
    mantleOfTheMasterAssassin: MantleOfTheMasterAssassin,
    soulOfTheShadowblade: SoulOfTheShadowblade,
    insigniaOfRavenholdt: InsigniaOfRavenholdt,
    dreadlordsDeceit: DreadlordsDeceit,

    //Casts
    
    //Talents
  };
}

export default CombatLogParser;
