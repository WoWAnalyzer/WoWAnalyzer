import CoreCombatLogParser from 'parser/core/CombatLogParser';

import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/checklist/Module';
import SpellUsable from '../shared/SpellUsable';

//Normalizers
import ShurikenStormNormalizer from './normalizers/ShurikenStormNormalizer';

import ComboPointDetails from '../shared/resources/ComboPointDetails';
import ComboPointTracker from '../shared/resources/ComboPointTracker';
import EnergyDetails from '../shared/resources/EnergyDetails';
import EnergyTracker from '../shared/resources/EnergyTracker';
import StealthDamageTracker from '../shared/casttracker/StealthDamageTracker';
import EnergyCapTracker from '../shared/resources/EnergyCapTracker';
import SpellEnergyCost from '../shared/resources/SpellEnergyCost';

import CastsInShadowDance from './modules/core/CastsInShadowDance';
import CastsInStealth from './modules/core/CastsInStealth';
import ShadowBladesUptime from './modules/features/ShadowBladesUptime';
import SymbolsOfDeathUptime from './modules/features/SymbolsOfDeathUptime';
import DeepeningShadows from './modules/core/DeepeningShadows';
import ComboPoints from './modules/core/ComboPoints';
import Energy from './modules/core/Energy';
import SymbolsDamageTracker from './modules/core/SymbolsDamageTracker';
import DanceDamageTracker from './modules/core/DanceDamageTracker';
import DarkShadowContribution from './modules/talents/DarkShadow/DarkShadowContribution';
import FindWeakness from './modules/spells/FindWeakness';

import SerratedBoneSpike from '../shared/shadowlands/covenants/necrolord/SerratedBoneSpike';
import EchoingReprimand from '../shared/shadowlands/covenants/kyrian/EchoingReprimand';
import Sepsis from '../shared/shadowlands/covenants/nightfae/Sepsis';
import Flagellation from '../shared/shadowlands/covenants/venthyr/Flagellation';

import AkaarisSoulFragment from './modules/spells/shadowlands/legendaries/AkaarisSoulFragment';
import TheRotten from './modules/spells/shadowlands/legendaries/TheRotten';
import DeeperDaggers from '../shared/shadowlands/conduits/DeeperDaggers';
import EssenceOfBloodfang from '../shared/shadowlands/legendaries/EssenceOfBloodfang';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Core
    abilities: Abilities,
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,
    spellUsable: SpellUsable,

    //Normalizers
    shurikenStormNormalizer: ShurikenStormNormalizer,

    //Resource
    comboPointTracker: ComboPointTracker,
    comboPointDetails: ComboPointDetails,
    comboPoints: ComboPoints,
    energyTracker: EnergyTracker,
    energyCapTracker: EnergyCapTracker,
    energyDetails: EnergyDetails,
    energy: Energy,
    spellEnergyCost: SpellEnergyCost,

    //Trackers
    symbolsDamageTracker: SymbolsDamageTracker,
    danceDamageTracker: DanceDamageTracker,
    stealthDamageTracker: StealthDamageTracker,

    //Core
    danceCooldownReduction: DeepeningShadows,
    findWeakness: FindWeakness,

    //Casts
    symbolsOfDeathUptime: SymbolsOfDeathUptime,
    shadowBladesUptime: ShadowBladesUptime,
    castsInShadowDance: CastsInShadowDance,
    castsInStealth: CastsInStealth,

    //Talents
    darkShadowContribution: DarkShadowContribution,

    // Covenants
    serratedBoneSpike: SerratedBoneSpike,
    echoingReprimand: EchoingReprimand,
    flagellation: Flagellation,
    sepsis: Sepsis,

    // Legendaries
    akaarisSoulFragment: AkaarisSoulFragment,
    theRotten: TheRotten,
    essenceOfBloodfang: EssenceOfBloodfang,
    
    // Conduits
    deeperDaggers: DeeperDaggers,

    // Racials
    arcaneTorrent: [ArcaneTorrent, { gcd: 1000 }] as const,
  };
}

export default CombatLogParser;
