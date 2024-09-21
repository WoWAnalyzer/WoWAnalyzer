import CoreCombatLogParser from 'parser/core/CombatLogParser';
import WindfuryLinkNormalizer from 'parser/shared/normalizers/WindfuryLinkNormalizer';
import RageGraph from '../shared/modules/core/RageGraph';
import RageTracker from '../shared/modules/core/RageTracker';
import RageCountDebugger from '../shared/modules/debuggers/RageCountDebugger';
import GenerateRageEventsNormalizer from '../shared/modules/normalizers/rage/GenerateRageEventsNormalizer';
import RageAttributeNormalizer from '../shared/modules/normalizers/rage/RageAttributeNormalizer';
import ResourceChangeNormalizer from '../shared/modules/normalizers/rage/ResourceChangeNormalizer';
import ChampionsMight from '../shared/modules/talents/ChampionsMight';
import ChampionsSpear from '../shared/modules/talents/ChampionsSpear';
import ImpendingVictory from '../shared/modules/talents/ImpendingVictory';
import SpellReflection from '../shared/modules/talents/SpellReflection';
import Abilities from './modules/Abilities';
import Enrage from './modules/buffdebuff/Enrage';
import Haste from './modules/core/Haste';
import RageDetails from './modules/core/RageDetails';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import SpellUsable from './modules/features/SpellUsable';
import Checklist from './modules/features/checklist/Module';
import ColdSteelHotBloodNormalizer from './modules/normalizers/ColdSteelHotBlood';
import EnrageBeforeBloodthirst from './modules/normalizers/EnrageBeforeBloodthirst';
import EnrageRefreshNormalizer from './modules/normalizers/EnrageRefresh';
import MissedRampage from './modules/spells/MissedRampage';
import Recklessness from './modules/spells/Recklessness';
import WhirlWind from './modules/spells/Whirlwind';
import AngerManagement from './modules/talents/AngerManagement';
import HackAndSlash from './modules/talents/HackAndSlash';
import SuddenDeath from './modules/talents/SuddenDeath';
import Warpaint from './modules/talents/Warpaint';
import Channeling from 'parser/shared/normalizers/Channeling';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    windfuryNormalizer: WindfuryLinkNormalizer,

    resourceChangeNormalizer: ResourceChangeNormalizer,
    generateRageEventsNormalizer: GenerateRageEventsNormalizer,
    rageAttributeNormalizer: RageAttributeNormalizer,
    coldSteelHotBloodNormalizer: ColdSteelHotBloodNormalizer,

    enrageRefreshNormalizer: EnrageRefreshNormalizer,
    enrageBeforeBloodthirst: EnrageBeforeBloodthirst,

    // Core
    channeling: Channeling,
    buffs: Buffs,
    haste: Haste,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    checklist: Checklist,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,

    rageTracker: RageTracker,
    rageGraph: RageGraph,
    rageDetails: RageDetails,
    whirlWind: WhirlWind,

    enrageUptime: Enrage,

    missedRampage: MissedRampage,
    recklessness: Recklessness,

    //talents
    angerManagement: AngerManagement,
    suddenDeath: SuddenDeath,
    warpaint: Warpaint,
    championsSpear: ChampionsSpear,
    spellReflection: SpellReflection,
    impendingVictory: ImpendingVictory,
    hackAndSlash: HackAndSlash,
    championsMight: ChampionsMight,

    // Debuggers
    rageCountDebugger: RageCountDebugger,
  };
}

export default CombatLogParser;
