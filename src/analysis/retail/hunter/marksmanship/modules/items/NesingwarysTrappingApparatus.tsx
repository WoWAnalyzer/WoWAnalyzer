import RapidFire from 'analysis/retail/hunter/marksmanship/modules/spells/RapidFire';
import SteadyShot from 'analysis/retail/hunter/marksmanship/modules/spells/SteadyShot';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Whenever a trap is triggered, gain 45 Focus and increase all Focus gained by 100% for 5 sec.
 *
 * Example log:
 *
 */
class NesingwarysTrappingApparatus extends Analyzer {
  static dependencies = {
    rapidFire: RapidFire,
    steadyShot: SteadyShot,
  };

  focusGained: number = 0;
  focusWasted: number = 0;

  protected rapidFire!: RapidFire;
  protected steadyShot!: SteadyShot;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.NESINGWARYS_TRAPPING_APPARATUS_EFFECT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.resourcechange
        .by(SELECTED_PLAYER)
        .spell(SPELLS.NESINGWARYS_TRAPPING_APPARATUS_ENERGIZE),
      this.onEnergize,
    );
  }

  onEnergize(event: ResourceChangeEvent) {
    this.focusGained += event.resourceChange;
    this.focusWasted += event.waste;
  }

  get effectiveFocus() {
    return formatNumber(
      this.steadyShot.additionalFocusFromNesingwary + this.rapidFire.additionalFocusFromNesingwary,
    );
  }

  get possibleFocus() {
    return formatNumber(
      this.steadyShot.possibleAdditionalFocusFromNesingwary +
        this.rapidFire.possibleAdditionalFocusFromNesingwary,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spellId={SPELLS.NESINGWARYS_TRAPPING_APPARATUS_EFFECT.id}>
          <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink /> {this.focusGained}/
          {this.focusWasted + this.focusGained} <small>Focus gained immediately</small>
          <br />
          <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink /> {this.effectiveFocus}/
          {this.possibleFocus} <small>Focus gained from generators</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NesingwarysTrappingApparatus;
