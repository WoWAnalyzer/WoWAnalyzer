import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';
import WindfuryLinkNormalizer from 'parser/shared/normalizers/WindfuryLinkNormalizer';
import RageGraph from '../shared/modules/core/RageGraph';
import RageTracker from '../shared/modules/core/RageTracker';
import RageCountDebugger from '../shared/modules/debuggers/RageCountDebugger';
import GenerateRageEventsNormalizer from '../shared/modules/normalizers/rage/GenerateRageEventsNormalizer';
import RageAttributeNormalizer from '../shared/modules/normalizers/rage/RageAttributeNormalizer';
import ResourceChangeNormalizer from '../shared/modules/normalizers/rage/ResourceChangeNormalizer';
import ChampionsMight from '../shared/modules/talents/ChampionsMight';
import ChampionsSpear from '../shared/modules/talents/ChampionsSpear';
import Abilities from './modules/Abilities';
import Checklist from './modules/checklist/Module';
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
import Skullsplitter from './modules/talents/Skullsplitter';
import StormBolt from './modules/talents/StormBolt';
import SuddenDeath from './modules/talents/SuddenDeath';
import Warbreaker from './modules/talents/Warbreaker';
import WarMachine from './modules/talents/WarMachine';
import BattlelordBuff from './normalizers/BattlelordBuff';
import ExecuteLinkNormalizer from './normalizers/ExecuteLinkNormalizer';
import FinishingBlowsResourceChange from './normalizers/FinishingBlowsResourceChange';
import ImprovedExecuteNormalizer from './normalizers/ImprovedExecuteNormalizer';
import OverpowerStacks from './normalizers/OverpowerStacks';
import SpellReflection from '../shared/modules/talents/SpellReflection';
import FatalMark from './modules/talents/FatalMark';
import SkullsplitterDotNormalizer from './normalizers/SkullsplitterExpiredDots';
import BlademastersTormentNormalizer from './modules/talents/BlademastersTorment';
import UnhingedMortalStrikeNormalizer from './normalizers/UnhingedMortalStrikeNormalizer';
import Demolish from './modules/talents/Demolish';
import DemolishNormalizer from './normalizers/DemolishNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    windfuryNormalizer: WindfuryLinkNormalizer,

    finishingBlowsResourceChange: FinishingBlowsResourceChange,
    desourceChangeNormalizer: ResourceChangeNormalizer,
    generateRageEventsNormalizer: GenerateRageEventsNormalizer,
    rageAttributeNormalizer: RageAttributeNormalizer,

    overpowerStacks: OverpowerStacks,
    battlelordBuff: BattlelordBuff,
    executeLinkNormalizer: ExecuteLinkNormalizer,
    improvedExecuteNormalizer: ImprovedExecuteNormalizer,
    skullsplitterDotNormalizer: SkullsplitterDotNormalizer,
    blademaastersTormetNormalizer: BlademastersTormentNormalizer,
    unhingedMortalStrikeNormalizer: UnhingedMortalStrikeNormalizer,
    demolishNormalizer: DemolishNormalizer,

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
    spellReflection: SpellReflection,
    fatalMark: FatalMark,
    ChampionsSpear: ChampionsSpear,
    ChampionsMight: ChampionsMight,
    demolish: Demolish,

    // Debuggers
    rageCountDebugger: RageCountDebugger,

    apl: AplCheck,
  };
}

export default CombatLogParser;
