import { Trans } from '@lingui/react/macro';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer from 'parser/core/Analyzer';
import StatisticsListBox, { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import Ascendance from '../talents/Ascendance';
import Deluge from '../talents/Deluge';
import Downpour from '../talents/Downpour';
import NaturesGuardian from '../talents/NaturesGuardian';
import UnleashLife from '../talents/UnleashLife';
import PrimalTideCore from '../talents/PrimalTideCore';
import { EarthShield } from 'analysis/retail/shaman/shared';
import WavespeakersBlessing from '../talents/WavespeakersBlessing';
import AncestralReach from '../talents/AncestralReach';

class TalentStatisticBox extends Analyzer {
  static dependencies = {
    unleashLife: UnleashLife,
    deluge: Deluge,
    naturesGuardian: NaturesGuardian,
    downpour: Downpour,
    ascendance: Ascendance,
    primalTideCore: PrimalTideCore,
    earthShield: EarthShield,
    wavespeakersBlessing: WavespeakersBlessing,
    ancestralReach: AncestralReach,
  };

  protected unleashLife!: UnleashLife;
  protected deluge!: Deluge;
  protected naturesGuardian!: NaturesGuardian;
  protected downpour!: Downpour;
  protected ascendance!: Ascendance;
  protected primalTideCore!: PrimalTideCore;
  protected earthShield!: EarthShield;
  protected wavespeakersBlessing!: WavespeakersBlessing;
  protected ancestralReach!: AncestralReach;

  buildTalentList() {
    const talentList = [];
    if (this.selectedCombatant.hasTalent(TALENTS.NATURES_GUARDIAN_TALENT)) {
      talentList.push(this.naturesGuardian.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_RESTORATION_TALENT)) {
      talentList.push(this.ascendance.subStatistic());
    }

    if (this.selectedCombatant.hasTalent(TALENTS.WAVESPEAKERS_BLESSING_TALENT)) {
      talentList.push(this.wavespeakersBlessing.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS.ANCESTRAL_REACH_TALENT)) {
      talentList.push(this.ancestralReach.subStatistic());
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
