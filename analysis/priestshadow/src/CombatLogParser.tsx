import MainCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import {
  BoonOfTheAscended,
  FaeGuardians,
  Mindgames,
  ShadowfiendNormalizer,
  TwinsOfTheSunPriestess,
  UnholyNova,
} from '@wowanalyzer/priest';

import Abilities from './modules/Abilities';
import Checklist from './modules/checklist/Module';
import AbilityTracker from './modules/core/AbilityTracker';
import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import DarkThoughts from './modules/features/DarkThoughts';
import DotUptimes from './modules/features/DotUptimes';
import SkippableCasts from './modules/features/SkippableCasts';
import VoidBoltUsage from './modules/features/VoidBoltUsage';
import InsanityTracker from './modules/resources/InsanityTracker';
import InsanityUsage from './modules/resources/InsanityUsage';
import DissonantEchoes from './modules/shadowlands/conduits/DissonantEchoes';
import HauntingApparitions from './modules/shadowlands/conduits/HauntingApparitions';
import EternalCallToTheVoid from './modules/shadowlands/legendaries/EternalCallToTheVoid';
import TalbadarsStratagem from './modules/shadowlands/legendaries/TalbadarsStratagem';
import DevouringPlague from './modules/spells/DevouringPlague';
import Dispersion from './modules/spells/Dispersion';
import Shadowfiend from './modules/spells/Shadowfiend';
import ShadowWordDeath from './modules/spells/ShadowWordDeath';
import ShadowWordPain from './modules/spells/ShadowWordPain';
import VampiricEmbrace from './modules/spells/VampiricEmbrace';
import VampiricTouch from './modules/spells/VampiricTouch';
import AuspiciousSpirits from './modules/talents/AuspiciousSpirits';
import DeathAndMadness from './modules/talents/DeathAndMadness';
import FortressOfTheMind from './modules/talents/FortressOfTheMind';
import SearingNightmare from './modules/talents/SearingNightmare';
import ShadowCrash from './modules/talents/ShadowCrash';
import TwistOfFate from './modules/talents/TwistOfFate';
import UnfurlingDarkness from './modules/talents/UnfurlingDarkness';
import VoidTorrent from './modules/talents/VoidTorrent';

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
    darkThoughts: DarkThoughts,
    voidBoltUsage: VoidBoltUsage,

    // spells:
    shadowfiend: Shadowfiend,
    vampiricTouch: VampiricTouch,
    shadowWordDeath: ShadowWordDeath,
    shadowWordPain: ShadowWordPain,
    devouringPlague: DevouringPlague,
    dispersion: Dispersion,
    vampiricEmbrace: VampiricEmbrace,

    // talents:
    fortressOfTheMind: FortressOfTheMind,
    deathAndMadness: DeathAndMadness,
    unfurlingDarkness: UnfurlingDarkness,
    twistOfFate: TwistOfFate,
    voidTorrent: VoidTorrent,
    shadowCrash: ShadowCrash,
    auspiciousSpirits: AuspiciousSpirits,
    searingNightmare: SearingNightmare,

    // normalizers:
    shadowfiendNormalizer: ShadowfiendNormalizer,

    // covenants:
    unholyNova: UnholyNova,
    mindgames: Mindgames,
    boonOfTheAscended: BoonOfTheAscended,
    faeGuardians: FaeGuardians,

    // conduits:
    dissonantEchoes: DissonantEchoes,
    hauntingApparitions: HauntingApparitions,

    // legendaries:
    eternalCallToTheVoid: EternalCallToTheVoid,
    talbadarsStratagem: TalbadarsStratagem,
    twinsOfTheSunPriestess: TwinsOfTheSunPriestess,

    arcaneTorrent: [ArcaneTorrent, { active: false }] as const,
  };
}

export default CombatLogParser;
