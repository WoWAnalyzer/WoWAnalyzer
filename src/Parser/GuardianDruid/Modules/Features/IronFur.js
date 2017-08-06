import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const debug = false;

// There is an issue with the logs right now, not with warcraftlogs where Iron Fur does not show stacks
// Trying to approximate stacks by watching casts while we still have the buff
class IronFur extends Module {

  lastIFProcTime = 0;
  totalIFProcTime = 0;
  BaseIronFurDuration = 6000;

  on_initialized() {
    if(!this.owner.error) {
      const cdTrait = this.owner.selectedCombatant.traitsBySpellId[SPELLS.URSOC_ENDURANCE.id] || 0;
      this.BaseIronFurDuration += cdTrait * 0.5 * 1000;
      debug && console.log('IronFur duration ' + this.BaseIronFurDuration);
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.IRONFUR.id === spellId) {
      this.lastIFProcTime = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.IRONFUR.id === spellId && this.lastIFProcTime > 0) {
      this.totalIFProcTime += event.timestamp - this.lastIFProcTime;
      this.lastIFProcTime = 0;
    }
  }

  on_finished() {
      debug && console.log('Total Ironfur duration ' + this.totalIFProcTime);
  }

}

export default IronFur;

