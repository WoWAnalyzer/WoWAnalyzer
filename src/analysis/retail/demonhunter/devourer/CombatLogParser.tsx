import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import { Buffs } from 'analysis/retail/demonhunter/devourer/modules/Buffs';
import { AlwaysBeCasting } from 'analysis/retail/demonhunter/devourer/modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from 'analysis/retail/demonhunter/devourer/modules/features/CooldownThroughputTracker';
import { FuryTracker } from 'analysis/retail/demonhunter/devourer/modules/resourcetracker/FuryTracker';
import { FuryDetails } from 'analysis/retail/demonhunter/devourer/modules/resourcetracker/FuryDetails';
import { FuryGraph } from 'analysis/retail/demonhunter/devourer/modules/resourcetracker/FuryGraph';
import SoulFragmentsTracker from './modules/features/SoulFragmentsTracker';
import SoulFragmentBuffStackTracker from './modules/resourcetracker/SoulFragmentBuffStackTracker';
import SoulFragmentsGraph from './modules/resourcetracker/SoulFragmentsGraph';
import SoulsOvercap from './modules/statistics/SoulsOvercap';
import Abilities from './modules/Abilities';
import CollapsingStar from './modules/talents/CollapsingStar';
import Guide from './Guide';
import VoidMetamorphosisNormalizer from './normalizers/VoidMetamorphosisNormalizer';
import ViolentTransformation from './modules/talents/ViolentTransformation';
import MomentOfCraving from './modules/talents/MomentOfCraving';
import MassAcceleration from './modules/talents/MassAcceleration';
import BlurAnalyzer from './modules/majordefensives/BlurAnalyzer';
import VoidMetamorphosis from './modules/talents/VoidMetamorphosis';
import Voidstep from './modules/buffs/Voidstep';
import Reap from './modules/spells/Reap';
import Cull from './modules/spells/Cull';
import VoidRay from './modules/talents/VoidRay';
import VoidRayEventLinkNormalizer from './normalizers/VoidRayEventLinkNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    channeling: Channeling,
    buffs: Buffs,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,

    // Spells
    blurAnalyzer: BlurAnalyzer,
    reap: Reap,
    cull: Cull,

    // Talents
    collapsingStar: CollapsingStar,
    momentOfCraving: MomentOfCraving,
    massAcceleration: MassAcceleration,
    voidMetamorphosis: VoidMetamorphosis,
    voidRay: VoidRay,

    // Buffs
    voidstep: Voidstep,

    // Hero
    violentTransformation: ViolentTransformation,

    // Resources
    furyTracker: FuryTracker,
    furyDetails: FuryDetails,
    furyGraph: FuryGraph,
    soulFragmentsTracker: SoulFragmentsTracker,
    soulFragmentBuffStackTracker: SoulFragmentBuffStackTracker,
    soulFragmentsGraph: SoulFragmentsGraph,

    // Normalizers
    voidMetamorphosisNormalizer: VoidMetamorphosisNormalizer,
    voidRayEventLinkNormalizer: VoidRayEventLinkNormalizer,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
    soulsOvercap: SoulsOvercap,
  };

  static guide = Guide;
}

export default CombatLogParser;
