import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Haste from './modules/core/Haste';
import RageDetails from './modules/core/RageDetails';
import RageTracker from './modules/core/RageTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Avatar from './modules/spells/Avatar';
import BigHitGraph from './modules/features/BigHitGraph';
import BlockCheck from './modules/features/BlockCheck';
import Buffs from './modules/features/Buffs';
import Checklist from './modules/features/Checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import MitigationCheck from './modules/features/MitigationCheck';
import SpellUsable from './modules/features/SpellUsable';
import ImpenetrableWall from './modules/spells/ImpenetrableWall';
import Thunderlord from './modules/spells/Thunderlord';
import ViolentOutburstCastRatio from './modules/spells/ViolentOutburstCastRatio';
import ViolentOutburstTimeBetweenBuffs from './modules/spells/ViolentOutburstTimeBetweenBuffs';
import IgnorePainExpired from './modules/spells/IgnorePainExpired';
import IgnorePainOvercap from './modules/spells/IgnorePainOvercap';
import IgnorePainTracker from './modules/spells/IgnorePainTracker';
import ShieldBlock from './modules/spells/ShieldBlock';
import ShieldSlam from './modules/spells/ShieldSlam';
import SpellReflect from './modules/spells/SpellReflect';
import AngerManagement from './modules/spells/AngerManagement';
import BoomingVoice from './modules/spells/BoomingVoice';
import HeavyRepercussions from './modules/spells/HeavyRepercussions';
import IntoTheFray from './modules/spells/IntoTheFray';
import Punish from './modules/spells/Punish';
import BurstOfPower from './modules/talents/BurstOfPower';
import SpellReflection from '../shared/modules/talents/SpellReflection';
import ImpendingVictory from '../shared/modules/talents/ImpendingVictory';
import RavagerHitCheck from './modules/spells/RavagerHitCheck';
import RageGenerationNormalizer from './normalizers/RageGenerationNormalizer';
import WarWithin2PS1TierSet from './modules/items/WarWithin2PS1TierSet';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizer
    rageGenerationNormalizer: RageGenerationNormalizer,

    // Core
    haste: Haste,
    mitigationCheck: MitigationCheck,
    buffs: Buffs,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    shieldBlock: ShieldBlock,
    blockCheck: BlockCheck,
    spellUsable: SpellUsable,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    bigHitGraph: BigHitGraph,

    rageTracker: RageTracker,
    rageDetails: RageDetails,
    avatar: Avatar,
    shieldSlam: ShieldSlam,
    spellReflect: SpellReflect,
    ignorePainTracker: IgnorePainTracker,
    ignorePainExpired: IgnorePainExpired,
    ignorePainOvercap: IgnorePainOvercap,

    //Talents
    angerManagement: AngerManagement,
    boomingVoice: BoomingVoice,
    heavyRepercussions: HeavyRepercussions,
    intoTheFray: IntoTheFray,
    punish: Punish,
    impenetrableWall: ImpenetrableWall,
    thunderlord: Thunderlord,
    violentOutburstCastRatio: ViolentOutburstCastRatio,
    violentOutburstTimeBetweenBuffs: ViolentOutburstTimeBetweenBuffs,
    spellReflection: SpellReflection,
    impendingVictory: ImpendingVictory,
    ravagerHitCheck: RavagerHitCheck,

    // Colossus Hero Talents
    // TODO

    // Mountain Thane Hero Talents
    BurstOfPower,

    // Tier
    WarWithin2PS1TierSet,
  };
}

export default CombatLogParser;
