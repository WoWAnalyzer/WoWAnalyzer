import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import SpellUsable from './modules/core/SpellUsable';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import ImmolateUptime from './modules/features/ImmolateUptime';
import Havoc from './modules/features/Havoc';
import RainOfFire from './modules/features/RainOfFire';
import Checklist from './modules/features/Checklist/Module';
import Backdraft from './modules/features/Backdraft';

import SoulShardTracker from './modules/soulshards/SoulShardTracker';
import SoulShardDetails from './modules/soulshards/SoulShardDetails';

import GrimoireOfSacrificeNormalizer from '../shared/modules/talents/normalizers/GrimoireOfSacrificeNormalizer';

import Flashover from './modules/talents/Flashover';
import Eradication from './modules/talents/Eradication';
import SoulFire from './modules/talents/SoulFire';
import ReverseEntropy from './modules/talents/ReverseEntropy';
import InternalCombustion from './modules/talents/InternalCombustion';
import Shadowburn from './modules/talents/Shadowburn';
import Inferno from './modules/talents/Inferno';
import FireAndBrimstone from './modules/talents/FireAndBrimstone';
import Cataclysm from './modules/talents/Cataclysm';
import RoaringBlaze from './modules/talents/RoaringBlaze';
import GrimoireOfSupremacy from './modules/talents/GrimoireOfSupremacy';
import GrimoireOfSacrifice from '../shared/modules/talents/GrimoireOfSacrifice';
import SoulConduit from './modules/talents/SoulConduit';
import ChannelDemonfire from './modules/talents/ChannelDemonfire';
import Talents from './modules/talents';

import RollingHavoc from './modules/azerite/RollingHavoc';
import BurstingFlare from './modules/azerite/BurstingFlare';
import Flashpoint from './modules/azerite/Flashpoint';
import CrashingChaosChaoticInfernoCore from './modules/azerite/CrashingChaosChaoticInfernoCore';
import CrashingChaos from './modules/azerite/CrashingChaos';
import ChaoticInferno from './modules/azerite/ChaoticInferno';
import ChaosShards from './modules/azerite/ChaosShards';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],

    // DoTs
    immolateUptime: ImmolateUptime,

    // Core
    havoc: Havoc,
    backdraft: Backdraft,
    rainOfFire: RainOfFire,
    checklist: Checklist,
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    spellUsable: SpellUsable,

    grimoireOfSacrificeNormalizer: GrimoireOfSacrificeNormalizer,

    // Talents
    flashover: Flashover,
    eradication: Eradication,
    soulFire: SoulFire,
    reverseEntropy: ReverseEntropy,
    internalCombustion: InternalCombustion,
    shadowburn: Shadowburn,
    inferno: Inferno,
    fireAndBrimstone: FireAndBrimstone,
    cataclysm: Cataclysm,
    roaringBlaze: RoaringBlaze,
    grimoireOfSupremacy: GrimoireOfSupremacy,
    grimoireOfSacrifice: GrimoireOfSacrifice,
    soulConduit: SoulConduit,
    channelDemonfire: ChannelDemonfire,
    talents: Talents,

    // Azerite traits
    burstingFlare: BurstingFlare,
    flashpoint: Flashpoint,
    rollingHavoc: RollingHavoc,
    crashingChaosChaoticInfernoCore: CrashingChaosChaoticInfernoCore,
    crashingChaos: CrashingChaos,
    chaoticInferno: ChaoticInferno,
    chaosShards: ChaosShards,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }],
  };
}

export default CombatLogParser;
