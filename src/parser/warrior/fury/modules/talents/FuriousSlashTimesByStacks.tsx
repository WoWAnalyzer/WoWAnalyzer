import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import HIT_TYPES from 'game/HIT_TYPES';
import Events, { DamageEvent, RemoveBuffEvent } from 'parser/core/Events';

const MAX_FURIOUS_SLASH_STACKS = 3;

/**
 furiousSlashTimesByStacks() returns an array with the durations of each FS buff stack
 */
class FuriousSlashTimesByStacks extends Analyzer {
  furiousSlashStacks: number[][] = [];
  lastFuriousSlashStack: number = 0;
  lastFuriousSlashUpdate: number = this.owner.fight.start_time;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FURIOUS_SLASH_TALENT.id);
    this.furiousSlashStacks = Array.from({ length: MAX_FURIOUS_SLASH_STACKS + 1 }, () => []);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FURIOUS_SLASH_TALENT), this.onDamage);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.FURIOUS_SLASH_TALENT_BUFF), this.onRemoveBuff);
  }

  get furiousSlashTimesByStacks() {
    return this.furiousSlashStacks;
  }

  onDamage(event: DamageEvent) {
    if (event.hitType === HIT_TYPES.DODGE || event.hitType === HIT_TYPES.DODGE) {
      return;
    }
    let stack = null;
    if (!this.lastFuriousSlashStack) {
      stack = 1;
    } else {
      if (this.lastFuriousSlashStack < MAX_FURIOUS_SLASH_STACKS) {
        stack = this.lastFuriousSlashStack + 1;
      } else {
        stack = MAX_FURIOUS_SLASH_STACKS;
      }
    }
    this.furiousSlashStacks[this.lastFuriousSlashStack].push(event.timestamp - this.lastFuriousSlashUpdate);
    this.lastFuriousSlashUpdate = event.timestamp;
    this.lastFuriousSlashStack = stack;
  }
  onRemoveBuff(event: RemoveBuffEvent) {
    this.furiousSlashStacks[this.lastFuriousSlashStack].push(event.timestamp - this.lastFuriousSlashUpdate);
    this.lastFuriousSlashUpdate = event.timestamp;
    this.lastFuriousSlashStack = 0;
  }
}

export default FuriousSlashTimesByStacks;
