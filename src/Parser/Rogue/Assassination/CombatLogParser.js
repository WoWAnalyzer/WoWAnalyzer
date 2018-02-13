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

import EnvenomUptime from './Modules/Spells/EnvenomUptime';
import GarroteUptime from './Modules/Spells/GarroteUptime';
import RuptureUptime from './Modules/Spells/RuptureUptime';

import MantleOfTheMasterAssassin from '../Common/Legendaries/MantleOfTheMasterAssassin';
import SoulOfTheShadowblade from '../Common/Legendaries/SoulOfTheShadowblade';
import InsigniaOfRavenholdt from '../Common/Legendaries/InsigniaOfRavenholdt';
import DreadlordsDeceit from '../Common/Legendaries/DreadlordsDeceit';
import DuskwalkersFootpads from './Modules/Legendaries/DuskwalkersFootpads';

//Traits
import MasterAssassin from './Modules/Traits/MasterAssassin';


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
    envenomUptime: EnvenomUptime,
    garroteUptime: GarroteUptime,
    ruptureUptime: RuptureUptime,

    //Items

    //Legendaries
    mantleOfTheMasterAssassin: MantleOfTheMasterAssassin,
    soulOfTheShadowblade: SoulOfTheShadowblade,
    insigniaOfRavenholdt: InsigniaOfRavenholdt,
    dreadlordsDeceit: DreadlordsDeceit,
    duskwalkersFootpads: DuskwalkersFootpads,

    //Casts

    //Talents

    //Traits
    masterAssassin: MasterAssassin,
  };
}

export default CombatLogParser;
