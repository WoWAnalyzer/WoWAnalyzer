import CoreCombatLogParser from 'parser/core/CombatLogParser';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import ActiveDruidForm from '@wowanalyzer/druid/src/core/ActiveDruidForm';

import Abilities from './modules/Abilities';
import ActiveTargets from './modules/features/ActiveTargets';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import AntiFillerSpam from './modules/features/AntiFillerSpam';
import Checklist from './modules/features/Checklist/Module';
import FrenziedRegenGoEProcs from './modules/features/FrenziedRegenGoEProcs';
import GalacticGuardian from './modules/features/GalacticGuardian';
import Gore from './modules/features/Gore';
import GuardianOfElune from './modules/features/GuardianOfElune';
import IronFurGoEProcs from './modules/features/IronFurGoEProcs';
import MitigationCheck from './modules/features/MitigationCheck';
import RageWasted from './modules/features/RageWasted';
import ConvokeSpiritsGuardian from './modules/shadowlands/ConvokeSpiritsGuardian';
import FrenziedRegeneration from './modules/spells/FrenziedRegeneration';
import IronFur from './modules/spells/IronFur';
import Moonfire from './modules/spells/Moonfire';
import Thrash from './modules/spells/Thrash';
import Earthwarden from './modules/talents/Earthwarden';
import Incarnation from './modules/talents/Incarnation';
import Pulverize from './modules/talents/Pulverize';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    abilityTracker: AbilityTracker,
    abilities: Abilities,
    mitigationCheck: MitigationCheck,
    activeDruidForm: ActiveDruidForm,

    // Features
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,
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

    // Covenants
    convokeSpirits: ConvokeSpiritsGuardian,
  };
}

export default CombatLogParser;
