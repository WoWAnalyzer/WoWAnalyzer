import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ReactNode } from 'react';
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

  description(): ReactNode {
    return (
      <>
        <p>
          <SpellLink id={talents.ZEN_MEDITATION_TALENT} /> is one of the most powerful defensive
          cooldowns in the game, and sports one of the longest cooldowns to compensate. Since the
          cooldown is so long, it is difficult to use effectively without researching a fight's
          damage patterns in advance.
        </p>
        <p>
          <small>
            You will usually want to use <SpellLink id={talents.FUNDAMENTAL_OBSERVATION_TALENT} />{' '}
            if you expect to be using <SpellLink id={talents.ZEN_MEDITATION_TALENT} /> while
            actively tanking, as many bosses can auto-attack while casting.
          </small>
        </p>
      </>
    );
  }
}
