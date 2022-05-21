import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';

class BuffTracker extends Analyzer {

  activeBuffs: Set<number> = new Set<number>();

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER),
      this._applyBuff,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER),
      this._applyBuffStack,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER),
      this._removeBuff,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER),
      this._removeBuffStack,
    );

    // when you die you lose all buffs 
    this.addEventListener(
      Events.death.by(SELECTED_PLAYER),
      this.removeAllBuffs,
    )
  }

  _applyBuff(event: ApplyBuffEvent) {
    this.activeBuffs.add(event.ability.guid);
  }

  _applyBuffStack(event: ApplyBuffStackEvent) {
    this.activeBuffs.add(event.ability.guid);
  }

  _removeBuff(event: RemoveBuffEvent) {
    this.activeBuffs.delete(event.ability.guid);
  }

  _removeBuffStack(event: RemoveBuffStackEvent) {
    this.activeBuffs.delete(event.ability.guid);
  }

  getSpellId(spell: number | Spell): number {
    let spellId = spell;
    const spellObj = spell as Spell;
    if (spellObj.id) {
      spellId = spellObj.id;
    }
    return spellId as number;
  }

  hasBuff(buff: number | Spell): boolean {
    return this.activeBuffs.has(this.getSpellId(buff));
  }

  addBuff(buff: number | Spell): void {
    this.activeBuffs.add(this.getSpellId(buff));
  }

  addBuffs(buffs: number[] | Spell[]): void {
    buffs.forEach(buff => this.addBuff(buff)); 
  }

  removeBuff(buff: number | Spell): void {
    this.activeBuffs.delete(this.getSpellId(buff));
  }

  removeBuffs(buffs: number[] | Spell[]): void {
    buffs.forEach(buff => this.removeBuff(buff));
  }

  removeAllBuffs() {
    this.activeBuffs.clear();
  }
}

export default BuffTracker;
