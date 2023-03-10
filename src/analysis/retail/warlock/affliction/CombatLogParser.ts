import {
  GrimoireOfSacrificeNormalizer,
  WarlockMissingDotApplyDebuffPrePull,
  GrimoireOfSacrifice,
  DemonicCirclesCreated,
} from 'analysis/retail/warlock/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';

import Checklist from './modules/checklist/Module';
import GlobalCooldown from './modules/core/GlobalCooldown';
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Darkglare from './modules/features/Darkglare';
import DotUptimes from './modules/features/DotUptimes';
import SoulShardDetails from './modules/resources/SoulShardDetails';
import SoulShardTracker from './modules/resources/SoulShardTracker';
import AbsoluteCorruption from './modules/spells/AbsoluteCorruption';
import AgonyUptime from './modules/spells/Agony';
import CorruptionUptime from './modules/spells/Corruption';
import DrainSoul from './modules/spells/DrainSoul';
import DreadTouch from './modules/spells/DreadTouch';
import Haunt from './modules/spells/Haunt';
import MaleficAffliction from './modules/spells/MaleficAffliction';
import Nightfall from './modules/spells/Nightfall';
import PandemicInvocation from './modules/spells/PandemicInvocation';
import PhantomSingularity from './modules/spells/PhantomSingularity';
import ShadowEmbrace from './modules/spells/ShadowEmbrace';
import SiphonLifeUptime from './modules/spells/SiphonLife';
import SoulConduit from './modules/spells/SoulConduit';
import UnstableAfflictionUptime from './modules/spells/UnstableAffliction';
import VileTaint from './modules/spells/VileTaint';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    channeling: Channeling,
    grimoireOfSacrificeNormalizer: GrimoireOfSacrificeNormalizer,
    warlockMissingDotApplyDebuffPrePull: WarlockMissingDotApplyDebuffPrePull,

    // Core
    globalCooldown: GlobalCooldown,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    darkglare: Darkglare,
    shadowEmbrace: ShadowEmbrace,
    demonicCirclesCreated: DemonicCirclesCreated,

    // DoTs
    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    unstableAfflictionUptime: UnstableAfflictionUptime,
    dotUptimes: DotUptimes,

    // Resources
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,

    // Talents
    absoluteCorruption: AbsoluteCorruption,
    drainSoul: DrainSoul,
    dreadTouch: DreadTouch,
    grimoireOfSacrifice: GrimoireOfSacrifice,
    haunt: Haunt,
    maleficAffliction: MaleficAffliction,
    nightfall: Nightfall,
    pandemicInvocation: PandemicInvocation,
    phantomSingularity: PhantomSingularity,
    siphonLifeUptime: SiphonLifeUptime,
    soulConduit: SoulConduit,
    vileTaint: VileTaint,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
