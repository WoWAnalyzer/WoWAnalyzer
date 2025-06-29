import TALENTS from 'common/TALENTS/mage';
import { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { SpellLink } from 'interface';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const BASE_MITIGATION = 0.2;
const PHANTHASMAL_IMAGE_MITIGATION = 0.05;

class MirrorImage extends MajorDefensiveBuff {
  hasPhanthasmalImage = this.selectedCombatant.hasTalent(TALENTS.PHANTASMAL_IMAGE_TALENT);
  mitigation = BASE_MITIGATION + (this.hasPhanthasmalImage ? PHANTHASMAL_IMAGE_MITIGATION : 0);

  static dependencies = {
    ...MajorDefensiveBuff.dependencies,
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(TALENTS.MIRROR_IMAGE_TALENT, buff(TALENTS.MIRROR_IMAGE_TALENT), options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MIRROR_IMAGE_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onDamageTaken(event: DamageEvent) {
    if (!this.defensiveActive) {
      return;
    }
    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, this.mitigation),
    });
  }

  description() {
    return (
      <p>
        <SpellLink spell={TALENTS.MIRROR_IMAGE_TALENT} /> reduces the damage you take by 20%.
        {this.hasPhanthasmalImage && (
          <p>
            <SpellLink spell={TALENTS.PHANTASMAL_IMAGE_TALENT} /> increases this mitigation to{' '}
            <strong>{this.mitigation * 100}%</strong>.
          </p>
        )}
      </p>
    );
  }

  statistic() {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}

export default MirrorImage;
