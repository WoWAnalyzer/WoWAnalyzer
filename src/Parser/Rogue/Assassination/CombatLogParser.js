import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

import ComboPointDetails from '../Common/Resources/ComboPointDetails';
import ComboPointTracker from '../Common/Resources/ComboPointTracker';
import ComboPoints from './Modules/RogueCore/ComboPoints';
import EnergyDetails from '../Common/Resources/EnergyDetails';
import EnergyTracker from '../Common/Resources/EnergyTracker';
import EnergyCapTracker from '../Common/Resources/EnergyCapTracker';
import Energy from './Modules/RogueCore/Energy';
import EnemyHpTracker from '../Common/EnemyHpTracker';

//Spells
import EnvenomUptime from './Modules/Spells/EnvenomUptime';
import GarroteUptime from './Modules/Spells/GarroteUptime';
import RuptureUptime from './Modules/Spells/RuptureUptime';

//Items
import T21_2P from './Modules/Items/T21_2P';

//Legendaries
import MantleOfTheMasterAssassin from '../Common/Legendaries/MantleOfTheMasterAssassin';
import SoulOfTheShadowblade from '../Common/Legendaries/SoulOfTheShadowblade';
import InsigniaOfRavenholdt from '../Common/Legendaries/InsigniaOfRavenholdt';
import DreadlordsDeceit from '../Common/Legendaries/DreadlordsDeceit';
import DuskwalkersFootpads from './Modules/Legendaries/DuskwalkersFootpads';
import ZoldyckFamilyTrainingShackles from './Modules/Legendaries/ZoldyckFamilyTrainingShackles';

//Talents
import Blindside from './Modules/Talents/Blindside';
import ElaboratePlanning from './Modules/Talents/ElaboratePlanning';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Trackers
    enemyHpTracker: EnemyHpTracker,

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

    //Core
    envenomUptime: EnvenomUptime,
    garroteUptime: GarroteUptime,
    ruptureUptime: RuptureUptime,

    //Items
    t21Assassin2P: T21_2P,

    //Legendaries
    mantleOfTheMasterAssassin: MantleOfTheMasterAssassin,
    soulOfTheShadowblade: SoulOfTheShadowblade,
    insigniaOfRavenholdt: InsigniaOfRavenholdt,
    dreadlordsDeceit: DreadlordsDeceit,
    duskwalkersFootpads: DuskwalkersFootpads,
    zoldyckFamilyTrainingShackles: ZoldyckFamilyTrainingShackles,

    //Casts

    //Talents
    blindside: Blindside,
    elaboratePlanning: ElaboratePlanning,
  };
}

export default CombatLogParser;
