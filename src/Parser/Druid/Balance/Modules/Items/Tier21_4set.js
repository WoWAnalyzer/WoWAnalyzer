import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';

const DAMAGE_BONUS = 0.2;

/**
 * Balance Druid Tier21 4set
 * Increases the damage of Moonfire and Sunfire for 6 seconds after casting Starfall or Starsurge.
 */
class Tier21_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  moonfireDamage = 0;
  sunfireDamage = 0;

  on_initialized() {
	this.active = this.combatants.selected.hasBuff(SPELLS.BALANCE_DRUID_T21_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_damage(event) {
    if (!this.combatants.selected.hasBuff(SPELLS.SOLAR_SOLSTICE.id)){
      return;
    }
    if (event.ability.guid === SPELLS.MOONFIRE_BEAR.id) {
      this.moonfireDamage += getDamageBonus(event, DAMAGE_BONUS);
    }
    if (event.ability.guid === SPELLS.SUNFIRE.id){
      this.sunfireDamage += getDamageBonus(event, DAMAGE_BONUS);
    }
  }

  get uptime(){
    return this.combatants.selected.getBuffUptime(SPELLS.SOLAR_SOLSTICE.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: 'number',
    };
  }
  
  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Your <SpellLink id={SPELLS.BALANCE_DRUID_T21_4SET_BONUS_BUFF.id} /> uptime was {formatPercentage(actual)}%. Try to cast your spenders 4-6 seconds apart to maintain higher uptime.</Wrapper>)
        .icon(SPELLS.BALANCE_DRUID_T21_4SET_BONUS_BUFF.icon)
        .actual(`${formatPercentage(actual)}% uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  item() {
    return {
      id: SPELLS.BALANCE_DRUID_T21_4SET_BONUS_BUFF.id,
      icon: <SpellIcon id={SPELLS.BALANCE_DRUID_T21_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.BALANCE_DRUID_T21_4SET_BONUS_BUFF.id} icon={false} />,
      result: (
        <dfn data-tip={`Damage Breakdown:
          <ul>
            <li>Moonfire: <b>${this.owner.formatItemDamageDone(this.moonfireDamage)}</b></li>
            <li>Sunfire: <b>${this.owner.formatItemDamageDone(this.sunfireDamage)}</b></li>
          </ul>
        `}>
          <Wrapper><ItemDamageDone amount={this.moonfireDamage + this.sunfireDamage} /> <br />
          Uptime: {formatPercentage(this.uptime)}%</Wrapper>
        </dfn>
      ),
    };
  }
}

export default Tier21_4set;
