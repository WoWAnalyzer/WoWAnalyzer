import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

const debug = false;

const DAMAGE_BONUS_PER_CONFLAG = 0.25;

class RoaringBlaze extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  bonusDmg = 0;

  // number of times current Immolate has been buffed by Conflagrate (resets on refresh or remove of Immolate)
  _currentBonus = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.ROARING_BLAZE_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.IMMOLATE_CAST.id) {
      this._currentBonus = 0;
    } else if (spellId === SPELLS.CONFLAGRATE.id) {
      const enemy = this.enemies.getEntity(event);
      if (!enemy || !enemy.hasBuff(SPELLS.IMMOLATE_DEBUFF.id, event.timestamp)) {
        return;
      }
      this._currentBonus += 1;
    }
  }

  on_byPlayer_removedebuff(event) {
    if (event.ability.guid === SPELLS.IMMOLATE_DEBUFF.id) {
      this._currentBonus = 0;
    }
  }

  on_byPlayer_refreshdebuff(event) {
    if (event.ability.guid === SPELLS.IMMOLATE_DEBUFF.id) {
      this._currentBonus = 0;
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.IMMOLATE_DEBUFF.id) {
      // total damage of the tick = base damage * (1.25) ^ number of conflagrates cast while Immolate is up
      // (1.25)^conflag - 1 gives us the total damage multiplier bonus of the base damage, number that getDamageBonus() can work with
      const bonusMultiplier = (1 + DAMAGE_BONUS_PER_CONFLAG) ** this._currentBonus - 1;
      debug && console.log('bonus multiplier', bonusMultiplier);
      this.bonusDmg += calculateEffectiveDamage(event, bonusMultiplier);
      debug && console.log('current bonus dmg', this.bonusDmg);
    }
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.ROARING_BLAZE_TALENT.id}>
            Roaring Blaze Gain
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`Your Roaring Blaze talent contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%).`}>
            {formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS
          </dfn>
        </div>
      </div>
    );
  }
}

export default RoaringBlaze;
