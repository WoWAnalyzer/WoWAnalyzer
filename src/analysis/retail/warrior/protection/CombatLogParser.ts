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
import Glory from './modules/shadowlands/legendaries/Glory';
import TheWall from './modules/shadowlands/legendaries/TheWall';
import Thunderlord from './modules/shadowlands/legendaries/Thunderlord';
import FourSetCastRatio from './modules/shadowlands/tierset/FourSetCastRatio';
import FourSetTimeBetweenBuffs from './modules/shadowlands/tierset/FourSetTimeBetweenBuffs';
import IgnorePainExpired from './modules/spells/IgnorePainExpired';
import IgnorePainOvercap from './modules/spells/IgnorePainOvercap';
import IgnorePainTracker from './modules/spells/IgnorePainTracker';
import ShieldBlock from './modules/spells/ShieldBlock';
import ShieldSlam from './modules/spells/ShieldSlam';
import SpellReflect from './modules/spells/SpellReflect';
import AngerManagement from './modules/talents/AngerManagement';
import BoomingVoice from './modules/talents/BoomingVoice';
import DragonRoar from './modules/talents/DragonRoar';
import HeavyRepercussions from './modules/talents/HeavyRepercussions';
import IntoTheFray from './modules/talents/IntoTheFray';
import Punish from './modules/talents/Punish';
import WarMachine from './modules/talents/WarMachine';

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
    dragonRoar: DragonRoar,

    //legos
    theWall: TheWall,
    thunderlord: Thunderlord,
    glory: Glory,
    //tier
    fourSetCastRatio: FourSetCastRatio,
    fourSetTimeBetweenBuffs: FourSetTimeBetweenBuffs,
  };
}

export default CombatLogParser;
