import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Haste from './modules/core/Haste';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import SpellUsable from './modules/features/SpellUsable';
import MitigationCheck from './modules/features/MitigationCheck';

import ShieldBlock from './modules/spells/ShieldBlock';
import Checklist from './modules/features/Checklist/Module';
import IgnorePain from './modules/features/IgnorePain';
import RageTracker from './modules/core/RageTracker';
import RageDetails from './modules/core/RageDetails';
import Avatar from './modules/features/Avatar';
import ShieldSlam from './modules/spells/ShieldSlam';

import AngerManagement from './modules/talents/AngerManagement';
import BoomingVoice from './modules/talents/BoomingVoice';
import HeavyRepercussions from './modules/talents/HeavyRepercussions';
import Bolster from './modules/talents/Bolster';
import IntoTheFray from './modules/talents/IntoTheFray';
import Vengeance from './modules/talents/Vengeance';
import Punish from './modules/talents/Punish';
import DragonRoar from './modules/talents/DragonRoar';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    haste: Haste,
    mitigationCheck: MitigationCheck,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    shield_block: ShieldBlock,
    spellUsable: SpellUsable,

    checklist: Checklist,

    ignorePain: IgnorePain,
    rageTracker: RageTracker,
    rageDetails: RageDetails,
    avatar: Avatar,
    shieldSlam: ShieldSlam,
    //Talents
    angerManagement: AngerManagement,
    boomingVoice: BoomingVoice,
    heavyRepercussions: HeavyRepercussions,
    intoTheFray: IntoTheFray,
    bolster: Bolster,
    vengeance: Vengeance,
    punish: Punish,
    dragonRoar: DragonRoar,
    //Items
  };
}

export default CombatLogParser;
