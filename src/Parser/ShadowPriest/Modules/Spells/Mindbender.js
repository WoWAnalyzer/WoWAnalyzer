import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

import makeWclUrl from 'common/makeWclUrl';

class Mindbender extends Module {
  _damageDone = 0;
  _mindbenders = {};

  on_initialized() {
    this.active = true;
    this.load();
  }

  get mindbendersAsArray(){
    return Object.keys(this._mindbenders).map(key => this._mindbenders[key]);
  }

  get damageDone(){
    return this._damageDone;
  }

  on_byPlayer_summon(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.MINDBENDER.id) {

      this._mindbenders[event.timestamp] = {
        start: event.timestamp,
        end: event.timestamp + 15000 + (1500 * this.owner.selectedCombatant.traitsBySpellId[SPELLS.FIENDING_DARK_TRAIT.id]),
      };
    }
  }

  load() {
    return fetch(makeWclUrl(`report/tables/damage-done/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      sourceid: this.owner.player.id,
    }))
      .then(response => response.json())
      .then((json) => {
        const mindbenders = json.entries.find(entry => entry.guid === SPELLS.MINDBENDER.id);
        if(mindbenders){
          this._damageDone = mindbenders.total;
        }
      });
  }

}

export default Mindbender;