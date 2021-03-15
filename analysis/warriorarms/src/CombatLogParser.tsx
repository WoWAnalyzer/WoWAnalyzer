import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Checklist from './modules/checklist/Module';
import DotUptimes from './modules/core/Dots';
import DeepWoundsUptime from './modules/core/Dots/DeepWoundsUptime';
import RendUptime from './modules/core/Dots/RendUptime';
import EarlyDotRefresh from './modules/core/Execute/EarlyDotRefresh';
import ExecuteRange from './modules/core/Execute/ExecuteRange';
import MortalStrike from './modules/core/Execute/MortalStrike';
import Rend from './modules/core/Execute/Rend';
import Overpower from './modules/core/Overpower';
import Slam from './modules/core/Slam';
import SweepingStrikes from './modules/core/SweepingStrikes';
import TacticianProc from './modules/core/TacticianProc';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Channeling from './modules/features/Channeling';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import RageDetail from './modules/features/RageDetails';
import RageTracker from './modules/features/RageTracker';
import SpellUsable from './modules/features/SpellUsable';
import Talents from './modules/talents';
import AngerManagement from './modules/talents/AngerManagement';
import Avatar from './modules/talents/Avatar';
import Cleave from './modules/talents/Cleave';
import DefensiveStance from './modules/talents/DefensiveStance';
import FervorOfBattle from './modules/talents/FervorOfBattle';
import ImpendingVictory from './modules/talents/ImpendingVictory';
import Ravager from './modules/talents/Ravager';
import SecondWind from './modules/talents/SecondWind';
import Skullsplitter from './modules/talents/Skullsplitter';
import StormBolt from './modules/talents/StormBolt';
import SuddenDeath from './modules/talents/SuddenDeath';
import Warbreaker from './modules/talents/Warbreaker';
import WarMachine from './modules/talents/WarMachine';
import OverpowerStacks from './normalizers/OverpowerStacks';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    overpowerStacks: OverpowerStacks,

    // WarriorCore
    abilities: Abilities,

    // Features
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,
    channeling: Channeling,

    // Resource
    rageTracker: RageTracker,
    rageDetail: RageDetail,

    // Core
    tacticianProc: TacticianProc,
    overpower: Overpower,
    slam: Slam,
    sweepingStrikes: SweepingStrikes,

    // Execute range
    executeRange: ExecuteRange,
    rend: Rend,
    mortalStrike: MortalStrike,

    // Dots
    deepWoundsUptime: DeepWoundsUptime,
    rendUptime: RendUptime,
    dotUptimes: DotUptimes,
    earlyDotRefresh: EarlyDotRefresh,

    // Talents
    talents: Talents,
    angerManagement: AngerManagement,
    defensiveStance: DefensiveStance,
    skullsplitter: Skullsplitter,
    suddenDeath: SuddenDeath,
    warMachine: WarMachine,
    stormBolt: StormBolt,
    impendingVictory: ImpendingVictory,
    fervorOfBattle: FervorOfBattle,
    secondWind: SecondWind,
    cleave: Cleave,
    warbreaker: Warbreaker,
    avatar: Avatar,
    ravager: Ravager,
  };
}

export default CombatLogParser;
