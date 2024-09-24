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
import Thrash from 'analysis/retail/druid/guardian/modules/spells/Thrash';
import Mangle from 'analysis/retail/druid/guardian/modules/spells/Mangle';
import Moonfire from 'analysis/retail/druid/guardian/modules/spells/Moonfire';
import Swipe from 'analysis/retail/druid/guardian/modules/spells/Swipe';
import Gore from 'analysis/retail/druid/guardian/modules/spells/Gore';
import Lunation from 'analysis/retail/druid/shared/spells/Lunation';
import Berserk from 'analysis/retail/druid/guardian/modules/spells/Berserk';
import Barkskin from 'analysis/retail/druid/guardian/modules/spells/Barkskin';
import RageOfTheSleeper from 'analysis/retail/druid/guardian/modules/spells/RageOfTheSleeper';
import SurvivalInstincts from 'analysis/retail/druid/guardian/modules/spells/SurvivalInstincts';
import Pulverize from 'analysis/retail/druid/guardian/modules/spells/Pulverize';
import Buffs from 'analysis/retail/druid/guardian/modules/Buffs';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    abilities: Abilities,
    buffs: Buffs,
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
    // galacticGuardianProcs: GalacticGuardian,
    // guardianOfEluneProcs: GuardianOfElune,
    // ironFurGoEProcs: IronFurGoEProcs,
    // frenziedRegenGoEProcs: FrenziedRegenGoEProcs,

    // Spells
    convokeSpirits: ConvokeSpiritsGuardian,
    ironfur: Ironfur,
    thrash: Thrash,
    mangle: Mangle,
    moonfire: Moonfire,
    swipe: Swipe,
    gore: Gore,
    berserk: Berserk,
    // pulverize: Pulverize,
    // frenziedRegeneration: FrenziedRegeneration,
    // earthwarden: Earthwarden,

    // Hero Talents
    lunation: Lunation,
  };

  static guide = Guide;
}

export default CombatLogParser;
