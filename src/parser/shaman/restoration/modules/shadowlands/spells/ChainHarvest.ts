
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';

import COVENANTS from 'game/shadowlands/COVENANTS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import RestorationAbilityTracker from '../../core/RestorationAbilityTracker';

const cooldownDecrease = 5000;


/**
 * CD is reduced by crits
 */

class ChainHarvest extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: RestorationAbilityTracker,
  };

  protected spellUsable!: SpellUsable;
  protected abilityTracker!: RestorationAbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHAIN_HARVEST), this._onHeal);
  }

  _onHeal(event: HealEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    this.spellUsable.reduceCooldown(SPELLS.CHAIN_HARVEST.id, cooldownDecrease);
  }
}

export default ChainHarvest;

