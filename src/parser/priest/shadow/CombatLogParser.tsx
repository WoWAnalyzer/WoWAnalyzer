import MainCombatLogParser from 'parser/core/CombatLogParser';

// core
import AbilityTracker from './modules/core/AbilityTracker';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Insanity from './modules/core/Insanity';
import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';
// features
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/checklist/Module';
import SkippableCasts from './modules/features/SkippableCasts';
import DarkThoughts from './modules/features/DarkThoughts';
// spells:
import Shadowfiend from './modules/spells/Shadowfiend';
import VampiricTouch from './modules/spells/VampiricTouch';
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
// normalizers
import ShadowfiendNormalizer from '../shared/normalizers/ShadowfiendNormalizer';
import Buffs from './modules/features/Buffs';
// conduits
import DissonantEchoes from './modules/shadowlands/conduits/DissonantEchoes';

// Covenants
import UnholyNova from '../shared/modules/shadowlands/covenants/UnholyNova';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    // core
    abilityTracker: AbilityTracker,
    cooldownThroughputTracker: CooldownThroughputTracker,
    insanity: Insanity,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // features:
    abilities: Abilities,
    buffs: Buffs,
    alwaysBeCasting: AlwaysBeCasting,
    checklist: Checklist,
    skippableCasts: SkippableCasts,
    darkThoughts: DarkThoughts,

    // spells:
    shadowfiend: Shadowfiend,
    vampiricTouch: VampiricTouch,
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

    // normalizers:
    shadowfiendNormalizer: ShadowfiendNormalizer,

    // covenants:
    unholyNova: UnholyNova,

    // conduits:
    dissonantEchoes: DissonantEchoes,
  };
}

export default CombatLogParser;
