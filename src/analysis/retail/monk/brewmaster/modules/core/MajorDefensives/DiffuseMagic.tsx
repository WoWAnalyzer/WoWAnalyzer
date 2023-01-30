import talents from 'common/TALENTS/monk';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ReactNode } from 'react';
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

  description(): ReactNode {
    return (
      <>
        <p>
          <SpellLink id={talents.DIFFUSE_MAGIC_TALENT} /> is a strong defensive against{' '}
          <em>Magic damage</em>, but useless against Physical. This makes it a niche spell that is
          sometimes the best spell in your kit, and sometimes not even talented.
        </p>
        <p>
          It also has the ability to transfer some debuffs on you to their caster, but most boss
          abilities are immune.
        </p>
      </>
    );
  }
}
