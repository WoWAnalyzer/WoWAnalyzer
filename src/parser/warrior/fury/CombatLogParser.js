import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Channeling from './modules/features/Channeling';
import Checklist from './modules/features/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import SpellUsable from './modules/features/SpellUsable';

import EnrageNormalizer from './modules/normalizers/Enrage';

import Enrage from './modules/buffdebuff/Enrage';

import MissedRampage from './modules/spells/MissedRampage';
import RampageCancelled from './modules/spells/RampageCancelled';
import Recklessness from './modules/spells/Recklessness';

import AngerManagement from './modules/talents/AngerManagement';
import Bladestorm from './modules/talents/Bladestorm';
import Carnage from './modules/talents/Carnage';
import DragonRoar from './modules/talents/DragonRoar';
import EndlessRage from './modules/talents/EndlessRage';
import FrothingBerserker from './modules/talents/FrothingBerserker';
import FuriousSlashTimesByStacks from './modules/talents/FuriousSlashTimesByStacks';
import FuriousSlashUptime from './modules/talents/FuriousSlashUptime';
import ImpendingVicory from './modules/talents/ImpendingVictory';
import MeatCleaver from './modules/talents/MeatCleaver';
import RecklessAbandon from './modules/talents/RecklessAbandon';
import Siegebreaker from './modules/talents/Siegebreaker';
import SuddenDeath from './modules/talents/SuddenDeath';
import Warpaint from './modules/talents/Warpaint';

import ColdStealHotBlood from './modules/azerite/ColdSteelHotBlood';
import RecklessFlurry from './modules/azerite/RecklessFlurry';
import SimmeringRage from './modules/azerite/SimmeringRage';
import UnbridledFerocity from './modules/azerite/UnbridledFerocity';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, {showStatistic: true}],

    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    channeling: Channeling,
    checklist: Checklist,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,

    enrageNormalizer: EnrageNormalizer,

    enrageUptime: Enrage,

    missedRampage: MissedRampage,
    rampageCancelled: RampageCancelled,
    recklessness: Recklessness,

    angerManagement: AngerManagement,
    bladestorm: Bladestorm,
    carnage: Carnage,
    dragonRoar: DragonRoar,
    endlessRage: EndlessRage,
    frothingBerserker: FrothingBerserker,    
    furiousSlashTimesByStacks: FuriousSlashTimesByStacks,
    furiousSlashUptime: FuriousSlashUptime,
    impendingVictory: ImpendingVicory,
    meatCleaver: MeatCleaver,
    recklessAbandon: RecklessAbandon,
    siegebreaker: Siegebreaker,
    suddenDeath: SuddenDeath,
    warpaint: Warpaint,

    coldStealHotBlood: ColdStealHotBlood,
    recklessFlurry: RecklessFlurry,
    simmeringRage: SimmeringRage,
    unbridledFerocity: UnbridledFerocity,
  };
}

export default CombatLogParser;
