import CoreCombatLogParser from 'parser/core/CombatLogParser';
// Features
import GlobalCooldown from './modules/core/GlobalCooldown';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/features/checklist/Module';
// Resources
import EnergyCapTracker from './modules/resources/EnergyCapTracker';
import ChiDetails from './modules/resources/ChiDetails';
import ChiTracker from './modules/resources/ChiTracker';
// Core
import Channeling from './modules/core/Channeling';
// Spells
import ComboBreaker from './modules/spells/ComboBreaker';
import FistsofFury from './modules/spells/FistsofFury';
import SpinningCraneKick from './modules/spells/SpinningCraneKick';
import ComboStrikes from './modules/spells/ComboStrikes';
import TouchOfKarma from './modules/spells/TouchOfKarma';
import TouchOfDeath from './modules/spells/TouchOfDeath';
import BlackoutKick from './modules/spells/BlackoutKick';
// Talents
import HitCombo from './modules/talents/HitCombo';
import Serenity from './modules/talents/Serenity';
// Azerite
import GloryOfTheDawn from './modules/spells/azeritetraits/GloryOfTheDawn';
import FuryOfXuen from './modules/spells/azeritetraits/FuryOfXuen';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,

    // Resources
    chiTracker: ChiTracker,
    chiDetails: ChiDetails,
    energyCapTracker: EnergyCapTracker,

    // Talents:
    hitCombo: HitCombo,
    serenity: Serenity,

    // Spells;
    comboBreaker: ComboBreaker,
    fistsofFury: FistsofFury,
    spinningCraneKick: SpinningCraneKick,
    touchOfKarma: TouchOfKarma,
    touchOfDeath: TouchOfDeath,
    comboStrikes: ComboStrikes,
    blackoutKick: BlackoutKick,

    // Azerite
    gloryOfTheDawn: GloryOfTheDawn,
    furyOfXuen: FuryOfXuen,
  };
}

export default CombatLogParser;
