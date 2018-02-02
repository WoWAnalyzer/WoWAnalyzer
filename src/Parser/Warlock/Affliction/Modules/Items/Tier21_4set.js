import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import { formatNumber, formatPercentage } from 'common/format';

import ItemDamageDone from 'Main/ItemDamageDone';

const AFFECTED_ABILITIES = [
  SPELLS.AGONY.id,
  SPELLS.CORRUPTION_DEBUFF.id,
  SPELLS.SIPHON_LIFE_TALENT.id,
];
const DAMAGE_BONUS = 0.15;

// When you cast Unstable Affliction or Seed of Corruption, all targets within 60 yards suffering from your Agony take 15% increased damage from your Corruption and Agony for 8 sec.
class Tier21_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  _bonusDamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.WARLOCK_AFFLI_T21_4P_BONUS.id);
  }

  on_byPlayer_damage(event) {
    const id = event.ability.guid;
    if (!AFFECTED_ABILITIES.includes(id)) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.WARLOCK_AFFLI_T21_4P_DEBUFF.id, event.timestamp)) {
      return;
    }
    this._bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.WARLOCK_AFFLI_T21_4P_DEBUFF.id) / this.owner.fightDuration;
  }

  item() {
    return {
      id: `spell-${SPELLS.WARLOCK_AFFLI_T21_4P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.WARLOCK_AFFLI_T21_4P_BONUS.id} />,
      title: <SpellLink id={SPELLS.WARLOCK_AFFLI_T21_4P_BONUS.id} />,
      result: (<Wrapper>
        {formatPercentage(this.uptime)} % uptime on <SpellLink id={SPELLS.WARLOCK_AFFLI_T21_4P_DEBUFF.id} icon/> <br />
        <dfn data-tip={`${formatNumber(this._bonusDamage)} bonus damage`}>
          <ItemDamageDone amount={this._bonusDamage} />
        </dfn>
      </Wrapper>),
    };
  }
}
export default Tier21_4set;
