import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';
import DeathRecapTracker from 'Main/DeathRecapTracker';

import Abilities from './Modules/Abilities';
import ActiveTargets from './Modules/Features/ActiveTargets';
import Gore from './Modules/Features/Gore';
import GalacticGuardian from './Modules/Features/GalacticGuardian';
import GuardianOfElune from './Modules/Features/GuardianOfElune';
import IronFurGoEProcs from './Modules/Features/IronFurGoEProcs';
import FrenziedRegenGoEProcs from './Modules/Features/FrenziedRegenGoEProcs';
import RageWasted from './Modules/Features/RageWasted';
import AntiFillerSpam from './Modules/Features/AntiFillerSpam';

import IronFur from './Modules/Spells/IronFur';
import Thrash from './Modules/Spells/Thrash';
import Moonfire from './Modules/Spells/Moonfire';
import Pulverize from './Modules/Spells/Pulverize';
import Earthwarden from './Modules/Talents/Earthwarden';
import Incarnation from './Modules/Talents/Incarnation';
import FrenziedRegeneration from './Modules/Spells/FrenziedRegeneration';

import SkysecsHold from './Modules/Items/Skysecs';
import LuffaWrappings from './Modules/Items/LuffaWrappings';
import FuryOfNature from './Modules/Items/FuryOfNature';
import SoulOfTheArchdruid from '../Shared/Modules/Items/SoulOfTheArchdruid';

import Tier21_2P from './Modules/Sets/Tier21_2P';
import Tier21_4P from './Modules/Sets/Tier21_4P';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    damageTaken: [DamageTaken, { showStatistic: true }],
    healingDone: [HealingDone, { showStatistic: true }],
    damageDone: [DamageDone, { showStatistic: true }],
    abilityTracker: AbilityTracker,
    abilities: Abilities,

    // Features
    activeTargets: ActiveTargets,
    goreProcs: Gore,
    galacticGuardianProcs: GalacticGuardian,
    guardianOfEluneProcs: GuardianOfElune,
    ironFurGoEProcs: IronFurGoEProcs,
    frenziedRegenGoEProcs: FrenziedRegenGoEProcs,
    rageWasted: RageWasted,
    antiFillerSpam: AntiFillerSpam,
    deathRecapTracker: DeathRecapTracker,

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
