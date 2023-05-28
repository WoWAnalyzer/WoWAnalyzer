import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';

import Abilities from './modules/Abilities';
import Enrage from './modules/buffdebuff/Enrage';
import RageDetails from './modules/core/RageDetails';
import RageTracker from './modules/core/RageTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import Checklist from './modules/features/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import SpellUsable from './modules/features/SpellUsable';
import EnrageNormalizer from './modules/normalizers/Enrage';
import SpearOfBastion from './modules/talents/SpearOfBastion';
import MissedRampage from './modules/spells/MissedRampage';
import Recklessness from './modules/spells/Recklessness';
import WhirlWind from './modules/spells/Whirlwind';
import AngerManagement from './modules/talents/AngerManagement';
//import ImpendingVicory from './modules/talents/ImpendingVictory';
import MeatCleaver from './modules/talents/MeatCleaver';
import RecklessAbandon from './modules/talents/RecklessAbandon';
import SuddenDeath from './modules/talents/SuddenDeath';
import Warpaint from './modules/talents/Warpaint';
import SpellReflection from '../shared/modules/talents/SpellReflection';
import ImpendingVictory from '../shared/modules/talents/ImpendingVictory';

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

    //talents
    angerManagement: AngerManagement,
    //impendingVictory: ImpendingVicory,
    meatCleaver: MeatCleaver,
    recklessAbandon: RecklessAbandon,
    suddenDeath: SuddenDeath,
    warpaint: Warpaint,
    spearofBastion: SpearOfBastion,
    spellReflection: SpellReflection,
    impendingVictory: ImpendingVictory,
  };
}

export default CombatLogParser;
