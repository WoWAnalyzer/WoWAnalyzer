import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const PROC_INTERVAL_MS = 10000;

/**
 * Lady Vashj's Grasp:
 * While Icy Veins is active, you gain 1 charge of Fingers of Frost every 10 sec.
 */
class LadyVashjsGrasp extends Analyzer {
  static dependencies = {
		combatants: Combatants,
	};

  icyVeinsAppliedTimestamp; // the legendary applies its own buff, but it exactly tracks Icy Veins
  procs = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasHands(ITEMS.LADY_VASHJS_GRASP.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ICY_VEINS.id) {
      this.icyVeinsAppliedTimestamp = this.owner.currentTimestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ICY_VEINS.id) {
      this._newProcs();
    }
  }

  on_finished() {
    this._newProcs(); // make sure to count procs gained from Icy Veins that's still going when fight ends
  }

  get procsPerMinute() {
    return this.procs / (this.owner.fightDuration / 60000);
  }

  _newProcs() {
    if(this.icyVeinsAppliedTimestamp) {
      const icyVeinsDuration = this.owner.currentTimestamp - this.icyVeinsAppliedTimestamp;
      const newProcs = Math.floor(icyVeinsDuration / PROC_INTERVAL_MS) + 1; // first proc happens instantly on Icy Veins activation
      this.procs += newProcs;
      this.icyVeinsAppliedTimestamp = undefined;
    }
  }

  item() {
    return {
      item: ITEMS.LADY_VASHJS_GRASP,
      result: `${this.procs} bonus charges / ${this.procsPerMinute.toFixed(1)} PPM`,
    };
  }
}

export default LadyVashjsGrasp;
