import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { Ability, AbsorbedEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import HealingValue from 'parser/shared/modules/HealingValue';
import Panel from 'parser/ui/Panel';

import AtonementHealingBreakdown from './AtonementHealingBreakdown';
import { getDamageEvent, hasAtonementDamageEvent } from '../../normalizers/AtonementTracker';

class AtonementHealingDone extends Analyzer {
  total = 0;
  bySource: Record<
    string,
    {
      ability: Ability;
      healing: HealingValue;
    }
  > = {};

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onAbsorb);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  _totalAtonement = HealingValue.empty();

  get totalAtonement() {
    return this._totalAtonement;
  }

  onAbsorb(event: AbsorbedEvent) {
    this.total += event.amount || 0;
  }

  onHeal(event: HealEvent) {
    this.total += event.amount || 0;
    this.total += event.absorbed || 0;

    if (!hasAtonementDamageEvent(event)) {
      return;
    }

    const damageEvent = getDamageEvent(event);
    if (damageEvent) {
      this._addHealing(damageEvent, event.amount, event.absorbed, event.overheal);
    }
  }

  // FIXME: 'byAbility()' added to HealingDone, this should no longer require custom code
  _addHealing(source: DamageEvent, amount = 0, absorbed = 0, overheal = 0) {
    const ability = source.ability;
    const spellId = ability.guid;
    this._totalAtonement = this._totalAtonement.addValues({ regular: amount, absorbed, overheal });
    this.bySource[spellId] = this.bySource[spellId] || {};
    this.bySource[spellId].ability = ability;
    this.bySource[spellId].healing =
      this.bySource[spellId].healing ||
      HealingValue.fromValues({
        regular: amount,
        absorbed,
        overheal,
      });
  }

  statistic() {
    return (
      <Panel
        title="Atonement sources"
        explanation={
          <>
            This shows a breakdown of the damage that caused{' '}
            <SpellLink spell={SPELLS.ATONEMENT_BUFF} /> healing.
          </>
        }
        position={90}
        pad={false}
      >
        <AtonementHealingBreakdown analyzer={this} owner={this.owner} />
      </Panel>
    );
  }
}

export default AtonementHealingDone;
