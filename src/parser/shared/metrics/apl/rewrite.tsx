import {
  HasAbility,
  AnyEvent,
  EventType,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import Ability from 'parser/core/modules/Ability';
import SpellUsable, { CooldownInfo } from 'parser/shared/modules/SpellUsable';
import { RuleDescription } from './ChecklistRule';
import aplCheck, {
  Apl,
  applicableRule,
  aplProcessesEvent,
  PlayerInfo,
  CheckState,
  spells,
  knownSpells,
  updateCheckState,
  AplTriggerEvent,
} from './index';

function abilityMatches(spellId: number): (ability: Ability) => boolean {
  return (ability) =>
    ability.spell === spellId || (Array.isArray(ability.spell) && ability.spell.includes(spellId));
}

function updateCooldownType(
  ability: Ability,
  abilityState: UpdateSpellUsableEvent | undefined,
): UpdateSpellUsableType {
  if (ability.charges === 1 || !abilityState || !abilityState.isOnCooldown) {
    return UpdateSpellUsableType.BeginCooldown;
  }

  return UpdateSpellUsableType.UseCharge;
}

export type RewrittenEvent = AnyEvent & {
  _originalEvent?: AnyEvent;
  _rewritten?: true;
};

export default function rewrite(
  apl: Apl,
  events: AnyEvent[],
  info: PlayerInfo,
  startingPoint: AnyEvent,
  rewriteDuration: number,
): RewrittenEvent[] {
  const startIndex = events.findIndex((event) => event === startingPoint);
  if (startIndex === -1) {
    throw new Error('Unable to find starting point');
  }

  const priorEvents = events.slice(0, startIndex);
  let endIndex = events
    .slice(startIndex)
    .findIndex((event) => event.timestamp > startingPoint.timestamp + rewriteDuration);
  if (endIndex === -1) {
    endIndex = events.length;
  }

  const rewriteEvents = events.slice(startIndex, startIndex + endIndex);

  const { abilities, applicableSpells } = knownSpells(apl, info);

  const initialState = aplCheck(apl)(priorEvents, info) as CheckState;

  const rewrittenFuture: RewrittenEvent[] = [];

  const process = (state: CheckState, event: AnyEvent): CheckState => {
    rewrittenFuture.push(event);
    return updateCheckState(state, apl, event);
  };

  // casts that were removed and the timestamp of removal. we ignore cooldown updates for these
  const removedCasts: Map<number, number> = new Map();
  // casts that were added. by default, we trust actual casts over our internal
  // spell cd logic---but when we introduce new casts we can no longer do that
  const addedCasts: Set<number> = new Set();
  const futureEndCooldownEvents: UpdateSpellUsableEvent[] = [];
  const shouldForceRewrite = (event: AplTriggerEvent): boolean => {
    const ability = info.abilities.find(abilityMatches(event.ability.guid));
    if (!ability) {
      return false;
    }

    const canonicalSpellId = Array.isArray(ability.spell) ? ability.spell[0] : ability.spell;
    return addedCasts.has(canonicalSpellId);
  };

  const shouldIgnoreEvent = (event: AnyEvent): boolean => {
    return (
      event.type === EventType.UpdateSpellUsable &&
      (removedCasts.has(event.ability.guid) || addedCasts.has(event.ability.guid))
    );
  };

  rewriteEvents.reduce<CheckState>((previousState, event, index) => {
    const eventIndex = startIndex + index;

    if (HasAbility(event) && shouldIgnoreEvent(event)) {
      removedCasts.delete(event.ability.guid);
      return previousState;
    }

    // apply generated restorecharge/endcooldown events
    let state = previousState;
    while (
      futureEndCooldownEvents.length > 0 &&
      futureEndCooldownEvents[0].expectedRechargeTimestamp < event.timestamp
    ) {
      const cdEvent = futureEndCooldownEvents.shift()!;
      state = updateCheckState(state, apl, cdEvent);
    }

    // we look up in the original event array so that lookahead conditions work correctly
    const applicable =
      aplProcessesEvent(event, state, applicableSpells) &&
      applicableRule(apl, abilities, state, events, eventIndex, shouldForceRewrite(event));

    if (applicable) {
      // rewrite the future
      const { rule, availableSpells } = applicable;
      if (spells(rule).some((spell) => spell.id === event.ability.guid)) {
        // correct spell cast. remove the annotation if present
        return process(state, { ...event, meta: undefined });
      } else {
        // TODO: handle resources like energy/rage
        // TODO: handle haste changes---there are haste events that we can key off of
        // incorrect spell, generate a new event. we just pick the first among available spells to cast
        const spell = availableSpells[0];
        const ability = info.abilities.find(abilityMatches(spell.id));
        const oldAbility = info.abilities.find(abilityMatches(event.ability.guid));

        if (!ability || !oldAbility) {
          // we can't rewrite spells without ability entries
          return process(state, event);
        }

        const canonicalSpellId = Array.isArray(ability.spell) ? ability.spell[0] : ability.spell;
        const abilityState = state.abilityState[canonicalSpellId];

        removedCasts.set(event.ability.guid, event.timestamp);
        addedCasts.add(canonicalSpellId);

        const newEvent: RewrittenEvent = {
          ...event,
          ability: {
            guid: spell.id,
            name: spell.name,
            abilityIcon: spell.icon,
            // type is unknown
            type: -1,
          },
          _rewritten: true,
          _originalEvent: event,
          meta: {
            isEnhancedCast: true,
            enhancedCastReason: <RuleDescription rule={rule} />,
          },
        };

        const updatedState = process(state, newEvent);

        if (ability.cooldown === 0) {
          // ability has no cooldown, don't need to fabricate events
          return updatedState;
        }

        const updateType = updateCooldownType(ability, abilityState);

        // TODO: ignore buffs for the old spell, apply buffs for the new spell
        // TODO: handle modrate
        const expectedCooldownDuration = ability.cooldown * 1000;
        const startCooldown: CooldownInfo = {
          overallStart:
            updateType === UpdateSpellUsableType.BeginCooldown
              ? event.timestamp
              : abilityState.overallStartTimestamp,
          chargeStart: event.timestamp,
          currentRechargeDuration: expectedCooldownDuration,
          expectedEnd: event.timestamp + expectedCooldownDuration,
          chargesAvailable:
            updateType === UpdateSpellUsableType.BeginCooldown
              ? ability.charges - 1
              : abilityState.chargesAvailable - 1,
          maxCharges: ability.charges,
        };

        const updateEvent: RewrittenEvent = {
          ...SpellUsable.generateUpdateSpellUsableEvent(
            canonicalSpellId,
            event.timestamp,
            startCooldown,
            updateType,
            info.playerId,
          ),
          _rewritten: true,
        };

        // generate the end cooldown / restore charge event
        const endCooldown: CooldownInfo = {
          ...startCooldown,
          chargesAvailable: startCooldown.chargesAvailable + 1,
          // if this is the final charge, then the end doesn't change. otherwise, refund a charge and provide the cooldown for the next charge
          expectedEnd:
            startCooldown.expectedEnd +
            (startCooldown.chargesAvailable === startCooldown.maxCharges - 1
              ? 0
              : expectedCooldownDuration),
        };

        const endCooldownEvent: RewrittenEvent = {
          ...SpellUsable.generateUpdateSpellUsableEvent(
            canonicalSpellId,
            event.timestamp,
            endCooldown,
            endCooldown.chargesAvailable === endCooldown.maxCharges
              ? UpdateSpellUsableType.EndCooldown
              : UpdateSpellUsableType.RestoreCharge,
            info.playerId,
          ),
          _rewritten: true,
        };

        futureEndCooldownEvents.push(endCooldownEvent);

        return process(updatedState, updateEvent);
      }
    } else {
      // just update state
      return process(state, event);
    }
  }, initialState);

  return rewrittenFuture;
}
