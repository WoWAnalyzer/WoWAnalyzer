import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Darkglare from './modules/features/Darkglare';

import AgonyUptime from './modules/features/DotUptimes/AgonyUptime';
import CorruptionUptime from './modules/features/DotUptimes/CorruptionUptime';
import UnstableAfflictionUptime from './modules/features/DotUptimes/UnstableAfflictionUptime';
import DotUptimes from './modules/features/DotUptimes';

import SoulShardTracker from './modules/soulshards/SoulShardTracker';
import SoulShardDetails from './modules/soulshards/SoulShardDetails';
import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';

import Talents from './modules/talents';
import AbsoluteCorruption from './modules/talents/AbsoluteCorruption';
import SiphonLifeUptime from './modules/talents/SiphonLifeUptime';
import SoulConduit from './modules/talents/SoulConduit';
import Deathbolt from './modules/talents/Deathbolt';
import VileTaint from './modules/talents/VileTaint';
import ShadowEmbrace from './modules/talents/ShadowEmbrace';
import Haunt from './modules/talents/Haunt';
import DrainSoul from './modules/talents/DrainSoul';
import GrimoireOfSacrifice from './modules/talents/GrimoireOfSacrifice';
import DrainSoulSniping from './modules/talents/DrainSoulSniping';
import Nightfall from './modules/talents/Nightfall';
import PhantomSingularity from './modules/talents/PhantomSingularity';

import Checklist from './modules/features/Checklist/Module';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    checklist: Checklist,
    darkglare: Darkglare,

    // DoTs
    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    unstableAfflictionUptime: UnstableAfflictionUptime,
    dotUptimes: DotUptimes,

    // Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // Talents
    talents: Talents,
    nightfall: Nightfall,
    drainSoul: DrainSoul,
    drainSoulSniping: DrainSoulSniping,
    deathbolt: Deathbolt,
    absoluteCorruption: AbsoluteCorruption,
    siphonLifeUptime: SiphonLifeUptime,
    vileTaint: VileTaint,
    phantomSingularity: PhantomSingularity,
    soulConduit: SoulConduit,
    shadowEmbrace: ShadowEmbrace,
    haunt: Haunt,
    grimoireOfSacrifice: GrimoireOfSacrifice,
    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }],
  };
}

export default CombatLogParser;
