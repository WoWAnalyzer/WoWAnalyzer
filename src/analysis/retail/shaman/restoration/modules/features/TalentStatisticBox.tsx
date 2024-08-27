import { Trans } from '@lingui/macro';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer from 'parser/core/Analyzer';
import StatisticsListBox, { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import Ascendance from '../talents/Ascendance';
import CloudburstTotem from '../talents/CloudburstTotem';
import Deluge from '../talents/Deluge';
import Downpour from '../talents/Downpour';
import EarthenWallTotem from '../talents/EarthenWallTotem';
import HighTide from '../talents/HighTide';
import NaturesGuardian from '../talents/NaturesGuardian';
import Torrent from '../talents/Torrent';
import Undulation from '../talents/Undulation';
import UnleashLife from '../talents/UnleashLife';
import Wellspring from '../talents/Wellspring';
import PrimordialWave from '../talents/PrimordialWave';
import PrimalTideCore from '../talents/PrimalTideCore';
import { EarthShield } from 'analysis/retail/shaman/shared';
import WavespeakersBlessing from '../talents/WavespeakersBlessing';
import AncestralReach from '../talents/AncestralReach';
import Tidewaters from '../talents/Tidewaters';

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
    primordialWave: PrimordialWave,
    primalTideCore: PrimalTideCore,
    earthShield: EarthShield,
    wavespeakersBlessing: WavespeakersBlessing,
    ancestralReach: AncestralReach,
    tidewaters: Tidewaters,
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
  protected primordialWave!: PrimordialWave;
  protected primalTideCore!: PrimalTideCore;
  protected earthShield!: EarthShield;
  protected wavespeakersBlessing!: WavespeakersBlessing;
  protected ancestralReach!: AncestralReach;
  protected tidewaters!: Tidewaters;

  buildTalentList() {
    const talentList = [];
    if (this.selectedCombatant.hasTalent(TALENTS.TORRENT_TALENT)) {
      talentList.push(this.torrent.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.UNLEASH_LIFE_TALENT)) {
      talentList.push(this.unleashLife.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.UNDULATION_TALENT)) {
      talentList.push(this.undulation.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.DELUGE_TALENT)) {
      talentList.push(this.deluge.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.EARTHEN_WALL_TOTEM_TALENT)) {
      talentList.push(this.earthenWallTotem.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.NATURES_GUARDIAN_TALENT)) {
      talentList.push(this.naturesGuardian.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.CLOUDBURST_TOTEM_TALENT)) {
      talentList.push(this.cloudburstTotem.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.HIGH_TIDE_TALENT)) {
      talentList.push(this.highTide.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.WELLSPRING_TALENT)) {
      talentList.push(this.wellspring.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_RESTORATION_TALENT)) {
      talentList.push(this.ascendance.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT)) {
      talentList.push(this.primordialWave.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.PRIMAL_TIDE_CORE_TALENT)) {
      talentList.push(this.primalTideCore.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.EARTH_SHIELD_TALENT)) {
      talentList.push(this.earthShield.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.WAVESPEAKERS_BLESSING_TALENT)) {
      talentList.push(this.wavespeakersBlessing.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.ANCESTRAL_REACH_TALENT)) {
      talentList.push(this.ancestralReach.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.TIDEWATERS_TALENT)) {
      talentList.push(this.tidewaters.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.DOWNPOUR_TALENT)) {
      talentList.push(this.downpour.subStatistic());
    }
    const sortedTalentList = talentList.sort(
      (a, b) => parseFloat(b.props.value) - parseFloat(a.props.value),
    );
    return sortedTalentList;
  }

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
        position={STATISTIC_ORDER.CORE(5)}
        bodyStyle={{}} // idk
      >
        <div style={{ borderBottom: 0, marginBottom: 0, paddingBottom: 0 }} />
        {this.buildTalentList()}
      </StatisticsListBox>
    );
  }
}

export default TalentStatisticBox;
