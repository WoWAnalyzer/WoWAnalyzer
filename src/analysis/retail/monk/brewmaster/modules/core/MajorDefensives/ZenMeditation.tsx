import talents from 'common/TALENTS/monk';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { absoluteMitigation, MajorDefensive } from './core';

export class ZenMeditation extends MajorDefensive {
  constructor(options: Options) {
    super({ talent: talents.ZEN_MEDITATION_TALENT }, options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (this.defensiveActive && !event.sourceIsFriendly) {
      this.recordMitigation({
        event,
        mitigatedAmount: absoluteMitigation(event, 0.6),
      });
    }
  }
}
