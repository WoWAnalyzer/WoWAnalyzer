import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

import ComboPointDetails from '../Common/Resources/ComboPointDetails';
import ComboPointTracker from '../Common/Resources/ComboPointTracker';
import ComboPoints from './Modules/RogueCore/ComboPoints';
import EnergyDetails from '../Common/Resources/EnergyDetails';
import EnergyTracker from '../Common/Resources/EnergyTracker';
import Energy from './Modules/RogueCore/Energy';

import RestlessBlades from './Modules/RogueCore/RestlessBlades';
import SliceAndDiceUptime from './Modules/Spells/SliceAndDiceUptime';

import MantleOfTheMasterAssassin from '../Common/Legendaries/MantleOfTheMasterAssassin';
import SoulOfTheShadowblade from '../Common/Legendaries/SoulOfTheShadowblade';
import InsigniaOfRavenholdt from '../Common/Legendaries/InsigniaOfRavenholdt';

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
    energyDetails: EnergyDetails,
    energy: Energy,

    //Core
    sliceAndDiceUptime: SliceAndDiceUptime,
    restlessBlades: RestlessBlades,
    //Items

    //Legendaries
    mantleOfTheMasterAssassin: MantleOfTheMasterAssassin,
    soulOfTheShadowblade: SoulOfTheShadowblade,
    insigniaOfRavenholdt: InsigniaOfRavenholdt,

    //Casts
    
    //Talents
  };
}

export default CombatLogParser;
