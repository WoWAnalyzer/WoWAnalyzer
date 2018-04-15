import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

import ShadowBladesUptime from "./Modules/Features/ShadowBladesUptime";
import SymbolsOfDeathUptime from "./Modules/Features/SymbolsOfDeathUptime";
import ComboPointDetails from '../Common/Resources/ComboPointDetails';
import ComboPointTracker from '../Common/Resources/ComboPointTracker';
import ComboPoints from './Modules/RogueCore/ComboPoints';
import EnergyDetails from '../Common/Resources/EnergyDetails';
import EnergyTracker from '../Common/Resources/EnergyTracker';
import Energy from './Modules/RogueCore/Energy';
import SymbolsDamageTracker from './Modules/RogueCore/SymbolsDamageTracker';
import DanceDamageTracker from './Modules/RogueCore/DanceDamageTracker';
import DarkShadowNightblade from './Modules/Talents/DarkShadow/DarkShadowNightblade';
import DarkShadowContribution from "./Modules/Talents/DarkShadow/DarkShadowContribution";
import DarkShadowEvis from "./Modules/Talents/DarkShadow/DarkShadowEvis";
import DeathFromAbove from "./Modules/Talents/DFA/DeathFromAbove";
import NightbladeDuringSymbols from './Modules/BaseRotation/NightbladeDuringSymbols';
import CastsInShadowDance from './Modules/BaseRotation/CastsInShadowDance';
import DanceCooldownReduction from './Modules/RogueCore/DanceCooldownReduction';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Feature
    damageDone: [DamageDone, { showStatistic: true }],
    shadowBladesUptime : ShadowBladesUptime,
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    symbolsOfDeathUptime:  SymbolsOfDeathUptime,

    //Resource
    comboPointTracker: ComboPointTracker,
    comboPointDetails: ComboPointDetails,
    comboPoints: ComboPoints,
    energyTracker: EnergyTracker,
    energyDetails: EnergyDetails,
    energy: Energy,

    //Trackers
    symbolsDamageTracker: SymbolsDamageTracker,
    danceDamageTracker: DanceDamageTracker,

    //Core
    danceCooldownReduction: DanceCooldownReduction,

    //Casts
    nightbladeDuringSymbols: NightbladeDuringSymbols,
    castsInShadowDance: CastsInShadowDance,
    DeathFromAbove: DeathFromAbove,

    //Talents
    darkShadowContribution: DarkShadowContribution,
    darkShadowEvis: DarkShadowEvis,
    darkShadowNightblade: DarkShadowNightblade,
  };
}

export default CombatLogParser;
