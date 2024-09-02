import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';
import WindfuryLinkNormalizer from 'parser/shared/normalizers/WindfuryLinkNormalizer';
import RageGraph from '../shared/modules/core/RageGraph';
import RageTracker from '../shared/modules/core/RageTracker';
import GenerateRageEventsNormalizer from '../shared/modules/normalizers/rage/GenerateRageEventsNormalizer';
import RageAttributeNormalizer from '../shared/modules/normalizers/rage/RageAttributeNormalizer';
import RageGainNormalizer from '../shared/modules/normalizers/rage/RageGainNormalizer';
import Abilities from './modules/Abilities';
import Enrage from './modules/buffdebuff/Enrage';
import RageDetails from './modules/core/RageDetails';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import Checklist from './modules/features/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import SpellUsable from './modules/features/SpellUsable';
import EnrageNormalizer from './modules/normalizers/Enrage';
import ChampionsSpear from './modules/talents/ChampionsSpear';
import MissedRampage from './modules/spells/MissedRampage';
import Recklessness from './modules/spells/Recklessness';
import WhirlWind from './modules/spells/Whirlwind';
import AngerManagement from './modules/talents/AngerManagement';
import MeatCleaver from './modules/talents/MeatCleaver';
import RecklessAbandon from './modules/talents/RecklessAbandon';
import SuddenDeath from './modules/talents/SuddenDeath';
import Warpaint from './modules/talents/Warpaint';
import SpellReflection from '../shared/modules/talents/SpellReflection';
import ImpendingVictory from '../shared/modules/talents/ImpendingVictory';
import BerserkersTormentNormalizer from './modules/talents/BerserkersTorment';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    windfuryNormalizer: WindfuryLinkNormalizer,

    rageGainNormalizer: RageGainNormalizer,
    generateRageEventsNormalizer: GenerateRageEventsNormalizer,
    rageAttributeNormalizer: RageAttributeNormalizer,

    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    channeling: Channeling,
    checklist: Checklist,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,
    buffs: Buffs,

    whirlWind: WhirlWind,
    rageTracker: RageTracker,
    rageGraph: RageGraph,
    rageDetails: RageDetails,

    enrageNormalizer: EnrageNormalizer,
    berserkersTormentNormalizer: BerserkersTormentNormalizer,

    enrageUptime: Enrage,

    missedRampage: MissedRampage,
    recklessness: Recklessness,

    //talents
    angerManagement: AngerManagement,
    meatCleaver: MeatCleaver,
    recklessAbandon: RecklessAbandon,
    suddenDeath: SuddenDeath,
    warpaint: Warpaint,
    spearofBastion: ChampionsSpear,
    spellReflection: SpellReflection,
    impendingVictory: ImpendingVictory,
  };
}

export default CombatLogParser;
