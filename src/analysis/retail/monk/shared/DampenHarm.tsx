import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink, TooltipElement } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  ResourceChangeEvent,
  DrainEvent,
  HealEvent,
} from 'parser/core/Events';
import { ReactNode } from 'react';
import {
  MajorDefensive,
  absoluteMitigation,
} from '../brewmaster/modules/core/MajorDefensives/core';

class DampenHarm extends MajorDefensive {
  currentMaxHP = 0;

  constructor(options: Options) {
    super({ talent: talents.DAMPEN_HARM_TALENT }, options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.updateMaxHP);
    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.updateMaxHP);
    this.addEventListener(Events.drain.to(SELECTED_PLAYER), this.updateMaxHP);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.updateMaxHP);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.damageReduction);
  }

  damageReduction(event: DamageEvent) {
    if (event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return;
    }
    if (!this.defensiveActive) {
      return;
    }
    const maxHP = event.maxHitPoints || this.currentMaxHP;
    if (maxHP === 0) {
      return;
    }

    const h = event.amount || 0;
    const a = event.absorbed || 0;
    const o = event.overkill || 0;
    const hitSize = h + a + o;
    let drdh = 0;
    // given 1 - u / h = 0.2 + 0.3 * u, where u = hit size after all other dr effecs, h = current max hp
    // the following can be then produced algebraically:
    if (hitSize >= maxHP / 2) {
      drdh = 0.5;
    } else {
      drdh = 0.6 - 0.5 * Math.sqrt(0.64 - (6 * hitSize) / (5 * maxHP));
    }

    const mitigatedAmount = absoluteMitigation(event, drdh);
    this.recordMitigation({
      event,
      mitigatedAmount,
    });
  }

  updateMaxHP(event: DamageEvent | ResourceChangeEvent | DrainEvent | HealEvent) {
    this.currentMaxHP = event.maxHitPoints || this.currentMaxHP;
  }

  description(): ReactNode {
    return (
      <>
        <p>
          <SpellLink id={talents.DAMPEN_HARM_TALENT} /> provides{' '}
          <TooltipElement
            hoverable
            content={
              <>
                The damage reduction is based on the amount of damage you'd take <em>after</em>{' '}
                applying Armor, Versatility, and Avoidance, but <em>before</em> reductions from
                absorbs like <SpellLink id={SPELLS.STAGGER} />,{' '}
                <SpellLink id={talents.CELESTIAL_BREW_TALENT} />, or{' '}
                <SpellLink id={talents.LIFE_COCOON_TALENT} />.
              </>
            }
          >
            40-50% damage reduction
          </TooltipElement>{' '}
          in many common scenarios, making it quite powerful. However, it is very weak to{' '}
          <em>damage-over-time</em> effects, which are only reduced by around 20%.
        </p>
        <p>
          This will often be your first choice for planning cooldown usage because of its
          consistent, low cooldown and good damage reduction.
        </p>
      </>
    );
  }
}

export default DampenHarm;
