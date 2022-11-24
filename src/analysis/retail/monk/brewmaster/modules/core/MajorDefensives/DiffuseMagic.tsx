import talents from 'common/TALENTS/monk';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { absoluteMitigation, MajorDefensive, Mitigation, MitigationSegment } from './core';

export class DiffuseMagic extends MajorDefensive {
  constructor(options: Options) {
    super({ talent: talents.DIFFUSE_MAGIC_TALENT }, options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive || event.ability.type === MAGIC_SCHOOLS.ids.PHYSICAL) {
      return;
    }

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, 0.6),
    });
  }

  mitigationSegments(mit: Mitigation): MitigationSegment[] {
    const segments = super.mitigationSegments(mit);
    segments[0].color = color(MAGIC_SCHOOLS.ids.ARCANE);

    return segments;
  }
}
