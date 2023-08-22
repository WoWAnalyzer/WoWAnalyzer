import TALENTS from 'common/TALENTS/evoker';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { VOLCANISM_ESSENCE_REDUCTION } from '../../constants';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { ResourceLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Soup from 'interface/icons/Soup';

/**
 * Eruption's Essence cost is reduced by 1.
 */
class Volcanism extends Analyzer {
  essenceSaved: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RICOCHETING_PYROCLAST_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ERUPTION_TALENT),
      this.onCast,
    );
  }

  onCast() {
    this.essenceSaved += VOLCANISM_ESSENCE_REDUCTION;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS.VOLCANISM_TALENT}>
          <Soup /> {this.essenceSaved}{' '}
          <small>
            <ResourceLink id={RESOURCE_TYPES.ESSENCE.id} /> saved
          </small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Volcanism;
