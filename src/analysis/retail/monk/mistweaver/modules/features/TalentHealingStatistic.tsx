import { Trans } from '@lingui/macro';
import Analyzer from 'parser/core/Analyzer';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticsListBox, { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

import { SaveThemAll } from 'analysis/retail/monk/shared';
import CloudedFocus from '../spells/CloudedFocus';
import DancingMists from '../spells/DancingMists';
import MistyPeaks from '../spells/MistyPeaks';
import RapidDiffusion from '../spells/RapidDiffusion';
import RisingMist from '../spells/RisingMist';
import InvokeChiJi from '../spells/InvokeChiJi';
import InvokeYulon from '../spells/InvokeYulon';
import { TALENTS_MONK } from 'common/TALENTS';
import Upwelling from '../spells/Upwelling';
import Unison from '../spells/Unison';
import MistsOfLife from '../spells/MistsOfLife';

class TalentHealingStatistic extends Analyzer {
  static dependencies = {
    risingMist: RisingMist,
    upwelling: Upwelling,
    mistyPeaks: MistyPeaks,
    invokeChiji: InvokeChiJi,
    invokeYulon: InvokeYulon,
    dancingMists: DancingMists,
    rapidDiffusion: RapidDiffusion,
    saveThemAll: SaveThemAll,
    cloudedFocus: CloudedFocus,
    unison: Unison,
    mistsOfLife: MistsOfLife,
  };
  protected risingMist!: RisingMist;
  protected upwelling!: Upwelling;
  protected mistyPeaks!: MistyPeaks;
  protected invokeChiji!: InvokeChiJi;
  protected invokeYulon!: InvokeYulon;
  protected dancingMists!: DancingMists;
  protected rapidDiffusion!: RapidDiffusion;
  protected saveThemAll!: SaveThemAll;
  protected unison!: Unison;
  protected cloudedFocus!: CloudedFocus;
  protected mistsOfLife!: MistsOfLife;

  buildTalentList() {
    const talentList = [];
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id)) {
      talentList.push(this.invokeChiji.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id)) {
      talentList.push(this.invokeYulon.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT.id)) {
      talentList.push(this.risingMist.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.UPWELLING_TALENT.id)) {
      talentList.push(this.upwelling.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.MISTY_PEAKS_TALENT.id)) {
      talentList.push(this.mistyPeaks.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.DANCING_MISTS_TALENT.id)) {
      talentList.push(this.dancingMists.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.RAPID_DIFFUSION_TALENT.id)) {
      talentList.push(this.rapidDiffusion.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.CLOUDED_FOCUS_TALENT.id)) {
      talentList.push(this.cloudedFocus.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.SAVE_THEM_ALL_TALENT.id)) {
      talentList.push(this.saveThemAll.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.UNISON_TALENT.id)) {
      talentList.push(this.unison.subStatistic());
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.MISTS_OF_LIFE_TALENT.id)) {
      talentList.push(this.mistsOfLife.subStatistic());
    }
    const sortedTalentList = talentList.sort(
      (a, b) => parseFloat(b.props.value) - parseFloat(a.props.value),
    );
    return sortedTalentList;
  }

  statistic() {
    return (
      <StatisticsListBox
        title={<Trans id="monk.mistweaver.talentBox.title">Talent Summary</Trans>}
        tooltip={
          <Trans id="monk.mistweaver.talentBox.tooltip">
            The purpose of this is to show the overall HPS impact of each talent. So not only what
            the talent itself did, but also feeding and synergy or interactions with other spells or
            talents. The percentage shown is what you'd lose without the talent, ignoring what you'd
            gain from the other options.
            <br />
            <br />
            Note: Due to the synergies that exist between certain talents there is some overlap in
            the HPS contribution shown. Detailed breakdowns of each talent's impact can be found in
            the Talents Section.
          </Trans>
        }
        position={STATISTIC_ORDER.CORE(9)}
        category={STATISTIC_CATEGORY.GENERAL}
        bodyStyle={{}}
      >
        <div style={{ borderBottom: 0, marginBottom: 0, paddingBottom: 0 }} />
        {this.buildTalentList()}
      </StatisticsListBox>
    );
  }
}

export default TalentHealingStatistic;
