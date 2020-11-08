import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Buffs from 'parser/shaman/elemental/modules/Buffs';

import Abilities from 'parser/shaman/elemental/modules/Abilities';

import AlwaysBeCasting from 'parser/shaman/elemental/modules/features/AlwaysBeCasting';

import Aftershock from 'parser/shaman/elemental/modules/talents/Aftershock';
import Ascendance from 'parser/shaman/elemental/modules/talents/Ascendance';
import EarthenRage from 'parser/shaman/elemental/modules/talents/EarthenRage';
import LiquidMagmaTotem from 'parser/shaman/elemental/modules/talents/LiquidMagmaTotem';
import MasterOfTheElements from 'parser/shaman/elemental/modules/talents/MasterOfTheElements';
import PrimalFireElemental from 'parser/shaman/elemental/modules/talents/PrimalFireElemental';
import PrimalStormElemental from 'parser/shaman/elemental/modules/talents/PrimalStormElemental';
import StormElemental from 'parser/shaman/elemental/modules/talents/StormElemental';
import Stormkeeper from 'parser/shaman/elemental/modules/talents/Stormkeeper';
import UnlimitedPower from 'parser/shaman/elemental/modules/talents/UnlimitedPower';
import UnlimitedPowerTimesByStacks from 'parser/shaman/elemental/modules/talents/UnlimitedPowerTimesByStacks';
import SurgeOfPower from 'parser/shaman/elemental/modules/talents/SurgeOfPower';
import Icefury from 'parser/shaman/elemental/modules/talents/Icefury';
import StaticDischarge from 'parser/shaman/elemental/modules/talents/StaticDischarge';
import EchoingShock from 'parser/shaman/elemental/modules/talents/EchoingShock';

import LavaSurge from 'parser/shaman/elemental/modules/core/LavaSurge';
import CancelledCasts from 'parser/shaman/elemental/modules/features/CancelledCasts';
import Checklist from 'parser/shaman/elemental/modules/checklist/Module';

import EarthShield from '../shared/talents/EarthShield';
import SpiritWolf from '../shared/talents/SpiritWolf';
import StaticCharge from '../shared/talents/StaticCharge';
import AnkhNormalizer from '../shared/normalizers/AnkhNormalizer';
import AstralShift from '../shared/spells/AstralShift';
import ElementalBlast from '../shared/talents/ElementalBlast';

//Resources
import MaelstromDetails from '../shared/maelstromchart/MaelstromDetails';
import MaelstromTracker from '../shared/maelstromchart/MaelstromTracker';
import MaelstromTab from '../shared/maelstromchart/MaelstromTab';
import FlameShock from '../shared/spells/FlameShock';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    flameShock: FlameShock,
    lavaSurge: LavaSurge,
    buffs: Buffs,
    cancelledCasts: CancelledCasts,
    alwaysBeCasting: AlwaysBeCasting,

    // Talents
    earthenRage: EarthenRage,
    //staticDischarge: StaticDischarge,
    aftershock: Aftershock,
    //echoingShock: EchoingShock,
    elementalBlast: ElementalBlast,
    spiritWolf: SpiritWolf,
    earthShield: EarthShield,
    staticCharge: StaticCharge,
    masterOfTheElements: MasterOfTheElements,
    stormElemental: StormElemental,
    liquidMagmaTotem: LiquidMagmaTotem,
    surgeOfPower: SurgeOfPower,
    primalFireElemental: PrimalFireElemental,
    primalStormElemental: PrimalStormElemental,
    icefury: Icefury,
    unlimitedPowerTimesByStacks: UnlimitedPowerTimesByStacks,
    unlimitedPower: UnlimitedPower,
    stormkeeper: Stormkeeper,
    ascendance: Ascendance,
    staticDischarge: StaticDischarge,
    echoingShock: EchoingShock,

    maelstromTracker: MaelstromTracker,
    maelstromDetails: MaelstromDetails,
    maelstromTab: MaelstromTab,
    ankhNormalizer: AnkhNormalizer,
    checklist: Checklist,
    astralShift: AstralShift,
  };

}

export default CombatLogParser;
