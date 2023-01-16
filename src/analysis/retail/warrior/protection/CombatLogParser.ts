import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Haste from './modules/core/Haste';
import RageDetails from './modules/core/RageDetails';
import RageTracker from './modules/core/RageTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Avatar from './modules/features/Avatar';
import BigHitGraph from './modules/features/BigHitGraph';
import BlockCheck from './modules/features/BlockCheck';
import Buffs from './modules/features/Buffs';
import Checklist from './modules/features/Checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import MitigationCheck from './modules/features/MitigationCheck';
import SpellUsable from './modules/features/SpellUsable';
import ImpenetrableWall from './modules/talents/ImpenetrableWall';
import Thunderlord from './modules/talents/Thunderlord';
import ViolentOutburstCastRatio from './modules/talents/ViolentOutburstCastRatio';
import ViolentOutburstTimeBetweenBuffs from './modules/talents/ViolentOutburstTimeBetweenBuffs';
import IgnorePainExpired from './modules/spells/IgnorePainExpired';
import IgnorePainOvercap from './modules/spells/IgnorePainOvercap';
import IgnorePainTracker from './modules/spells/IgnorePainTracker';
import ShieldBlock from './modules/spells/ShieldBlock';
import ShieldSlam from './modules/spells/ShieldSlam';
import SpellReflect from './modules/spells/SpellReflect';
import AngerManagement from './modules/talents/AngerManagement';
import BoomingVoice from './modules/talents/BoomingVoice';
import ThunderousRoar from './modules/talents/ThunderousRoar';
import HeavyRepercussions from './modules/talents/HeavyRepercussions';
import IntoTheFray from './modules/talents/IntoTheFray';
import Punish from './modules/talents/Punish';
import WarMachine from './modules/talents/WarMachine';
import SpellReflection from '../shared/modules/talents/SpellReflection';
import ImpendingVictory from '../shared/modules/talents/ImpendingVictory';

//legendaries

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
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
    warMachine: WarMachine,
    punish: Punish,
    thunderousRoar: ThunderousRoar,
    impenetrableWall: ImpenetrableWall,
    thunderlord: Thunderlord,
    violentOutburstCastRatio: ViolentOutburstCastRatio,
    violentOutburstTimeBetweenBuffs: ViolentOutburstTimeBetweenBuffs,
    spellReflection: SpellReflection,
    impendingVictory: ImpendingVictory,
  };
}

export default CombatLogParser;
