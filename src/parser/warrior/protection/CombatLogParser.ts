import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

//essence
import LucidDreamsRage from 'parser/shared/modules/spells/bfa/essences/LucidDreamsRage';

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
import Bolster from './modules/talents/Bolster';
import IntoTheFray from './modules/talents/IntoTheFray';
import Vengeance from './modules/talents/Vengeance';
import Punish from './modules/talents/Punish';
import DragonRoar from './modules/talents/DragonRoar';
import AngerCD from './modules/talents/AngerCD';
import SpellReflect from './modules/spells/SpellReflect';

//azerite
import BraceForImpact from './modules/azerite/BraceForImpact';


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
    angerCD: AngerCD,
    boomingVoice: BoomingVoice,
    heavyRepercussions: HeavyRepercussions,
    intoTheFray: IntoTheFray,
    bolster: Bolster,
    vengeance: Vengeance,
    punish: Punish,
    dragonRoar: DragonRoar,
    //Items

    //Azerite
    braceForImpact: BraceForImpact,

    //Essences
    lucidDreamsRage: LucidDreamsRage,

    // Doesn't generate enough rage to be a valid cast
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
