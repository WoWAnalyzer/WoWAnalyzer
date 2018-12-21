import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import GrimoireOfSacrificeNormalizer from '../shared/modules/talents/normalizers/GrimoireOfSacrificeNormalizer';

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
import Nightfall from './modules/talents/Nightfall';
import DrainSoul from './modules/talents/DrainSoul';
import Deathbolt from './modules/talents/Deathbolt';
import AbsoluteCorruption from './modules/talents/AbsoluteCorruption';
import SiphonLifeUptime from './modules/talents/SiphonLifeUptime';
import PhantomSingularity from './modules/talents/PhantomSingularity';
import VileTaint from './modules/talents/VileTaint';
import ShadowEmbrace from './modules/talents/ShadowEmbrace';
import Haunt from './modules/talents/Haunt';
import GrimoireOfSacrifice from '../shared/modules/talents/GrimoireOfSacrifice';
import SoulConduit from './modules/talents/SoulConduit';

import Checklist from './modules/features/Checklist/Module';

import CascadingCalamity from './modules/azerite/CascadingCalamity';
import WrackingBrilliance from './modules/azerite/WrackingBrilliance';
import DreadfulCalling from './modules/azerite/DreadfulCalling';
import InevitableDemise from './modules/azerite/InevitableDemise';
import SuddenOnset from './modules/azerite/SuddenOnset';
import PandemicInvocation from './modules/azerite/PandemicInvocation';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    checklist: Checklist,
    darkglare: Darkglare,

    // Normalizers
    grimoireOfSacrificeNormalizer: GrimoireOfSacrificeNormalizer,

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
    deathbolt: Deathbolt,
    absoluteCorruption: AbsoluteCorruption,
    siphonLifeUptime: SiphonLifeUptime,
    phantomSingularity: PhantomSingularity,
    vileTaint: VileTaint,
    shadowEmbrace: ShadowEmbrace,
    haunt: Haunt,
    grimoireOfSacrifice: GrimoireOfSacrifice,
    soulConduit: SoulConduit,

    // Azerite Traits
    cascadingCalamity: CascadingCalamity,
    wrackingBrilliance: WrackingBrilliance,
    dreadfulCalling: DreadfulCalling,
    inevitableDemise: InevitableDemise,
    suddenOnset: SuddenOnset,
    pandemicInvocation: PandemicInvocation,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }],
  };
}

export default CombatLogParser;
