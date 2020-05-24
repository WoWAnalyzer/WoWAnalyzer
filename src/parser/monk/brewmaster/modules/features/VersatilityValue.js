import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import STAT, { getClassNameColor, getName } from 'parser/shared/modules/features/STAT';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';

import MitigationSheet, { makeIcon } from './MitigationSheet';

export default class VersatilityValue extends Analyzer {
  static dependencies = {
    stats: StatTracker,
    sheet: MitigationSheet,
  };

  damageMitigated = 0;
  healing = 0;

  constructor(...args) {
    super(...args);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._onHealVers);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._onDamageTaken);

    this.sheet.registerStat(STAT.VERSATILITY, this.statValue());
  }

  _onHealVers(event) {
    if(event.ability.guid === SPELLS.CELESTIAL_FORTUNE_HEAL.id) {
      return; // CF is unaffected by vers
    }

    const totalHeal = event.amount + (event.overheal || 0) + (event.absorbed || 0);
    const originalHeal = totalHeal / (1 + this.stats.currentVersatilityPercentage);
    this.healing += Math.max(totalHeal - originalHeal - (event.overheal || 0), 0);
  }

  _onDamageTaken(event) {
    if(event.hitType === HIT_TYPES.DODGE) {
      return; // no damage taken, can't do anything
    }
    if(event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return; // vers doesn't reduce stagger damage taken
    }
    if(event.unmitigatedAmount === undefined) {
      this.log('Missing unmitigated amount', event);
      return;
    }
    const alreadyMitigated = event._mitigated || 0;
    // vers mitigation is half the damage/heal %
    const versMitigated = this.sheet._mitigate(event, this.stats.currentVersatilityPercentage / 2, alreadyMitigated);

    this.damageMitigated += versMitigated;
  }

  statValue() {
    const vers = this;
    return {
      priority: 3,
      icon: makeIcon(STAT.VERSATILITY),
      name: getName(STAT.VERSATILITY),
      className: getClassNameColor(STAT.VERSATILITY),
      statName: STAT.VERSATILITY,
      get gain() {
        return [
          { name: 'Damage Mitigated', amount: vers.damageMitigated },
          { name: 'Additional Healing', amount: vers.healing },
        ];
      },
    };
  }
}
