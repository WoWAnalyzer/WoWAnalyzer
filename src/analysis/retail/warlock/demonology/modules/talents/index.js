import Analyzer from 'parser/core/Analyzer';
import StatisticsListBox, { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import BilescourgeBombers from './BilescourgeBombers';
import DemonicCalling from './DemonicCalling';
import DemonicConsumption from './DemonicConsumption';
import DemonicStrength from './DemonicStrength';
import Doom from './Doom';
import Dreadlash from './Dreadlash';
import FromTheShadows from './FromTheShadows';
import GrimoireFelguard from './GrimoireFelguard';
import InnerDemons from './InnerDemons';
import NetherPortal from './NetherPortal';
import PowerSiphon from './PowerSiphon';
import SacrificedSouls from './SacrificedSouls';
import SoulConduit from './SoulConduit';
import SoulStrike from './SoulStrike';
import SummonVilefiend from './SummonVilefiend';

class TalentStatisticBox extends Analyzer {
  static dependencies = {
    dreadlash: Dreadlash,
    demonicStrength: DemonicStrength,
    bilescourgeBombers: BilescourgeBombers,
    demonicCalling: DemonicCalling,
    powerSiphon: PowerSiphon,
    doom: Doom,
    fromTheShadows: FromTheShadows,
    soulStrike: SoulStrike,
    summonVilefiend: SummonVilefiend,
    soulConduit: SoulConduit,
    innerDemons: InnerDemons,
    grimoireFelguard: GrimoireFelguard,
    sacrificedSouls: SacrificedSouls,
    demonicConsumption: DemonicConsumption,
    netherPortal: NetherPortal,
  };

  constructor(...args) {
    super(...args);
    // active if at least one module is active and has subStatistic()
    this.active = Object.keys(this.constructor.dependencies)
      .filter((name) => this[name].subStatistic)
      .map((name) => this[name].active)
      .includes(true);
  }

  statistic() {
    return (
      <StatisticsListBox position={STATISTIC_ORDER.CORE(4)} title="Talents">
        {Object.keys(this.constructor.dependencies)
          .map((name) => this[name])
          .filter((module) => module.active && module.subStatistic)
          .map((module) => module.subStatistic())}
      </StatisticsListBox>
    );
  }
}

export default TalentStatisticBox;
