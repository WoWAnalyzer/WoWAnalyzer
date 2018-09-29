import CoreCombatLogParser from 'parser/core/CombatLogParser';
import AbilityTracker from 'parser/core/modules/AbilityTracker';
import HealingDone from 'parser/core/modules/HealingDone';
import DamageDone from 'parser/core/modules/DamageDone';
import DamageTaken from 'parser/core/modules/DamageTaken';

import Abilities from './modules/Abilities';
import ActiveTargets from './modules/Features/ActiveTargets';
import Gore from './modules/Features/Gore';
import GalacticGuardian from './modules/Features/GalacticGuardian';
import GuardianOfElune from './modules/Features/GuardianOfElune';
import IronFurGoEProcs from './modules/Features/IronFurGoEProcs';
import FrenziedRegenGoEProcs from './modules/Features/FrenziedRegenGoEProcs';
import RageWasted from './modules/Features/RageWasted';
import AntiFillerSpam from './modules/Features/AntiFillerSpam';
import MitigationCheck from './modules/Features/MitigationCheck';

import IronFur from './modules/Spells/IronFur';
import Thrash from './modules/Spells/Thrash';
import Moonfire from './modules/Spells/Moonfire';
import Pulverize from './modules/Spells/Pulverize';
import Earthwarden from './modules/Talents/Earthwarden';
import Incarnation from './modules/Talents/Incarnation';
import FrenziedRegeneration from './modules/Spells/FrenziedRegeneration';

import SkysecsHold from './modules/Items/Skysecs';
import LuffaWrappings from './modules/Items/LuffaWrappings';
import FuryOfNature from './modules/Items/FuryOfNature';
import SoulOfTheArchdruid from '../shared/modules/Items/SoulOfTheArchdruid';

import Tier21_2P from './modules/Sets/Tier21_2P';
import Tier21_4P from './modules/Sets/Tier21_4P';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    damageTaken: [DamageTaken, { showStatistic: true }],
    healingDone: [HealingDone, { showStatistic: true }],
    damageDone: [DamageDone, { showStatistic: true }],
    abilityTracker: AbilityTracker,
    abilities: Abilities,
    mitigationCheck: MitigationCheck,

    // Features
    activeTargets: ActiveTargets,
    goreProcs: Gore,
    galacticGuardianProcs: GalacticGuardian,
    guardianOfEluneProcs: GuardianOfElune,
    ironFurGoEProcs: IronFurGoEProcs,
    frenziedRegenGoEProcs: FrenziedRegenGoEProcs,
    rageWasted: RageWasted,
    antiFillerSpam: AntiFillerSpam,

    ironFur: IronFur,
    thrash: Thrash,
    moonfire: Moonfire,
    pulverize: Pulverize,
    frenziedRegeneration: FrenziedRegeneration,

    // Talents:
    earthwarden: Earthwarden,
    incarnation: Incarnation,

    // Legendaries:
    skysecs: SkysecsHold,
    luffaWrappings: LuffaWrappings,
    furyOfNature: FuryOfNature,
    soulOfTheArchdruid : SoulOfTheArchdruid,

    // Sets
    tier21_2p: Tier21_2P,
    tier21_4p: Tier21_4P,
  };
}

export default CombatLogParser;
