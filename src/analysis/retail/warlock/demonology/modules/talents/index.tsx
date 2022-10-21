import Analyzer from 'parser/core/Analyzer';
import StatisticsListBox, { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import BilescourgeBombers from './BilescourgeBombers';
import DemonicCalling from './DemonicCalling';
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
    netherPortal: NetherPortal,
  } as const;

  protected dreadlash!: Dreadlash;
  protected demonicStrength!: DemonicStrength;
  protected bilescourgeBombers!: BilescourgeBombers;
  protected demonicCalling!: DemonicCalling;
  protected powerSiphon!: PowerSiphon;
  protected doom!: Doom;
  protected fromTheShadows!: FromTheShadows;
  protected soulStrike!: SoulStrike;
  protected summonVilefiend!: SummonVilefiend;
  protected soulConduit!: SoulConduit;
  protected innerDemons!: InnerDemons;
  protected grimoireFelguard!: GrimoireFelguard;
  protected sacrificedSouls!: SacrificedSouls;
  protected netherPortal!: NetherPortal;

  statistic() {
    return (
      <StatisticsListBox
      position={STATISTIC_ORDER.CORE(4)} 
      title="Talents"
      tooltip="This provides an overview of the damage contributions of various talents. This isn't meant as a way to 1:1 evaluate talents, as some talents bring other strengths to the table than pure damage."
      bodyStyle={{}}>
        {Object.keys(TalentStatisticBox.dependencies)
          .map((name) => this[name as keyof typeof TalentStatisticBox.dependencies])
          .filter((module) => module.active && module.statistic)
          .map((module) => module.statistic())}
      </StatisticsListBox>
    );
  }
}

export default TalentStatisticBox;
