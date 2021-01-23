import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import React from 'react';
import Events, { CastEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { EAGLETALONS_TRUE_FOCUS_COST_REDUCTION } from 'parser/hunter/marksmanship/constants';

/**
 * Trueshot also reduces the Focus cost of all of your abilities by 50%.
 */

class EagletalonsTrueFocus extends Analyzer {

  focusSaved = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.EAGLETALONS_TRUE_FOCUS_EFFECT.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id)) {
      return;
    }
    const resource = event.classResources?.find(resource => resource.type === RESOURCE_TYPES.FOCUS.id);
    if (!resource) {
      return;
    }
    this.focusSaved += Math.floor(resource.cost * EAGLETALONS_TRUE_FOCUS_COST_REDUCTION) || 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.EAGLETALONS_TRUE_FOCUS_EFFECT}>
          {this.focusSaved} <small>Focus saved</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EagletalonsTrueFocus;
