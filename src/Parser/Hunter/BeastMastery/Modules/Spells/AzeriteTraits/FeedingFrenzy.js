import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import {formatNumber} from 'common/format';
import TraitStatisticBox, {STATISTIC_ORDER} from 'Interface/Others/TraitStatisticBox';
import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';

const feedingFrenzyDamage = traits => Object.values(traits).reduce((obj, rank) => {
  const [damage] = calculateAzeriteEffects(SPELLS.FEEDING_FRENZY.id, rank);
  obj.damage += damage;
  return obj;
}, {
  damage: 0,
});

const MS = 1000;

/**
 * Barbed Shot deals 272 additional damage over its duration,
 * and Frenzy's duration is increased to 9 seconds.
 *
 * Example report: https://www.warcraftlogs.com/reports/m9KrNBVCtDALZpzT#source=5&type=summary&fight=1
 */
class FeedingFrenzy extends Analyzer {
  extraDamage = 0;
  extraBuffUptime = 0;
  lastBSCast = null;
  extraDamagePerTick = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FEEDING_FRENZY.id);
    this.extraDamagePerTick = feedingFrenzyDamage(this.selectedCombatant.traitsBySpellId[SPELLS.FEEDING_FRENZY.id]).damage;
  }

  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.BARBED_SHOT.id){
      if(this.lastBSCast !== null) {
        const delta = event.timestamp - this.lastBSCast;
        if (delta > (8 * MS) && delta < (9 * MS)){
          this.extraBuffUptime += (9 * MS) - delta;
        }
      }
      this.lastBSCast = event.timestamp;
    }
  }

  on_byPlayer_damage(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.BARBED_SHOT.id && event.tick){
      this.extraDamage += this.extraDamagePerTick;
    }

  }

  get extraDPS(){
    return this.extraDamage/(this.owner.fightDuration/MS);
  }

  statistic(){
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.FEEDING_FRENZY.id}
        value={(
          <React.Fragment>
            {formatNumber(this.extraBuffUptime/MS)}s of Extra Frenzy Uptime <br />
            {formatNumber(this.extraDPS)} Extra DPS
          </React.Fragment>
        )}
        tooltip={`Feeding Frenzy caused an additional <b>${formatNumber(this.extraDamagePerTick)}</b> damage per DoT tick for a total of <b>${formatNumber(this.extraDamage)}</b> extra damage.`}
      />
    );
  }
}

export default FeedingFrenzy;
