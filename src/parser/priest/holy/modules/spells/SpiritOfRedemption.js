import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import DeathDowntime from 'parser/core/modules/downtime/DeathDowntime';

class SpiritOfRedemption extends Analyzer {
  static dependencies = {
    deathDowntime: DeathDowntime,
  };

  sorStartTime = 0;
  timeSpentRedeeming = 0;
  timeSpendDead = 0;

  get spiritUptime() {
    return this.timeSpentRedeeming;
  }

  get deadTime() {
    return this.deathDowntime.totalDowntime;
  }

  get aliveTime() {
    return this.owner.fightDuration - this.deadTime - this.spiritUptime;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SPIRIT_OF_REDEMPTION_BUFF.id) {
      this.sorStartTime = event.timestamp;
      this.owner.fabricateEvent({
        ...event,
        type: 'cast',
      }, event);
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SPIRIT_OF_REDEMPTION_BUFF.id) {
      this.timeSpentRedeeming += event.timestamp - this.sorStartTime;
    }
  }

}

export default SpiritOfRedemption;
