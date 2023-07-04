import {
  EAGLETALONS_TRUE_FOCUS_COST_REDUCTION,
  EAGLETALONS_TRUE_FOCUS_TRUESHOT_DURATION_INCREASE,
} from 'analysis/retail/hunter/marksmanship/constants';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Trueshot lasts an additional 3.0 sec and reduces the Focus cost of all of your abilities by 25%.
 *
 * https://www.warcraftlogs.com/reports/M9N7LfPBgZXyAFqT#fight=9&type=damage-done&source=15
 */

class EagletalonsTrueFocus extends Analyzer {
  focusSaved: number = 0;
  trueshotDurationIncrease: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EAGLETALONS_TRUE_FOCUS_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT),
      this.onTrueshotCast,
    );
  }

  onCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id)) {
      return;
    }
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.FOCUS.id,
    );
    if (!resource) {
      return;
    }
    this.focusSaved += Math.floor(resource.cost * EAGLETALONS_TRUE_FOCUS_COST_REDUCTION) || 0;
  }

  onTrueshotCast() {
    this.trueshotDurationIncrease += EAGLETALONS_TRUE_FOCUS_TRUESHOT_DURATION_INCREASE;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.EAGLETALONS_TRUE_FOCUS_TALENT}>
          {formatNumber(this.focusSaved)} <small>Focus saved</small>
          <br />
          {formatNumber(this.trueshotDurationIncrease / 1000)}s{' '}
          <small>Trueshot Duration increase</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EagletalonsTrueFocus;
