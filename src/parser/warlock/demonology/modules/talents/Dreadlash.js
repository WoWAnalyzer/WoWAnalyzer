import React from 'react';

import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

const DREADLASH_BONUS_DAMAGE = 0.25;
const debug = false;

class Dreadlash extends Analyzer {
  _primaryTarget = null;
  cleavedDamage = 0;
  bonusDamage = 0; // only from primary target

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DREADLASH_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.DREADBITE), this.handleDreadbite);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CALL_DREADSTALKERS), this.handleDreadstalkerCast);
  }

  handleDreadbite(event) {
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (this._primaryTarget === target) {
      debug && this.log(`Dreadbite damage on ${target}, primary`);
      this.bonusDamage += calculateEffectiveDamage(event, DREADLASH_BONUS_DAMAGE);
    }
    else {
      debug && this.log(`Dreadbite damage on ${target}, cleaved`);
      this.cleavedDamage += event.amount + (event.absorbed || 0);
    }
  }

  handleDreadstalkerCast(event) {
    this._primaryTarget = encodeTargetString(event.targetID, event.targetInstance);
    debug && this.log(`Dreadstalkers cast on ${this._primaryTarget}`);
  }

  statistic() {
    const total = this.cleavedDamage + this.bonusDamage;
    const dps = total / this.owner.fightDuration * 1000;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="small"
        tooltip={(
          <>
            {formatThousands(total)} bonus damage<br />
            Bonus damage on primary target hits: {formatThousands(this.bonusDamage)} ({this.owner.formatItemDamageDone(this.bonusDamage)})<br />
            Bonus cleaved damage: {formatThousands(this.cleavedDamage)} ({this.owner.formatItemDamageDone(this.cleavedDamage)})
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.DREADLASH_TALENT}>
          {formatNumber(dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(total))} % of total</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Dreadlash;
