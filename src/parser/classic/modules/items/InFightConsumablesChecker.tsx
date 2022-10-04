import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';

class InFightConsumablesChecker extends Analyzer {
  get ConsumableIds(): number[] {
    return [];
  }

  get CooldownTime(): number {
    return 6000;
  }

  consumablesUsed = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.consumableUsed);
  }

  consumableUsed(event: CastEvent) {
    const spellId = event.ability.guid;

    if (this.ConsumableIds.includes(spellId)) {
      this.consumablesUsed += 1;
    }
  }
}

export default InFightConsumablesChecker;
