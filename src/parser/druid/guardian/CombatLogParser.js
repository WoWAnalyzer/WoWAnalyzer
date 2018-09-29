import CoreCombatLogParser from 'parser/core/CombatLogParser';
import AbilityTracker from 'parser/core/modules/AbilityTracker';
import HealingDone from 'parser/core/modules/HealingDone';
import DamageDone from 'parser/core/modules/DamageDone';
import DamageTaken from 'parser/core/modules/DamageTaken';

import Abilities from './modules/Abilities';
import ActiveTargets from './modules/features/ActiveTargets';
import Gore from './modules/features/Gore';
import GalacticGuardian from './modules/features/GalacticGuardian';
import GuardianOfElune from './modules/features/GuardianOfElune';
import IronFurGoEProcs from './modules/features/IronFurGoEProcs';
import FrenziedRegenGoEProcs from './modules/features/FrenziedRegenGoEProcs';
import RageWasted from './modules/features/RageWasted';
import AntiFillerSpam from './modules/features/AntiFillerSpam';
import MitigationCheck from './modules/features/MitigationCheck';

import IronFur from './modules/spells/IronFur';
import Thrash from './modules/spells/Thrash';
import Moonfire from './modules/spells/Moonfire';
import Pulverize from './modules/spells/Pulverize';
import Earthwarden from './modules/talents/Earthwarden';
import Incarnation from './modules/talents/Incarnation';
import FrenziedRegeneration from './modules/spells/FrenziedRegeneration';

import SkysecsHold from './modules/items/Skysecs';
import LuffaWrappings from './modules/items/LuffaWrappings';
import FuryOfNature from './modules/items/FuryOfNature';
import SoulOfTheArchdruid from '../shared/modules/items/SoulOfTheArchdruid';

import Tier21_2P from './modules/sets/Tier21_2P';
import Tier21_4P from './modules/sets/Tier21_4P';

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
