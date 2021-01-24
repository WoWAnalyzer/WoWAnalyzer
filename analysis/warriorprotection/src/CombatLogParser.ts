import { Condemn } from '@wowanalyzer/warrior';

import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Haste from './modules/core/Haste';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import SpellUsable from './modules/features/SpellUsable';
import MitigationCheck from './modules/features/MitigationCheck';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';

import ShieldBlock from './modules/spells/ShieldBlock';
import BlockCheck from './modules/features/BlockCheck';
import Checklist from './modules/features/Checklist/Module';
import IgnorePain from './modules/features/IgnorePain';
import RageTracker from './modules/core/RageTracker';
import RageDetails from './modules/core/RageDetails';
import Avatar from './modules/features/Avatar';
import ShieldSlam from './modules/spells/ShieldSlam';

import AngerManagement from './modules/talents/AngerManagement';
import BoomingVoice from './modules/talents/BoomingVoice';
import HeavyRepercussions from './modules/talents/HeavyRepercussions';
import IntoTheFray from './modules/talents/IntoTheFray';
import WarMachine from './modules/talents/WarMachine';
import Punish from './modules/talents/Punish';
import DragonRoar from './modules/talents/DragonRoar';
import SpellReflect from './modules/spells/SpellReflect';

//legendaries
import TheWall from './modules/shadowlands/legendaries/TheWall';
import Thunderlord from './modules/shadowlands/legendaries/Thunderlord';


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

    ignorePain: IgnorePain,
    rageTracker: RageTracker,
    rageDetails: RageDetails,
    avatar: Avatar,
    shieldSlam: ShieldSlam,
    spellReflect: SpellReflect,

    //Talents
    angerManagement: AngerManagement,
    boomingVoice: BoomingVoice,
    heavyRepercussions: HeavyRepercussions,
    intoTheFray: IntoTheFray,
    warMachine: WarMachine,
    punish: Punish,
    dragonRoar: DragonRoar,

    //covenants
    condemn: Condemn,

    //legos
    theWall: TheWall,
    thunderlord: Thunderlord,
  };
}

export default CombatLogParser;
