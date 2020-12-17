import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Channeling from './modules/features/Channeling';
import Checklist from './modules/features/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import SpellUsable from './modules/features/SpellUsable';

import EnrageNormalizer from './modules/normalizers/Enrage';

import Enrage from './modules/buffdebuff/Enrage';

import MissedRampage from './modules/spells/MissedRampage';
import Recklessness from './modules/spells/Recklessness';

import AngerManagement from './modules/talents/AngerManagement';
import Bladestorm from './modules/talents/Bladestorm';
import DragonRoar from './modules/talents/DragonRoar';
import ImpendingVicory from './modules/talents/ImpendingVictory';
import MeatCleaver from './modules/talents/MeatCleaver';
import RecklessAbandon from './modules/talents/RecklessAbandon';
import Siegebreaker from './modules/talents/Siegebreaker';
import SuddenDeath from './modules/talents/SuddenDeath';
import Warpaint from './modules/talents/Warpaint';

import RageTracker from './modules/core/RageTracker';
import RageDetails from './modules/core/RageDetails';
import Buffs from './modules/features/Buffs';
import WhirlWind from './modules/spells/Whirlwind';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    channeling: Channeling,
    checklist: Checklist,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,
    buffs: Buffs,

    whirlWind: WhirlWind,
    rageTracker: RageTracker,
    rageDetails: RageDetails,

    enrageNormalizer: EnrageNormalizer,

    enrageUptime: Enrage,

    missedRampage: MissedRampage,
    recklessness: Recklessness,

    angerManagement: AngerManagement,
    bladestorm: Bladestorm,
    dragonRoar: DragonRoar,
    impendingVictory: ImpendingVicory,
    meatCleaver: MeatCleaver,
    recklessAbandon: RecklessAbandon,
    siegebreaker: Siegebreaker,
    suddenDeath: SuddenDeath,
    warpaint: Warpaint,
  };
}

export default CombatLogParser;
