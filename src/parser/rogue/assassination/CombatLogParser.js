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
import EnemyHpTracker from '../shared/EnemyHpTracker';
import SpellEnergyCost from '../shared/resources/SpellEnergyCost';

//Spells
import EnvenomUptime from './modules/spells/EnvenomUptime';
import GarroteUptime from './modules/spells/GarroteUptime';
import RuptureUptime from './modules/spells/RuptureUptime';

//Items
import T21_2P from './modules/items/T21_2P';

//Legendaries
import MantleOfTheMasterAssassin from '../shared/legendaries/MantleOfTheMasterAssassin';
import SoulOfTheShadowblade from '../shared/legendaries/SoulOfTheShadowblade';
import InsigniaOfRavenholdt from '../shared/legendaries/InsigniaOfRavenholdt';
import DreadlordsDeceit from '../shared/legendaries/DreadlordsDeceit';
import DuskwalkersFootpads from './modules/legendaries/DuskwalkersFootpads';
import ZoldyckFamilyTrainingShackles from './modules/legendaries/ZoldyckFamilyTrainingShackles';

//Talents
import Blindside from './modules/talents/Blindside';
import ElaboratePlanning from './modules/talents/ElaboratePlanning';

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
    spellEnergyCost: SpellEnergyCost,

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
