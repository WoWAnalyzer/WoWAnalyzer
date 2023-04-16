import ActiveDruidForm from 'analysis/retail/druid/shared/core/ActiveDruidForm';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import ConvokeSpiritsGuardian from './modules/spells/ConvokeSpiritsGuardian';
import Guide from 'analysis/retail/druid/guardian/Guide';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    abilities: Abilities,
    activeDruidForm: ActiveDruidForm,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    // activeTargets: ActiveTargets,
    // goreProcs: Gore,
    // galacticGuardianProcs: GalacticGuardian,
    // guardianOfEluneProcs: GuardianOfElune,
    // ironFurGoEProcs: IronFurGoEProcs,
    // frenziedRegenGoEProcs: FrenziedRegenGoEProcs,
    // rageWasted: RageWasted,

    // Spells
    convokeSpirits: ConvokeSpiritsGuardian,
    // ironFur: IronFur,
    // thrash: Thrash,
    // moonfire: Moonfire,
    // pulverize: Pulverize,
    // frenziedRegeneration: FrenziedRegeneration,
    // earthwarden: Earthwarden,
    // incarnation: Incarnation,
  };

  static guide = Guide;
}

export default CombatLogParser;
