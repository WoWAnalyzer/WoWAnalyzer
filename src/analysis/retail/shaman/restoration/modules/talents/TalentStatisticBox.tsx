import { Trans } from '@lingui/macro';
import TALENTS from 'common/TALENTS/shaman';
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
        {this.selectedCombatant.hasTalent(TALENTS.TORRENT_TALENT)
          ? this.torrent.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(TALENTS.UNLEASH_LIFE_TALENT)
          ? this.unleashLife.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(TALENTS.UNDULATION_TALENT)
          ? this.undulation.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(TALENTS.DELUGE_TALENT) ? this.deluge.subStatistic() : ''}
        {this.selectedCombatant.hasTalent(TALENTS.EARTHEN_WALL_TOTEM_TALENT)
          ? this.earthenWallTotem.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(TALENTS.NATURES_GUARDIAN_TALENT)
          ? this.naturesGuardian.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(TALENTS.DOWNPOUR_TALENT)
          ? this.downpour.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(TALENTS.CLOUDBURST_TOTEM_TALENT)
          ? this.cloudburstTotem.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(TALENTS.HIGH_TIDE_TALENT)
          ? this.highTide.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(TALENTS.WELLSPRING_TALENT)
          ? this.wellspring.subStatistic()
          : ''}
        {this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_RESTORATION_TALENT)
          ? this.ascendance.subStatistic()
          : ''}
      </StatisticsListBox>
    );
  }
}

export default TalentStatisticBox;
