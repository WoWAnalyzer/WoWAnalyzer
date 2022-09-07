import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticsListBox, { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import Ascendance from './Ascendance';
import CloudburstTotem from './CloudburstTotem';
import Deluge from './Deluge';
import Downpour from './Downpour';
import EarthenWallTotem from './EarthenWallTotem';
import HighTide from './HighTide';
import NaturesGuardian from './NaturesGuardian';
import SurgeOfEarth from './SurgeOfEarth';
import Torrent from './Torrent';
import Undulation from './Undulation';
import UnleashLife from './UnleashLife';
import Wellspring from './Wellspring';

class TalentStatisticBox extends Analyzer {
  static dependencies = {
    torrent: Torrent,
    unleashLife: UnleashLife,
    undulation: Undulation,
    deluge: Deluge,
    earthenWallTotem: EarthenWallTotem,
    surgeOfEarth: SurgeOfEarth,
    naturesGuardian: NaturesGuardian,
    downpour: Downpour,
    cloudburstTotem: CloudburstTotem,
    ascendance: Ascendance,
    wellspring: Wellspring,
    highTide: HighTide,
  };

  protected torrent!: Torrent;
  protected unleashLife!: UnleashLife;
  protected undulation!: Undulation;
  protected deluge!: Deluge;
  protected earthenWallTotem!: EarthenWallTotem;
  protected surgeOfEarth!: SurgeOfEarth;
  protected naturesGuardian!: NaturesGuardian;
  protected downpour!: Downpour;
  protected cloudburstTotem!: CloudburstTotem;
  protected ascendance!: Ascendance;
  protected wellspring!: Wellspring;
  protected highTide!: HighTide;

  statistic() {
    return (
      <StatisticsListBox
        title={<Trans id="shaman.restoration.talentBox.title">Healing Contribution</Trans>}
        tooltip={
          <Trans id="shaman.restoration.talentBox.tooltip">
            The purpose of this is to show the overall HPS impact of each talent. So not only what
            the talent itself did, but also feeding and synergy or interactions with other spells or
            talents. The percentage shown is what you'd lose without the talent, ignoring what you'd
            gain from the other options.
            <br />
            <br />
            <strong>Not Supported:</strong>
            <br />
            Echo of the Elements
          </Trans>
        }
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        bodyStyle={{}} // idk
      >
        <div style={{ borderBottom: 0, marginBottom: 0, paddingBottom: 0 }} />
        {this.selectedCombatant.hasTalent(SPELLS.TORRENT_TALENT.id)
          ? this.torrent.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(SPELLS.UNLEASH_LIFE_TALENT.id)
          ? this.unleashLife.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(SPELLS.UNDULATION_TALENT.id)
          ? this.undulation.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(SPELLS.DELUGE_TALENT.id)
          ? this.deluge.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(SPELLS.EARTHEN_WALL_TOTEM_TALENT.id)
          ? this.earthenWallTotem.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(SPELLS.SURGE_OF_EARTH_TALENT.id)
          ? this.surgeOfEarth.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(SPELLS.NATURES_GUARDIAN_TALENT.id)
          ? this.naturesGuardian.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(SPELLS.DOWNPOUR_TALENT.id)
          ? this.downpour.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id)
          ? this.cloudburstTotem.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(SPELLS.HIGH_TIDE_TALENT.id)
          ? this.highTide.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(SPELLS.WELLSPRING_TALENT.id)
          ? this.wellspring.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_RESTORATION.id)
          ? this.ascendance.subStatistic()
          : ''}
      </StatisticsListBox>
    );
  }
}

export default TalentStatisticBox;
