import {
  TwistOfFate,
  Mindgames,
  ShadowfiendNormalizer,
  TwinsOfTheSunPriestess,
} from 'analysis/retail/priest/shared';
import MainCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';

import Abilities from './modules/Abilities';
import Checklist from './modules/checklist/Module';
import AbilityTracker from './modules/core/AbilityTracker';
import GlobalCooldown from './modules/core/GlobalCooldown';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import ShadowyInsight from './modules/features/ShadowyInsight';
import DotUptimes from './modules/features/DotUptimes';
import SkippableCasts from './modules/features/SkippableCasts';
import VoidBoltUsage from './modules/features/VoidBoltUsage';
import Voidform from './modules/features/Voidform';
import InsanityTracker from './modules/resources/InsanityTracker';
import InsanityUsage from './modules/resources/InsanityUsage';
import DevouringPlague from './modules/spells/DevouringPlague';
import DarkEvangelism from './modules/talents/DarkEvangelism';
import Dispersion from './modules/talents/Dispersion';
import Shadowfiend from './modules/spells/Shadowfiend';
import ShadowWordDeath from './modules/spells/ShadowWordDeath';
import ShadowWordPain from './modules/spells/ShadowWordPain';
import VampiricEmbrace from './modules/talents/VampiricEmbrace';
import VampiricTouch from './modules/spells/VampiricTouch';
import AuspiciousSpirits from './modules/talents/AuspiciousSpirits';
import DeathAndMadness from './modules/talents/DeathAndMadness';
import ShadowCrash from './modules/talents/ShadowCrash';
import InescapableTorment from './modules/talents/InescapableTorment';
import DarkVoid from './modules/talents/DarkVoid';
import UnfurlingDarkness from './modules/talents/UnfurlingDarkness';
import Deathspeaker from './modules/talents/Deathspeaker';
import SurgeOfDarkness from './modules/talents/SurgeOfDarkness';
import VoidTorrent from './modules/talents/VoidTorrent';
import MindSear from './modules/talents/MindSear';
import MindDevourer from './modules/talents/MindDevourer';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    // core
    abilityTracker: AbilityTracker,
    cooldownThroughputTracker: CooldownThroughputTracker,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // resources:
    insanityTracker: InsanityTracker,
    insanityUsage: InsanityUsage,

    // features:
    abilities: Abilities,
    buffs: Buffs,
    alwaysBeCasting: AlwaysBeCasting,
    checklist: Checklist,
    dotUptimes: DotUptimes,
    skippableCasts: SkippableCasts,
    shadowyInsight: ShadowyInsight,
    voidBoltUsage: VoidBoltUsage,
    voidform: Voidform,
    twinsOfTheSunPriestess: TwinsOfTheSunPriestess,

    // spells:
    shadowfiend: Shadowfiend,
    vampiricTouch: VampiricTouch,
    shadowWordDeath: ShadowWordDeath,
    shadowWordPain: ShadowWordPain,
    devouringPlague: DevouringPlague,
    dispersion: Dispersion,
    vampiricEmbrace: VampiricEmbrace,
    darkEvangelism: DarkEvangelism,

    // talents:
    deathAndMadness: DeathAndMadness,
    unfurlingDarkness: UnfurlingDarkness,
    twistOfFate: TwistOfFate,
    voidTorrent: VoidTorrent,
    shadowCrash: ShadowCrash,
    inescapableTorment: InescapableTorment,
    darkVoid: DarkVoid,
    auspiciousSpirits: AuspiciousSpirits,
    mindsear: MindSear,
    mindDevourer: MindDevourer,
    surgeOfDarkness: SurgeOfDarkness,
    deathspeaker: Deathspeaker,

    // normalizers:
    shadowfiendNormalizer: ShadowfiendNormalizer,

    // covenants:
    mindgames: Mindgames,

    arcaneTorrent: [ArcaneTorrent, { active: false }] as const,
  };
}

export default CombatLogParser;
