import { GrimoireOfSacrificeNormalizer, GrimoireOfSacrifice } from 'analysis/retail/warlock/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Guide from './Guide';
import SpellUsable from './modules/core/SpellUsable';
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Backdraft from './modules/talents/Backdraft';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Havoc from './modules/talents/Havoc';
import ImmolateUptime from './modules/guide/ImmolateUptime';
import RainOfFire from './modules/features/RainOfFire';
import SoulShardDetails from '../shared/resources/SoulShardDetails';
import SoulShardTracker from '../shared/resources/SoulShardTracker';
import SoulShardGraph from '../shared/resources/SoulShardGraph';
import Cataclysm from './modules/talents/Cataclysm';
import ChannelDemonfire from './modules/talents/ChannelDemonfire';
import FireAndBrimstone from './modules/talents/FireAndBrimstone';
import Flashover from './modules/talents/Flashover';
import InternalCombustion from './modules/talents/InternalCombustion';
import ReverseEntropy from './modules/talents/ReverseEntropy';
import Shadowburn from './modules/talents/Shadowburn';
import SoulFire from './modules/talents/SoulFire';
import FlashPoint from './modules/talents/FlashPoint';
import { UnendingResolve, DarkPact, DemonicCircle, DemonicHealthstone } from '../shared';
import Immolate from './modules/features/Immolate';
import HavocAnalyzer from './modules/features/HavocAnalyzer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    havocAnalyzer: HavocAnalyzer,

    // DoTs
    immolate: Immolate,
    immolateUptime: ImmolateUptime,

    // Core
    havoc: Havoc,
    backdraft: Backdraft,
    rainOfFire: RainOfFire,
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    soulShardGraph: SoulShardGraph,
    spellUsable: SpellUsable,

    grimoireOfSacrificeNormalizer: GrimoireOfSacrificeNormalizer,

    // Talents
    flashover: Flashover,
    soulFire: SoulFire,
    reverseEntropy: ReverseEntropy,
    internalCombustion: InternalCombustion,
    shadowburn: Shadowburn,
    fireAndBrimstone: FireAndBrimstone,
    cataclysm: Cataclysm,
    grimoireOfSacrifice: GrimoireOfSacrifice,
    channelDemonfire: ChannelDemonfire,
    flashPoint: FlashPoint,

    // Shared Spells
    unendingResolve: UnendingResolve,
    darkPact: DarkPact,
    demonicCircle: DemonicCircle,
    demonicHealthstone: DemonicHealthstone,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
  static guide = Guide;
}

export default CombatLogParser;
