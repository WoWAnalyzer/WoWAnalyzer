import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

// core
import Haste from './Modules/Core/Haste';
import AbilityTracker from './Modules/Core/AbilityTracker';
import Insanity from './Modules/Core/Insanity';
import Channeling from './Modules/Core/Channeling';
import GlobalCooldown from './Modules/Core/GlobalCooldown';

// features
import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Checklist from './Modules/Features/Checklist';
import SkippableCasts from './Modules/Features/SkippableCasts';

// spells:
import Mindbender from './Modules/Spells/Mindbender';
import Shadowfiend from './Modules/Spells/Shadowfiend';
import VampiricTouch from './Modules/Spells/VampiricTouch';
import ShadowWordPain from './Modules/Spells/ShadowWordPain';
import Voidform from './Modules/Spells/Voidform';
import VoidformAverageStacks from './Modules/Spells/VoidformAverageStacks';
import VoidTorrent from './Modules/Spells/VoidTorrent';
import Dispersion from './Modules/Spells/Dispersion';
import CallToTheVoid from './Modules/Spells/CallToTheVoid';
import TwistOfFate from './Modules/Spells/TwistOfFate';

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
    voidTorrent: VoidTorrent,
    dispersion: Dispersion,
    callToTheVoid: CallToTheVoid,
    twistOfFate: TwistOfFate,
  };
}

export default CombatLogParser;
