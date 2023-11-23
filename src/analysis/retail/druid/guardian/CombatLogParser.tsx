import ActiveDruidForm from 'analysis/retail/druid/shared/core/ActiveDruidForm';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import ConvokeSpiritsGuardian from './modules/spells/ConvokeSpiritsGuardian';
import Guide from 'analysis/retail/druid/guardian/Guide';
import Ironfur from 'analysis/retail/druid/guardian/modules/spells/Ironfur';
import RageTracker from 'analysis/retail/druid/guardian/modules/core/rage/RageTracker';
import RageGraph from 'analysis/retail/druid/guardian/modules/core/rage/RageGraph';
import RageDetails from 'analysis/retail/druid/guardian/modules/core/rage/RageDetails';
import Barkskin from 'analysis/retail/druid/guardian/modules/core/defensives/Barkskin';
import SurvivalInstincts from 'analysis/retail/druid/guardian/modules/core/defensives/SurvivalInstincts';
import RageOfTheSleeper from 'analysis/retail/druid/guardian/modules/core/defensives/RageOfTheSleeper';
import Pulverize from 'analysis/retail/druid/guardian/modules/core/defensives/Pulverize';
import Thrash from 'analysis/retail/druid/guardian/modules/spells/Thrash';
import Mangle from 'analysis/retail/druid/guardian/modules/spells/Mangle';
import Moonfire from 'analysis/retail/druid/guardian/modules/spells/Moonfire';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    abilities: Abilities,
    activeDruidForm: ActiveDruidForm,
    rageTracker: RageTracker,
    rageGraph: RageGraph,
    rageDetails: RageDetails,

    // Defensives
    barkskin: Barkskin,
    survivalInstincts: SurvivalInstincts,
    rageOfTheSleeper: RageOfTheSleeper,
    pulverize: Pulverize,

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
    ironfur: Ironfur,
    thrash: Thrash,
    mangle: Mangle,
    moonfire: Moonfire,
    // pulverize: Pulverize,
    // frenziedRegeneration: FrenziedRegeneration,
    // earthwarden: Earthwarden,
    // incarnation: Incarnation,
  };

  static guide = Guide;
}

export default CombatLogParser;
