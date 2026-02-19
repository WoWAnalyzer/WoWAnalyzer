import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, {
  Ability,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  EmpowerEndEvent,
  EventType,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { IRIDESCENCE_MULTIPLIER } from 'analysis/retail/evoker/devastation/constants';
import { SpellLink } from 'interface';
import {
  getConsumeFlameTickEvent,
  getDamageEventsFromCast,
  getFireBreathDebuffEvents,
  getIridescenceConsumeEvent,
  isFromIridescenceConsume,
} from '../normalizers/CastLinkNormalizer';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
import { InformationIcon } from 'interface/icons';

type DamageSources = Record<number, { amount: number; spell: Ability }>;

// TODO:
// Living Flame DoT

/** Casting an empower spell increases the damage of your next 2 spells of the same color by 20% within 10 sec. */
class Iridescence extends Analyzer {
  damageSources: DamageSources = {};

  currentBlueBuffStacks = 0;
  currentRedBuffStacks = 0;

  wastedBlueBuffs = 0;
  wastedRedBuffs = 0;
  overcappedRedBuffs = 0;
  overcappedBlueBuffs = 0;

  fireBreathTargets = new Set<string>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.IRIDESCENCE_TALENT);

    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.IRIDESCENCE_BLUE, SPELLS.IRIDESCENCE_RED]),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removebuffstack
        .by(SELECTED_PLAYER)
        .spell([SPELLS.IRIDESCENCE_BLUE, SPELLS.IRIDESCENCE_RED]),
      this.onRemoveBuffStack,
    );

    this.addEventListener(
      Events.empowerEnd.by(SELECTED_PLAYER).spell([SPELLS.FIRE_BREATH, SPELLS.FIRE_BREATH_FONT]),
      this.onEmpowerEnd,
    );

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.FIRE_BREATH_DOT, SPELLS.CONSUME_FLAME_DAMAGE]),
      this.onDamage,
    );

    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.FIRE_BREATH_DOT),
      this.onRemoveDebuff,
    );

    this.addEventListener(
      Events.applybuffstack
        .by(SELECTED_PLAYER)
        .spell([SPELLS.IRIDESCENCE_BLUE, SPELLS.IRIDESCENCE_RED]),
      this.onApplyBuffStack,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.IRIDESCENCE_BLUE, SPELLS.IRIDESCENCE_RED]),
      this.onApplyBuff,
    );
  }

  private onRemoveBuff(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const castEvent = getIridescenceConsumeEvent(event);

    if (event.ability.guid === SPELLS.IRIDESCENCE_BLUE.id) {
      this.wastedBlueBuffs += castEvent ? 0 : this.currentBlueBuffStacks;
      this.currentBlueBuffStacks = 0;
    } else {
      this.wastedRedBuffs += castEvent ? 0 : this.currentRedBuffStacks;
      this.currentRedBuffStacks = 0;
    }

    if (!castEvent) {
      return;
    }

    this.calculateDamageFromCastEvent(castEvent);
  }

  private onRemoveBuffStack(event: RemoveBuffStackEvent) {
    if (event.ability.guid === SPELLS.IRIDESCENCE_BLUE.id) {
      this.currentBlueBuffStacks = event.stack;
    } else {
      this.currentRedBuffStacks = event.stack;
    }

    const castEvent = getIridescenceConsumeEvent(event);
    if (!castEvent) {
      this.addDebugAnnotation(event, {
        color: BadColor,
        summary: 'Iridescence consumed, but no consume event found',
      });
      return;
    }

    this.calculateDamageFromCastEvent(castEvent);
  }

  private calculateDamageFromCastEvent(event: CastEvent | EmpowerEndEvent) {
    if (event.type === EventType.EmpowerEnd) {
      // Handle this seperately
      return;
    }

    getDamageEventsFromCast(event).forEach((damageEvent) => this.calculateDamage(damageEvent));
  }

  private calculateDamage(event: DamageEvent) {
    if (!this.damageSources[event.ability.guid]) {
      this.damageSources[event.ability.guid] = {
        amount: 0,
        spell: event.ability,
      };
    }

    this.damageSources[event.ability.guid].amount += calculateEffectiveDamage(
      event,
      IRIDESCENCE_MULTIPLIER,
    );
  }

  private onEmpowerEnd(event: EmpowerEndEvent) {
    const consumedIridescence = isFromIridescenceConsume(event);

    let failedToFindTargetAmount = 0;
    const debuffEvents = getFireBreathDebuffEvents(event);

    debuffEvents.forEach((debuffEvent) => {
      const target = encodeEventTargetString(debuffEvent);

      if (!target) {
        failedToFindTargetAmount += 1;
        return;
      }

      if (consumedIridescence) {
        this.fireBreathTargets.add(target);
      } else {
        this.fireBreathTargets.delete(target);
      }
    });

    const details = (
      <div>
        <dl>
          <dt>Active debuff targets</dt>
          <dd>{[...this.fireBreathTargets].join(', ')}</dd>
        </dl>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {debuffEvents.map((e, idx) => {
              const target = encodeEventTargetString(e);
              return (
                <tr key={`${e.timestamp}-${e.type}-${target}-${idx}`}>
                  <td style={{ minWidth: 100 }}>{e.type}</td>
                  <td style={{ textAlign: 'right' }}>{target}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );

    if (failedToFindTargetAmount > 0) {
      this.addDebugAnnotation(event, {
        color: BadColor,
        summary: `Failed to find targets for ${failedToFindTargetAmount} debuff events`,
        details,
      });
    } else if (!consumedIridescence) {
      this.addDebugAnnotation(event, {
        color: OkColor,
        summary: 'Iridescence not consumed',
        details,
      });
    } else {
      this.addDebugAnnotation(event, {
        color: GoodColor,
        summary: 'Iridescence consumed',
        details,
      });
    }
  }

  private onRemoveDebuff(event: RemoveDebuffEvent) {
    const target = encodeEventTargetString(event);

    if (!target) {
      this.addDebugAnnotation(event, {
        color: BadColor,
        summary: 'Unable to find target for RemoveDebuffEvent',
      });
      return;
    }

    if (this.fireBreathTargets.has(target)) {
      // Debuff is removed before the consume tick
      // technically this happens to fb tick too, but it's rare enough to not be worth handling
      const consumeFlameTick = getConsumeFlameTickEvent(event);
      if (consumeFlameTick) {
        this.calculateDamage(consumeFlameTick);
      }
    }

    this.fireBreathTargets.delete(target);
  }

  private onDamage(event: DamageEvent) {
    const target = encodeEventTargetString(event);
    if (!target || !this.fireBreathTargets.has(target)) {
      return;
    }

    this.calculateDamage(event);
  }

  private onApplyBuffStack(event: ApplyBuffStackEvent) {
    if (event.ability.guid === SPELLS.IRIDESCENCE_BLUE.id) {
      this.currentBlueBuffStacks = event.stack;
      this.overcappedBlueBuffs += 1;
    } else {
      this.currentRedBuffStacks = event.stack;
      this.overcappedRedBuffs += 1;
    }
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    if (event.ability.guid === SPELLS.IRIDESCENCE_BLUE.id) {
      this.currentBlueBuffStacks = 2;
    } else {
      this.currentRedBuffStacks = 2;
    }
  }

  statistic() {
    const damageItems = Object.values(this.damageSources)
      .sort((a, b) => b.amount - a.amount)
      .map((source) => ({
        spellId: source.spell.guid,
        valueTooltip: formatNumber(source.amount),
        value: source.amount,
      }));

    const totalAmount = damageItems.reduce((total, item) => total + item.value, 0);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Total damage: {formatNumber(totalAmount)}</li>
            {damageItems.map((item) => (
              <li key={`iridescence-damage-${item.spellId}`}>
                <SpellLink spell={item.spellId} /> damage: {item.valueTooltip}
              </li>
            ))}
          </>
        }
      >
        <TalentSpellText talent={TALENTS.IRIDESCENCE_TALENT}>
          <ItemDamageDone amount={totalAmount} />
          {this.wastedBlueBuffs > 0 && (
            <div>
              <InformationIcon /> {this.wastedBlueBuffs}{' '}
              <small>
                <SpellLink spell={SPELLS.IRIDESCENCE_BLUE} /> wasted
              </small>
            </div>
          )}
          {this.wastedRedBuffs > 0 && (
            <div>
              <InformationIcon /> {this.wastedRedBuffs}{' '}
              <small>
                <SpellLink spell={SPELLS.IRIDESCENCE_RED} /> wasted
              </small>
            </div>
          )}
          {this.overcappedRedBuffs > 0 && (
            <div>
              <InformationIcon /> {this.overcappedRedBuffs}{' '}
              <small>
                <SpellLink spell={SPELLS.IRIDESCENCE_RED} /> overcapped
              </small>
            </div>
          )}
          {this.overcappedBlueBuffs > 0 && (
            <div>
              <InformationIcon /> {this.overcappedBlueBuffs}{' '}
              <small>
                <SpellLink spell={SPELLS.IRIDESCENCE_BLUE} /> overcapped
              </small>
            </div>
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Iridescence;
