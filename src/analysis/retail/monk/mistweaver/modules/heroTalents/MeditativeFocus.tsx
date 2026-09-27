import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import AncientTeachings from '../spells/AncientTeachings';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class MeditativeFocus extends Analyzer.withDependencies({
  ancientTeachings: AncientTeachings,
}) {
  talent = TALENTS_MONK.MEDITATIVE_FOCUS_TALENT;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(this.talent);
  }

  get healing() {
    return this.deps.ancientTeachings.meditativeFocusHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.MEDITATIVE_FOCUS_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MeditativeFocus;
