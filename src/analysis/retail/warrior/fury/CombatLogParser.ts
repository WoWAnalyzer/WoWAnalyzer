import CoreCombatLogParser from 'parser/core/CombatLogParser';

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
import RecklessAbandonNormalizer from './modules/normalizers/RecklessAbandon';
import SpearOfBastion from './modules/talents/SpearOfBastion';
import MissedRampage from './modules/spells/MissedRampage';
import Recklessness from './modules/spells/Recklessness';
import WhirlWind from './modules/spells/Whirlwind';
import AngerManagement from './modules/talents/AngerManagement';
import MeatCleaver from './modules/talents/MeatCleaver';
import SuddenDeath from './modules/talents/SuddenDeath';
import Warpaint from './modules/talents/Warpaint';
import SpellReflection from '../shared/modules/talents/SpellReflection';
import ImpendingVictory from '../shared/modules/talents/ImpendingVictory';
import BerserkersTormentNormalizer from './modules/talents/BerserkersTorment';
import HackAndSlash from './modules/talents/HackAndSlash';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizer
    recklessAbandonNormalizer: RecklessAbandonNormalizer,
    enrageNormalizer: EnrageNormalizer,
    berserkersTormentNormalizer: BerserkersTormentNormalizer,

    // Core
    buffs: Buffs,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    spellUsable: SpellUsable,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,

    rageTracker: RageTracker,
    rageDetails: RageDetails,
    whirlWind: WhirlWind,

    enrageUptime: Enrage,

    missedRampage: MissedRampage,
    recklessness: Recklessness,

    //talents
    angerManagement: AngerManagement,
    meatCleaver: MeatCleaver,
    suddenDeath: SuddenDeath,
    warpaint: Warpaint,
    spearofBastion: SpearOfBastion,
    spellReflection: SpellReflection,
    impendingVictory: ImpendingVictory,
    hackAndSlash: HackAndSlash,
  };
}

export default CombatLogParser;
