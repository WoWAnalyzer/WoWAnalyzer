import {
  BoonOfTheAscended,
  FaeGuardians,
  Mindgames,
  ShadowfiendNormalizer,
  TwinsOfTheSunPriestess,
  UnholyNova,
} from '@wowanalyzer/priest';

import MainCombatLogParser from 'parser/core/CombatLogParser';

// core
import AbilityTracker from './modules/core/AbilityTracker';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';
// resources
import InsanityTracker from './modules/resources/InsanityTracker';
import InsanityUsage from './modules/resources/InsanityUsage';
// features
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/checklist/Module';
import DotUptimes from './modules/features/DotUptimes';
import SkippableCasts from './modules/features/SkippableCasts';
import DarkThoughts from './modules/features/DarkThoughts';
// spells:
import Shadowfiend from './modules/spells/Shadowfiend';
import VampiricTouch from './modules/spells/VampiricTouch';
import ShadowWordDeath from './modules/spells/ShadowWordDeath';
import ShadowWordPain from './modules/spells/ShadowWordPain';
import DevouringPlague from './modules/spells/DevouringPlague';
import Dispersion from './modules/spells/Dispersion';
import VampiricEmbrace from './modules/spells/VampiricEmbrace';
// talents
import FortressOfTheMind from './modules/talents/FortressOfTheMind';
import DeathAndMadness from './modules/talents/DeathAndMadness';
import UnfurlingDarkness from './modules/talents/UnfurlingDarkness';
import TwistOfFate from './modules/talents/TwistOfFate';
import VoidTorrent from './modules/talents/VoidTorrent';
import ShadowCrash from './modules/talents/ShadowCrash';
import AuspiciousSpirits from './modules/talents/AuspiciousSpirits';
import SearingNightmare from './modules/talents/SearingNightmare';
// normalizers
import Buffs from './modules/features/Buffs';

// conduits
import DissonantEchoes from './modules/shadowlands/conduits/DissonantEchoes';
import HauntingApparitions from './modules/shadowlands/conduits/HauntingApparitions';

// legendaries
import EternalCallToTheVoid from './modules/shadowlands/legendaries/EternalCallToTheVoid';
import TalbadarsStratagem from './modules/shadowlands/legendaries/TalbadarsStratagem';

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
  };
}

export default CombatLogParser;
