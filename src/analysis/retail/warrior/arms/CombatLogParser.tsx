import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';
import WindfuryLinkNormalizer from 'parser/shared/normalizers/WindfuryLinkNormalizer';
import RageGraph from '../shared/modules/core/RageGraph';
import RageTracker from '../shared/modules/core/RageTracker';
import RageCountDebugger from '../shared/modules/debuggers/RageCountDebugger';
import GenerateRageEventsNormalizer from '../shared/modules/normalizers/rage/GenerateRageEventsNormalizer';
import RageAttributeNormalizer from '../shared/modules/normalizers/rage/RageAttributeNormalizer';
import ResourceChangeNormalizer from '../shared/modules/normalizers/rage/ResourceChangeNormalizer';
import ChampionsSpear from '../shared/modules/talents/ChampionsSpear';
import Abilities from './modules/Abilities';
import AplCheck from './modules/core/AplCheck';
import Bladestorm from './modules/core/Bladestorm';
import DeepWoundsRefreshes from './modules/core/Dots/DeepWoundsRefreshes';
import DeepWoundsUptime from './modules/core/Dots/DeepWoundsUptime';
import DotUptime from './modules/core/Dots/DotUptime';
import RendRefreshes from './modules/core/Dots/RendRefreshes';
import RendUptime from './modules/core/Dots/RendUptime';
import ExecuteRange from './modules/core/Execute/ExecuteRange';
import MortalStrike from './modules/core/Execute/MortalStrike';
import Overpower from './modules/core/Overpower';
import Slam from './modules/core/Slam';
import SweepingStrikes from './modules/core/SweepingStrikes';
import TacticianProc from './modules/core/TacticianProc';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import RageDetails from './modules/features/RageDetails';
import SpellUsable from './modules/features/SpellUsable';
import AngerManagement from './modules/talents/AngerManagement';
import Avatar from './modules/talents/Avatar';
import Cleave from './modules/talents/Cleave';
import DefensiveStance from './modules/talents/DefensiveStance';
import FervorOfBattle from './modules/talents/FervorOfBattle';
import ImpendingVictory from '../shared/modules/talents/ImpendingVictory';
import SecondWind from './modules/talents/SecondWind';
import StormBolt from './modules/talents/StormBolt';
import SuddenDeath from './modules/talents/SuddenDeath';
import WarMachine from './modules/talents/WarMachine';
import BattlelordBuff from './normalizers/BattlelordBuff';
import ExecuteLinkNormalizer from './normalizers/ExecuteLinkNormalizer';
import ImprovedExecuteNormalizer from './normalizers/ImprovedExecuteNormalizer';
import OverpowerStacks from './normalizers/OverpowerStacks';
import SpellReflection from '../shared/modules/talents/SpellReflection';
import FatalMark from './modules/talents/FatalMark';
import UnhingedMortalStrikeNormalizer from './normalizers/UnhingedMortalStrikeNormalizer';
import Demolish from './modules/talents/Demolish';
import DemolishNormalizer from './normalizers/DemolishNormalizer';
import SuddenDeathBuffNormalizer from '../shared/modules/normalizers/SuddenDeathBuffNormalizer';
import Guide from './Guide';
import Executioner from '../shared/modules/talents/Executioner';
import ColossusSmash from './modules/talents/ColossusSmash';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    windfuryNormalizer: WindfuryLinkNormalizer,

    desourceChangeNormalizer: ResourceChangeNormalizer,
    generateRageEventsNormalizer: GenerateRageEventsNormalizer,
    rageAttributeNormalizer: RageAttributeNormalizer,

    overpowerStacks: OverpowerStacks,
    battlelordBuff: BattlelordBuff,
    executeLinkNormalizer: ExecuteLinkNormalizer,
    improvedExecuteNormalizer: ImprovedExecuteNormalizer,
    unhingedMortalStrikeNormalizer: UnhingedMortalStrikeNormalizer,
    demolishNormalizer: DemolishNormalizer,
    suddenDeathBuffNormalizer: SuddenDeathBuffNormalizer,

    // WarriorCore
    abilities: Abilities,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,
    channeling: Channeling,

    // Resource
    rageTracker: RageTracker,
    rageGraph: RageGraph,
    rageDetails: RageDetails,

    // Core
    tacticianProc: TacticianProc,
    overpower: Overpower,
    slam: Slam,
    sweepingStrikes: SweepingStrikes,
    bladestorm: Bladestorm,

    // Execute range
    executeRange: ExecuteRange,
    mortalStrike: MortalStrike,

    // Dots
    deepWoundsUptime: DeepWoundsUptime,
    rendUptime: RendUptime,
    dotUptimes: DotUptime,
    deepWoundsRefreshes: DeepWoundsRefreshes,
    rendRefreshes: RendRefreshes,

    // Talents
    angerManagement: AngerManagement,
    defensiveStance: DefensiveStance,
    suddenDeath: SuddenDeath,
    warMachine: WarMachine,
    stormBolt: StormBolt,
    impendingVictory: ImpendingVictory,
    fervorOfBattle: FervorOfBattle,
    secondWind: SecondWind,
    cleave: Cleave,
    colossusSmash: ColossusSmash,
    avatar: Avatar,
    spellReflection: SpellReflection,
    fatalMark: FatalMark,
    ChampionsSpear: ChampionsSpear,
    demolish: Demolish,
    executioner: Executioner,

    // Debuggers
    rageCountDebugger: RageCountDebugger,

    apl: AplCheck,
  };

  static guide = Guide;
}

export default CombatLogParser;
