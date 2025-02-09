import Analyzer, { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import RiptideTracker from '../../core/RiptideTracker';
import { IMBUEMENT_MASTERY_ATT_NAME } from '../../core/RiptideTracker';

export default class ImbuementMastery extends Analyzer.withDependencies({
  hotTracker: RiptideTracker,
}) {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.IMBUEMENT_MASTERY_TALENT);
    if (!this.active) {
      return;
    }
  }

  statistic() {
    const extraDurationHealing =
      this.deps.hotTracker.getAttribution(IMBUEMENT_MASTERY_ATT_NAME)?.healing || 0;
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.HERO_TALENTS}>
        <TalentSpellText talent={TALENTS.IMBUEMENT_MASTERY_TALENT}>
          <div>
            <ItemHealingDone amount={extraDurationHealing} />{' '}
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}
