import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'interface/ItemDamageDone';
import ROLES from 'game/ROLES';
import HIT_TYPES from 'game/HIT_TYPES';
import { formatPercentage } from 'common/format';

class Windfury extends Analyzer {
  swingResets: number = 0;
  swingResetDamage: number = 0;

  lastSwing: number = 0;
  lastParry: boolean = false;

  constructor(options: Options) {
    super(options);

    const active = (this.selectedCombatant.spec.role === ROLES.DPS.MELEE || this.selectedCombatant.spec.role === ROLES.TANK) 
      && Boolean(this.selectedCombatant.mainHand.id)
      && !this.selectedCombatant.offHand.id;
    this.active = active;
    if (!active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE), this._onMelee);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._onParry);
  }

  _onParry(event: DamageEvent) {
    if (![HIT_TYPES.PARRY].includes(event.hitType)) {
      return;
    }

    this.lastParry = true;
  }

  _onMelee(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.WINDFURY_TOTEM_BUFF.id)) {
      return;
    }

    // parries reduce the new swing timer by 40%, ignore melees after parries
    if (this.lastParry) {
      this.lastParry = false
      return;
    }

    const diff = event.timestamp - this.lastSwing;
    if (diff <= 200) {
      this.swingResets += 1;
      this.swingResetDamage += event.amount + (event.absorb || 0);
    }
    this.lastSwing = event.timestamp;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.WINDFURY_TOTEM_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    // we dont know beforehand if the player was in the shamans group
    if (this.uptime === 0) {
      return
    }

    return (
      <Statistic
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
        tooltip={(
          <>
            <strong>{this.swingResets}</strong> windfury procs (totem uptime was {formatPercentage(this.uptime)}%).<br/>
            Tracking windfury at 100% accuracy is impossible as they just appear as additional melee hits, but tracking the time between melee swings and ignoring parry-hasted ones makes it fairly reliable.<br/>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.WINDFURY_TOTEM}>
          <>
            <ItemDamageDone amount={this.swingResetDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default Windfury;
