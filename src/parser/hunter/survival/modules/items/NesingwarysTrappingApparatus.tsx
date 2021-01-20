import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import Events, { EnergizeEvent } from 'parser/core/Events';
import ResourceIcon from 'common/ResourceIcon';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatNumber } from 'common/format';
import KillCommand from 'parser/hunter/survival/modules/spells/KillCommand';

/**
 * Whenever a trap is triggered, gain 45 Focus and increase all Focus gained by 100% for 5 sec.
 *
 * Example log:
 *
 */
class NesingwarysTrappingApparatus extends Analyzer {

  static dependencies = {
    killCommand: KillCommand,
  };

  focusGained: number = 0;
  focusWasted: number = 0;

  protected killCommand!: KillCommand;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.NESINGWARYS_TRAPPING_APPARATUS_EFFECT.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.NESINGWARYS_TRAPPING_APPARATUS_ENERGIZE), this.onEnergize);
  }

  onEnergize(event: EnergizeEvent) {
    this.focusGained += event.resourceChange;
    this.focusWasted += event.waste;
  }

  get effectiveFocus() {
    return formatNumber(this.killCommand.additionalFocusFromNesingwary);
  }

  get possibleFocus() {
    return formatNumber(this.killCommand.possibleAdditionalFocusFromNesingwary);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.NESINGWARYS_TRAPPING_APPARATUS_EFFECT}>
          <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink /> {this.focusGained}/{this.focusWasted + this.focusGained} <small>Focus gained immediately</small>
          <br />
          <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink /> {this.effectiveFocus}/{this.possibleFocus} <small>Focus gained from generators</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NesingwarysTrappingApparatus;
