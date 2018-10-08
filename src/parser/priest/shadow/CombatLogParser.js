import MainCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';

// core
import Haste from './modules/core/Haste';
import AbilityTracker from './modules/core/AbilityTracker';
import Insanity from './modules/core/Insanity';
import Channeling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';

// features
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/checklist/Module';
import SkippableCasts from './modules/features/SkippableCasts';

// spells:
import Mindbender from './modules/spells/Mindbender';
import Shadowfiend from './modules/spells/Shadowfiend';
import VampiricTouch from './modules/spells/VampiricTouch';
import ShadowWordPain from './modules/spells/ShadowWordPain';
import Voidform from './modules/spells/Voidform';
import VoidformAverageStacks from './modules/spells/VoidformAverageStacks';
import Dispersion from './modules/spells/Dispersion';
import CallToTheVoid from './modules/spells/CallToTheVoid';

// talents
import TwistOfFate from './modules/talents/TwistOfFate';
import VoidTorrent from './modules/talents/VoidTorrent';

// items:
import TwinsPainfulTouch from './modules/items/TwinsPainfulTouch';
import AnundsSearedShackles from './modules/items/AnundsSearedShackles';
import HeartOfTheVoid from './modules/items/HeartOfTheVoid';
import ZenkaramIridisAnadem from './modules/items/ZenkaramIridisAnadem';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    // core
    haste: Haste,
    damageDone: [DamageDone, { showStatistic: true }],
    abilityTracker: AbilityTracker,
    insanity: Insanity,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // features:
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    checklist: Checklist,
    skippableCasts: SkippableCasts,

    // spells:
    mindbender: Mindbender,
    shadowfiend: Shadowfiend,
    vampiricTouch: VampiricTouch,
    shadowWordPain: ShadowWordPain,
    voidform: Voidform,
    voidformAverageStacks: VoidformAverageStacks,
    dispersion: Dispersion,
    callToTheVoid: CallToTheVoid,

    // talents:
    twistOfFate: TwistOfFate,
    voidTorrent: VoidTorrent,

    // items:
    twinsPainfulTouch: TwinsPainfulTouch,
    anundsSearedShackles: AnundsSearedShackles,
    heartOfTheVoid: HeartOfTheVoid,
    zenkaramIridisAnadem: ZenkaramIridisAnadem,
  };
}

export default CombatLogParser;
