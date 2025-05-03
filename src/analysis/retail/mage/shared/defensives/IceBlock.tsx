import TALENTS from 'common/TALENTS/mage';
import { Options } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import {
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { SpellLink } from 'interface';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class IceBlock extends MajorDefensiveBuff {
  static dependencies = {
    ...MajorDefensiveBuff.dependencies,
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(TALENTS.ICE_BLOCK_TALENT, buff(TALENTS.ICE_BLOCK_TALENT), options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.ICE_BLOCK_TALENT) &&
      !this.selectedCombatant.hasTalent(TALENTS.ICE_COLD_TALENT);
  }

  description() {
    return (
      <p>
        <SpellLink spell={TALENTS.ICE_BLOCK_TALENT} /> makes you immune to damage.
      </p>
    );
  }

  statistic() {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}

export default IceBlock;
