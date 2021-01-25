import React from 'react';

import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Panel from 'parser/ui/Panel';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import HealingValue from 'parser/shared/modules/HealingValue';
import Events, { Ability, AbsorbedEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import { IsPenanceDamageEvent } from '@wowanalyzer/priest-discipline/src/modules/spells/Helper';

import isAtonement from '../core/isAtonement';
import AtonementDamageSource from './AtonementDamageSource';
import AtonementHealingBreakdown from './AtonementHealingBreakdown';
import Penance from '../spells/Penance';

class AtonementHealingDone extends Analyzer {
  static dependencies = {
    atonementDamageSource: AtonementDamageSource,
    penance: Penance,
  };
  total = 0;
  _lastPenanceBoltNumber = 0;
  bySource: Record<string, {
    ability: Ability;
    healing: HealingValue;
    bolts?: HealingValue[];
  }> = {};
  protected atonementDamageSource!: AtonementDamageSource;
  protected penance!: Penance;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onAbsorb);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PENANCE), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  _totalAtonement = new HealingValue();

  get totalAtonement() {
    return this._totalAtonement;
  }

  onAbsorb(event: AbsorbedEvent) {
    this.total += event.amount || 0;
  }

  onDamage(event: DamageEvent) {
    if (IsPenanceDamageEvent(event)) {
      this._lastPenanceBoltNumber = event.penanceBoltNumber;
    }
  }

  onHeal(event: HealEvent) {
    this.total += event.amount || 0;
    this.total += event.absorbed || 0;

    if (!isAtonement(event)) {
      return;
    }

    const sourceEvent = this.atonementDamageSource.event;
    if (sourceEvent) {
      this._addHealing(sourceEvent, event.amount, event.absorbed, event.overheal);
    }
  }

  // FIXME: 'byAbility()' added to HealingDone, this should no longer require custom code
  _addHealing(source: DamageEvent, amount = 0, absorbed = 0, overheal = 0) {
    const ability = source.ability;
    const spellId = ability.guid;
    this._totalAtonement = this._totalAtonement.add(amount, absorbed, overheal);
    this.bySource[spellId] = this.bySource[spellId] || {};
    this.bySource[spellId].ability = ability;
    this.bySource[spellId].healing = (this.bySource[spellId].healing || new HealingValue()).add(amount, absorbed, overheal);

    if (spellId === SPELLS.PENANCE.id) {
      const source = this.bySource[SPELLS.PENANCE.id];
      if (!source.bolts) {
        source.bolts = [];
      }

      if (!source.bolts[this._lastPenanceBoltNumber]) {
        source.bolts[this._lastPenanceBoltNumber] = new HealingValue();
      }
      source.bolts[this._lastPenanceBoltNumber] = source.bolts[this._lastPenanceBoltNumber].add(amount, absorbed, overheal);
    }
  }

  statistic() {
    return (
      <Panel
        title="Atonement sources"
        explanation={(
          <>
            This shows a breakdown of the damage that caused <SpellLink id={SPELLS.ATONEMENT_BUFF.id} /> healing.
          </>
        )}
        position={90}
        pad={false}
      >
        <AtonementHealingBreakdown analyzer={this} owner={this.owner} />
      </Panel>
    );
  }
}

export default AtonementHealingDone;
