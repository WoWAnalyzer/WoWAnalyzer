import {
  DesperatePrayer,
  Fade,
  PowerWordShield,
  ProtectiveLight,
  ShadowfiendNormalizer,
  TwinsOfTheSunPriestess,
  TwistOfFate,
} from 'analysis/retail/priest/shared';
import MainCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';
import CancelledCasts from './modules/features/CancelledCasts';

import Guide from 'analysis/retail/priest/shadow/Guide';

import Abilities from './modules/Abilities';
import AbilityTracker from './modules/core/AbilityTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import ShadowyInsight from './modules/talents/ShadowyInsight';
import DotUptimes from './modules/features/DotUptimes';
import Voidform from './modules/spells/Voidform';
import VoidVolley from './modules/spells/VoidVolley';
import InsanityTracker from './modules/resources/InsanityTracker';
import InsanityUsage from './modules/resources/InsanityUsage';
import ShadowWordMadness from './modules/spells/ShadowWordMadness';
import DarkEvangelism from './modules/talents/DarkEvangelism';
import Dispersion from './modules/spells/Dispersion';
import ShadowWordDeath from './modules/spells/ShadowWordDeath';
import ShadowWordDeathSpeaker from './modules/spells/ShadowWordDeathSpeaker';
import ShadowWordPain from 'src/analysis/retail/priest/shared/ShadowWordPain';
import VampiricTouch from './modules/spells/VampiricTouch';
import DeathAndMadness from './modules/talents/DeathAndMadness';
import TentacleSlam from './modules/talents/TentacleSlam';
import InsidiousIre from './modules/talents/InsidiousIre';
import InescapableTorment from './modules/talents/InescapableTorment';
import VoidTorrent from './modules/talents/Voidweaver/VoidTorrent';
import MindFlayInsanity from './modules/talents/Archon/MindFlayInsanity';
import MindDevourer from './modules/talents/MindDevourer';
import IdolOfCthun from './modules/talents/IdolOfCthun';
import IdolOfYoggSaron from './modules/talents/IdolOfYoggSaron';
import IdolOfNzoth from './modules/talents/IdolOfNzoth';
import InsanityGraph from './modules/guide/InsanityGraph';
import ShadowyApparitions from './modules/spells/ShadowyApparitions';
import AuspiciousSpirits from './modules/talents/AuspiciousSpirits';
import SpectralHorrors from './modules/talents/SpectralHorrors';
import TormentedSpirits from './modules/talents/TormentedSpirits';
import PsychicLink from './modules/talents/PsychicLink';
import VoidTouched from './modules/talents/VoidTouched';
import MindsEye from './modules/talents/MindsEye';
import DistortedReality from './modules/talents/DistortedReality';
import MaddeningTouch from './modules/talents/MaddeningTouch';
import ShatteredPsyche from './modules/talents/ShatteredPsyche';
import Mastermind from './modules/talents/Mastermind';
import DarkAscension from './modules/talents/DarkAscension';
import Shadowform from './modules/spells/Shadowform';
import PerfectedForm from './modules/talents/Archon/PerfectedForm';
import EnergyCompression from './modules/talents/Archon/EnergyCompression';
import EmpoweredSurges from './modules/talents/Archon/EmpoweredSurges';
import ResonantEnergy from './modules/talents/Archon/ResonantEnergy';
import EnergyCycle from './modules/talents/Archon/EnergyCycle';
import SustainedPotency from './modules/talents/Archon/SustainedPotency';
import ManifestedPower from './modules/talents/Archon/ManifestedPower';
import EntropicRift from './modules/talents/Voidweaver/EntropicRift';
import VoidBlast from './modules/talents/Voidweaver/VoidBlast';
import InnerQuietus from './modules/talents/Voidweaver/InnerQuietus';
import Voidheart from './modules/talents/Voidweaver/Voidheart';
import DevourMatter from './modules/talents/Voidweaver/DevourMatter';
import VoidEmpowerment from './modules/talents/Voidweaver/VoidEmpowerment';
import DepthOfShadows from './modules/talents/Voidweaver/DepthOfShadows';
import InvokedNightmare from './modules/talents/InvokedNightmare';
import TormentingWhispers from './modules/talents/TormentingWhispers';
import DescendingDarkness from './modules/talents/DescendingDarkness';
import SurgeOfInsanity from './modules/talents/SurgeOfInsanity';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    // core
    abilities: Abilities,
    abilityTracker: AbilityTracker,

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
    shadowWordMadness: ShadowWordMadness,
    shadowform: Shadowform,
    shadowWordDeath: ShadowWordDeath,
    shadowWordDeathSpeaker: ShadowWordDeathSpeaker,
    shadowWordPain: ShadowWordPain,
    shadowyApparitions: ShadowyApparitions,
    vampiricTouch: VampiricTouch,
    voidVolley: VoidVolley,
    voidform: Voidform,

    // Spec talents:
    auspiciousSpirits: AuspiciousSpirits,
    darkAscension: DarkAscension,
    darkEvangelism: DarkEvangelism,
    desperatePrayer: DesperatePrayer,
    dispersion: Dispersion,
    fade: Fade,
    powerWordShield: PowerWordShield,
    protectiveLight: ProtectiveLight,
    distortedReality: DistortedReality,
    idolOfCthun: IdolOfCthun,
    idolOfNzoth: IdolOfNzoth,
    idolOfYoggSaron: IdolOfYoggSaron,
    inescapableTorment: InescapableTorment,
    insidiousIre: InsidiousIre,
    maddeningTouch: MaddeningTouch,
    mastermind: Mastermind,
    mindDevourer: MindDevourer,
    mindFlayInsanity: MindFlayInsanity,
    shatteredPsyche: ShatteredPsyche,
    mindsEye: MindsEye,
    spectralHorrors: SpectralHorrors,
    psychicLink: PsychicLink,
    tentacleSlam: TentacleSlam,
    shadowyInsight: ShadowyInsight,
    tormentedSpirits: TormentedSpirits,
    voidTorrent: VoidTorrent,
    voidTouched: VoidTouched,
    invokedNightmare: InvokedNightmare,
    tormentingWhispers: TormentingWhispers,
    descendingDarkness: DescendingDarkness,
    surgeOfInsanity: SurgeOfInsanity,

    // Class Talents:
    deathAndMadness: DeathAndMadness,
    twinsOfTheSunPriestess: TwinsOfTheSunPriestess,
    twistOfFate: TwistOfFate,

    // Hero Talents
    //Archon
    perfectedForm: PerfectedForm,
    energyCompression: EnergyCompression,
    empoweredSurges: EmpoweredSurges,
    resonantEnergy: ResonantEnergy,
    energyCycle: EnergyCycle,
    sustainedPotency: SustainedPotency,
    manifestedPower: ManifestedPower,

    //Voidweaver
    entropicRift: EntropicRift,
    voidBlast: VoidBlast,
    innerQuietus: InnerQuietus,
    voidheart: Voidheart,
    devourMatter: DevourMatter,
    voidEmpowerment: VoidEmpowerment,
    depthsOfShadows: DepthOfShadows,

    // normalizers:
    channeling: Channeling,
    shadowfiendNormalizer: ShadowfiendNormalizer,

    //Tier

    arcaneTorrent: [ArcaneTorrent, { active: false }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
