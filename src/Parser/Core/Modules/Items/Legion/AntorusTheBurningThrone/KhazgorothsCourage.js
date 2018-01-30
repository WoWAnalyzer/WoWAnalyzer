import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';
import { calculateSecondaryStatDefault } from 'common/stats';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Khaz'Goroths Courage -
 * Equip: Your damaging attacks have a chance to make your weapon glow hot with the fire of Khaz'goroth's forge, causing your autoattacks to do (1 * Mainhand weapon base speed * 46809) additional Fire damage for 12 sec.
 * When empowered by the Pantheon, your Critical Strike, Haste, Mastery, or Versatility is increased by 4219 for 15 sec. Khaz'goroth always empowers your highest stat.
 */
class KhazgorothsCourage extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,

  };

  damageProcs = 0;
  pantheonProcs = 0;
  damage = 0;
  uptime = 0;
  secondaryRating = 0;
  activeBuffStatName = 'none'

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.KHAZGOROTHS_COURAGE.id);
    if (this.active) {
      const itemDetails = this.combatants.selected.getItem(ITEMS.KHAZGOROTHS_COURAGE.id);
      this.secondaryRating = calculateSecondaryStatDefault(940, 4219, itemDetails.itemLevel);
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.WORLDFORGERS_FLAME_BUFF.id) {
      this.damageProcs += 1;
    }
    if (spellId === SPELLS.KHAZGOROTHS_SHAPING.id) {
      this.pantheonProcs++;
      const highestSecondaryStat = this.highestSecondaryStat;
      this.activeBuffStatName = highestSecondaryStat;
      this._makeStatChange(this.secondaryRating, highestSecondaryStat, event);
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.WORLDFORGERS_FLAME_BUFF.id) {
      this.damageProcs += 1;
    }
    if (spellId === SPELLS.KHAZGOROTHS_SHAPING.id) {
      this.pantheonProcs++;
      const highestSecondaryStat = this.highestSecondaryStat;
      if(this.activeBuffStatName !== highestSecondaryStat){
        this._makeStatChange(0 - this.secondaryRating, this.activeBuffStatName, event);
        this.activeBuffStatName = highestSecondaryStat;
        this._makeStatChange(this.secondaryRating, highestSecondaryStat, event);
      }
    }
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.KHAZGOROTHS_SHAPING.id) {
      return;
    }
    this._makeStatChange(0 - this.secondaryRating, this.activeBuffStatName, event);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.WORLDFORGERS_FLAME_DAMAGE.id) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  get highestSecondaryStat(){
    const haste = this.statTracker.currentHasteRating;
    const crit = this.statTracker.currentCritRating;
    const mastery = this.statTracker.currentMasteryRating;
    const versatility = this.statTracker.currentVersatilityRating;
    if(haste >= crit && haste >= mastery && haste >= versatility){
      return 'haste';
    } else if(crit >= mastery && crit >= versatility){
      return 'crit';
    } else if(mastery >= versatility){
      return 'mastery';
    } else{
      return 'versatility';
    }
  }

  _makeStatChange(ratingChange, statName, eventReason) {
    let statChangeObj;
    if(statName === 'haste'){
      statChangeObj = { 'haste': ratingChange };
    } else if(statName === 'crit'){
      statChangeObj = { 'crit': ratingChange };
    } else if(statName === 'mastery'){
      statChangeObj = { 'mastery': ratingChange };
    } else{
      statChangeObj = { 'versatility': ratingChange };
    }
    this.statTracker.forceChangeStats(statChangeObj, eventReason);
  }

  item() {
    const uptimePercent = this.combatants.selected.getBuffUptime(SPELLS.KHAZGOROTHS_SHAPING.id) / this.owner.fightDuration;
    return {
      item: ITEMS.KHAZGOROTHS_COURAGE,
      result: (
        <Wrapper>
          <dfn data-tip={`Procced the damage buff <b>${this.damageProcs}</b> times.`}>
            <ItemDamageDone amount={this.damage} />
          </dfn><br />
          <dfn data-tip={`Procced the pantheon buff <b>${this.pantheonProcs}</b> times.`}>
            {formatPercentage(uptimePercent)} % uptime on Khaz'goroths Shaping
          </dfn>
        </Wrapper>
      ),
    };
  }
}

export default KhazgorothsCourage;
