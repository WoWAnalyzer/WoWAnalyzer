import CoreCombatLogParser from 'parser/core/CombatLogParser';
import HealingDone from 'parser/shared/modules/HealingDone';
import DamageDone from 'parser/shared/modules/DamageDone';
import DamageTaken from 'parser/shared/modules/DamageTaken';

import Haste from './modules/core/Haste';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import SpellUsable from './modules/features/SpellUsable';
import MitigationCheck from './modules/features/MitigationCheck';

import Shield_Block from './modules/spells/ShieldBlock';
import Checklist from './modules/features/Checklist';
import IgnorePain from './modules/features/IgnorePain';
import RageTracker from './modules/core/RageTracker';
import RageDetails from './modules/core/RageDetails';
import Avatar from './modules/features/Avatar';

import AngerManagement from './modules/talents/AngerManagement';
import BoomingVoice from './modules/talents/BoomingVoice';
import HeavyRepercussions from './modules/talents/HeavyRepercussions';
import IntoTheFray from './modules/talents/IntoTheFray';
import Vengeance from './modules/talents/Vengeance';
import Punish from './modules/talents/Punish';
import DragonRoar from './modules/talents/DragonRoar';

import ThundergodsVigor from './modules/items/ThundergodsVigor';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    damageTaken: [DamageTaken, { showStatistic: true }],
    healingDone: [HealingDone, { showStatistic: true }],
    damageDone: [DamageDone, { showStatistic: true }],
    haste: Haste,
    mitigationCheck: MitigationCheck,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    shield_block: Shield_Block,
    spellUsable: SpellUsable,
    checklist: Checklist,
    ignorePain: IgnorePain,
    rageTracker: RageTracker,
    rageDetails: RageDetails,
    avatar: Avatar,
    //Talents
    angerManagement: AngerManagement,
    boomingVoice: BoomingVoice,
    heavyRepercussions: HeavyRepercussions,
    intoTheFray: IntoTheFray,
    vengeance: Vengeance,
    punish: Punish,
    dragonRoar: DragonRoar,
    //Items
    thunderlordsVigor: ThundergodsVigor,
  };
}

export default CombatLogParser;
