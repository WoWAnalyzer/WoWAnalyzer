import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import {
  RAPTOR_MONGOOSE_VARIANTS,
  RYLAKSTALKERS_CONFOUNDING_STRIKES_RESET_CHANCE,
} from '@wowanalyzer/hunter-survival/src/constants';
import SpellUsable from '@wowanalyzer/hunter-survival/src/modules/core/SpellUsable';

/**
 * Mongoose Bite and Raptor Strike have a 15% chance to reset the cooldown of Wildfire Bomb.
 * Example log:
 * https://www.warcraftlogs.com/reports/B8ypAt1j2MP4LczJ#fight=11&type=damage-done&source=188
 */
class RylakstalkersConfoundingStrikes extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  damage = 0;
  raptorMongooseCasts = 0;
  spellKnown = this.selectedCombatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id)
    ? SPELLS.MONGOOSE_BITE_TALENT.id
    : SPELLS.RAPTOR_STRIKE.id;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(
      SPELLS.RYLAKSTALKERS_CONFOUNDING_STRIKES_EFFECT,
    );
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(RAPTOR_MONGOOSE_VARIANTS),
      this.onRaptorMongooseCast,
    );
  }

  onRaptorMongooseCast() {
    this.raptorMongooseCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spellId={SPELLS.RYLAKSTALKERS_CONFOUNDING_STRIKES_EFFECT.id}>
          {plotOneVariableBinomChart(
            this.spellUsable.bombResets,
            this.raptorMongooseCasts,
            RYLAKSTALKERS_CONFOUNDING_STRIKES_RESET_CHANCE,
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RylakstalkersConfoundingStrikes;
