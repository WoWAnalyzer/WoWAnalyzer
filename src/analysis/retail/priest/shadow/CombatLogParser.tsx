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
import AuspiciousSpirits from './modules/talents/AuspiciousSpirits';
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

import Tier29FourSet from './modules/tier/Tier29ShadowPriest4Set';
import Tier31FourSet from './modules/tier/Tier31ShadowPriest4Set';
import Tier31FourSetNormalizer from './modules/tier/Tier31ShadowPriest4SetNormalizer';

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
    voidbolt: Voidbolt,
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
    ancientMadness: AncientMadness,
    deathAndMadness: DeathAndMadness,
    unfurlingDarkness: UnfurlingDarkness,
    twistOfFate: TwistOfFate,
    voidTorrent: VoidTorrent,
    mindFlayInsanity: MindFlayInsanity,
    shadowCrash: ShadowCrash,
    inescapableTorment: InescapableTorment,
    auspiciousSpirits: AuspiciousSpirits,
    mindDevourer: MindDevourer,
    mindSpikeInsanity: MindSpikeInsanity,
    deathspeaker: Deathspeaker,
    idolOfCthun: IdolOfCthun,
    idolOfYoggSaron: IdolOfYoggSaron,
    idolOfNzoth: IdolOfNzoth,
    idolOfYshaarj: IdolOfYshaarj,
    insidiousIre: InsidiousIre,
    manipulation: Manipulation,

    // normalizers:
    shadowfiendNormalizer: ShadowfiendNormalizer,

    // covenants:
    mindgames: Mindgames,

    //Tier
    tier29FourSet: Tier29FourSet,
    tier31FourSet: Tier31FourSet,
    tier31FourSetNormalizer: Tier31FourSetNormalizer,

    arcaneTorrent: [ArcaneTorrent, { active: false }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
