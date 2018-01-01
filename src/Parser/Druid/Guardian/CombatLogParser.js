import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';

import ActiveTargets from './Modules/Features/ActiveTargets';
import DynamicHaste from './Modules/Features/DynamicHaste';
import Abilities from './Modules/Features/Abilities';
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
import FrenziedRegeneration from './Modules/Spells/FrenziedRegeneration';

import DualDetermination from './Modules/Items/DualDetermination';
import SkysecsHold from './Modules/Items/Skysecs';
import LuffaWrappings from './Modules/Items/LuffaWrappings';
import FuryOfNature from './Modules/Items/FuryOfNature';

import Tier21_2P from './Modules/Sets/Tier21_2P';
import Tier21_4P from './Modules/Sets/Tier21_4P';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    damageTaken: [DamageTaken, { showStatistic: true }],
    healingDone: [HealingDone, { showStatistic: true }],
    damageDone: [DamageDone, { showStatistic: true }],
    abilityTracker: AbilityTracker,

    // Features
    activeTargets: ActiveTargets,
    dynamicHaste: DynamicHaste,
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
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

    // Legendaries:
    dualDetermination: DualDetermination,
    skysecs: SkysecsHold,
    luffaWrappings: LuffaWrappings,
    furyOfNature: FuryOfNature,

    // Sets
    tier21_2p: Tier21_2P,
    tier21_4p: Tier21_4P,
  };
}

export default CombatLogParser;
