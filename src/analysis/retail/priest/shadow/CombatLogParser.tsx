import {
  TwistOfFate,
  Mindgames,
  ShadowfiendNormalizer,
  TwinsOfTheSunPriestess,
} from 'analysis/retail/priest/shared';
import MainCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';
import CancelledCasts from './modules/features/CancelledCasts';

import Guide from 'analysis/retail/priest/shadow/Guide';

import Abilities from './modules/Abilities';
import Checklist from './modules/checklist/Module';
import AbilityTracker from './modules/core/AbilityTracker';
import GlobalCooldown from './modules/core/GlobalCooldown';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import ShadowyInsight from './modules/spells/ShadowyInsight';
import DotUptimes from './modules/features/DotUptimes';
import Voidform from './modules/spells/Voidform';
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
import MindFlayInsanity from './modules/talents/MindFlayInsanity';
import MindSear from './modules/talents/MindSear';
import MindDevourer from './modules/talents/MindDevourer';
import IdolOfCthun from './modules/talents/IdolOfCthun';
import IdolOfYoggSaron from './modules/talents/IdolOfYoggSaron';
import IdolOfNzoth from './modules/talents/IdolOfNzoth';
import IdolOfYshaarj from './modules/talents/IdolOfYshaarj';
import InsanityGraph from './modules/guide/InsanityGraph';

import FourSet from './modules/tier/Tier29ShadowPriest4Set';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    // core
    abilityTracker: AbilityTracker,
    cooldownThroughputTracker: CooldownThroughputTracker,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,
    cancelledCasts: CancelledCasts,

    // resources:
    insanityTracker: InsanityTracker,
    insanityUsage: InsanityUsage,
    insanityGraph: InsanityGraph,

    // features:
    abilities: Abilities,
    buffs: Buffs,
    alwaysBeCasting: AlwaysBeCasting,
    checklist: Checklist,
    dotUptimes: DotUptimes,
    shadowyInsight: ShadowyInsight,
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
    mindFlayInsanity: MindFlayInsanity,
    shadowCrash: ShadowCrash,
    inescapableTorment: InescapableTorment,
    darkVoid: DarkVoid,
    auspiciousSpirits: AuspiciousSpirits,
    mindSear: MindSear,
    mindDevourer: MindDevourer,
    surgeOfDarkness: SurgeOfDarkness,
    deathspeaker: Deathspeaker,
    idolOfCthun: IdolOfCthun,
    idolOfYoggSaron: IdolOfYoggSaron,
    idolOfNzoth: IdolOfNzoth,
    idolOfYshaarj: IdolOfYshaarj,

    // normalizers:
    shadowfiendNormalizer: ShadowfiendNormalizer,

    // covenants:
    mindgames: Mindgames,

    //Tier
    fourSet: FourSet,

    arcaneTorrent: [ArcaneTorrent, { active: false }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
