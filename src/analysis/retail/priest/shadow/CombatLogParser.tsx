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
import AbilityTracker from './modules/core/AbilityTracker';
import GlobalCooldown from './modules/core/GlobalCooldown';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import ShadowyInsight from './modules/talents/ShadowyInsight';
import DotUptimes from './modules/features/DotUptimes';
import Voidform from './modules/spells/Voidform';
import Voidbolt from './modules/spells/Voidbolt';
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
import DeathAndMadness from './modules/talents/DeathAndMadness';
import ShadowCrash from './modules/talents/ShadowCrash';
import InsidiousIre from './modules/talents/InsidiousIre';
import InescapableTorment from './modules/talents/InescapableTorment';
import UnfurlingDarkness from './modules/talents/UnfurlingDarkness';
import Deathspeaker from './modules/talents/Deathspeaker';
import MindSpikeInsanity from './modules/talents/MindSpikeInsanity';
import AncientMadness from './modules/talents/AncientMadness';
import VoidTorrent from './modules/talents/VoidTorrent';
import MindFlayInsanity from './modules/talents/MindFlayInsanity';
import MindDevourer from './modules/talents/MindDevourer';
import IdolOfCthun from './modules/talents/IdolOfCthun';
import IdolOfYoggSaron from './modules/talents/IdolOfYoggSaron';
import IdolOfNzoth from './modules/talents/IdolOfNzoth';
import IdolOfYshaarj from './modules/talents/IdolOfYshaarj';
import Manipulation from './modules/talents/Manipulation';
import InsanityGraph from './modules/guide/InsanityGraph';
import ShadowyApparitions from './modules/spells/ShadowyApparitions';
import AuspiciousSpirits from './modules/talents/AuspiciousSpirits';
import PhantasmalPathogen from './modules/talents/PhantasmalPathogen';
import TormentedSpirits from './modules/talents/TormentedSpirits';
import PsychicLink from './modules/talents/PsychicLink';

import Tier29FourSet from './modules/tier/Tier29ShadowPriest4Set';
import Tier30 from './modules/tier/Tier30ShadowPriest';
import Tier31FourSet from './modules/tier/Tier31ShadowPriest4Set';
import Tier31FourSetNormalizer from './modules/tier/Tier31ShadowPriest4SetNormalizer';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    // core
    abilities: Abilities,
    abilityTracker: AbilityTracker,
    globalCooldown: GlobalCooldown,

    // features:
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cancelledCasts: CancelledCasts,
    cooldownThroughputTracker: CooldownThroughputTracker,
    dotUptimes: DotUptimes,

    // resources:
    insanityTracker: InsanityTracker,
    insanityUsage: InsanityUsage,
    insanityGraph: InsanityGraph,

    // spells:
    devouringPlague: DevouringPlague,
    shadowfiend: Shadowfiend,
    shadowWordDeath: ShadowWordDeath,
    shadowWordPain: ShadowWordPain,
    shadowyApparitions: ShadowyApparitions,
    vampiricTouch: VampiricTouch,
    voidbolt: Voidbolt,
    voidform: Voidform,

    // Spec talents:
    ancientMadness: AncientMadness,
    auspiciousSpirits: AuspiciousSpirits,
    darkEvangelism: DarkEvangelism,
    deathspeaker: Deathspeaker,
    dispersion: Dispersion,
    idolOfCthun: IdolOfCthun,
    idolOfNzoth: IdolOfNzoth,
    idolOfYoggSaron: IdolOfYoggSaron,
    idolOfYshaarj: IdolOfYshaarj,
    inescapableTorment: InescapableTorment,
    insidiousIre: InsidiousIre,
    mindDevourer: MindDevourer,
    mindFlayInsanity: MindFlayInsanity,
    mindSpikeInsanity: MindSpikeInsanity,
    phantasmalPathogen: PhantasmalPathogen,
    psychicLink: PsychicLink,
    shadowCrash: ShadowCrash,
    shadowyInsight: ShadowyInsight,
    tormentedSpirits: TormentedSpirits,
    unfurlingDarkness: UnfurlingDarkness,
    voidTorrent: VoidTorrent,

    // Class Talents:
    deathAndMadness: DeathAndMadness,
    manipulation: Manipulation,
    mindgames: Mindgames,
    twinsOfTheSunPriestess: TwinsOfTheSunPriestess,
    twistOfFate: TwistOfFate,
    vampiricEmbrace: VampiricEmbrace,

    // normalizers:
    channeling: Channeling,
    shadowfiendNormalizer: ShadowfiendNormalizer,
    tier31FourSetNormalizer: Tier31FourSetNormalizer,

    //Tier
    tier29FourSet: Tier29FourSet,
    tier30: Tier30,
    tier31FourSet: Tier31FourSet,

    arcaneTorrent: [ArcaneTorrent, { active: false }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
