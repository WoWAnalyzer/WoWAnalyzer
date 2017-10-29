import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import AbilityTracker from './Modules/Core/AbilityTracker';
import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Insanity from './Modules/Core/Insanity';

import Mindbender from './Modules/Spells/Mindbender';
import Shadowfiend from './Modules/Spells/Shadowfiend';
import VampiricTouch from './Modules/Spells/VampiricTouch';
import ShadowWordPain from './Modules/Spells/ShadowWordPain';
import Voidform from './Modules/Spells/Voidform';
import VoidformAverageStacks from './Modules/Spells/VoidformAverageStacks';
import VoidTorrent from './Modules/Spells/VoidTorrent';
import Dispersion from './Modules/Spells/Dispersion';
import CallToTheVoid from './Modules/Spells/CallToTheVoid';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, { showStatistic: true }],
    alwaysBeCasting: AlwaysBeCasting,
    abilityTracker: AbilityTracker,
    castEfficiency: CastEfficiency,
    insanity: Insanity,

    // Abilities
    mindbender: Mindbender,
    shadowfiend: Shadowfiend,
    vampiricTouch: VampiricTouch,
    shadowWordPain: ShadowWordPain,
    voidform: Voidform,
    voidformAverageStacks: VoidformAverageStacks,
    voidTorrent: VoidTorrent,
    dispersion: Dispersion,
    callToTheVoid: CallToTheVoid,
  };
}

export default CombatLogParser;
