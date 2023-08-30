import { RAGE_SCALE_FACTOR } from 'analysis/retail/warrior/constants';
import { getWindfuryExtraAttack } from 'analysis/retail/warrior/shared/modules/normalizers/WindfuryLinkNormalizer';
import SPELLS from 'common/SPELLS';
import { TALENTS_WARRIOR } from 'common/TALENTS/warrior';
import RESOURCE_TYPES, { Resource } from 'game/RESOURCE_TYPES';
import { AnyEvent, CastEvent, EventType, HasSource, ResourceChangeEvent } from 'parser/core/Events';
import { RECKLESSNESS_INCREASE, WARMACHINE_FURY_INCREASE } from './constants';
import Combatant from 'parser/core/Combatant';

// Auto Attacks
// https://wowpedia.fandom.com/wiki/Rage
const MH_AUTO_ATTACK_RAGE_PS = 1.75;
const OH_AUTO_ATTACK_RAGE_PS = 0.875;

const DEFAULT_SPEED_2H = 3.6;
const DEFAULT_SPEED_1H = 2.6;

/**
 * Goes through all events, and inserts `ResourceChangeEvent`s for rage generation
 * for auto attacks.
 */
export default function generateRageEvents(
  selectedCombatant: Combatant,
  events: AnyEvent[],
): AnyEvent[] {
  const updatedEvents: AnyEvent[] = [];

  const hasRecklessness = selectedCombatant.hasTalent(TALENTS_WARRIOR.RECKLESSNESS_TALENT);

  const using1H = selectedCombatant.hasTalent(TALENTS_WARRIOR.SINGLE_MINDED_FURY_TALENT);
  const speed = using1H ? DEFAULT_SPEED_1H : DEFAULT_SPEED_2H;

  // While it would be nice to look at the speed or slot for weapons, I don't know if that's possible
  // so we'll just make the assumption that they have specced correctly if they are using 1h weapons
  let unbuffedRagePerSwingMH = MH_AUTO_ATTACK_RAGE_PS * speed;
  let unbuffedRagePerSwingOH = OH_AUTO_ATTACK_RAGE_PS * speed;

  if (selectedCombatant.hasTalent(TALENTS_WARRIOR.WAR_MACHINE_FURY_TALENT)) {
    unbuffedRagePerSwingMH += unbuffedRagePerSwingMH * WARMACHINE_FURY_INCREASE;
    unbuffedRagePerSwingOH += unbuffedRagePerSwingOH * WARMACHINE_FURY_INCREASE;
  }

  unbuffedRagePerSwingMH = Math.ceil(unbuffedRagePerSwingMH / RAGE_SCALE_FACTOR);
  unbuffedRagePerSwingOH = Math.ceil(unbuffedRagePerSwingOH / RAGE_SCALE_FACTOR);

  /** `true` if next swing _should_ be with offhand */
  let lastHitWasOffHand = true;
  let maxRage = 100 / RAGE_SCALE_FACTOR;
  let lastRageCount = 0;
  let recklessnessBuff = false;

  // As a side note, Annihilator rage triggers as energize event, so we don't need to worry about it here
  // https://www.warcraftlogs.com/reports/N9bWqMnrakAjZdJB#fight=2&type=resources&source=103&spell=101

  events.forEach((event, index) => {
    // Add this event no matter what
    updatedEvents.push(event);

    let ragePerSwingMH = unbuffedRagePerSwingMH;
    let ragePerSwingOH = unbuffedRagePerSwingOH;

    if (hasRecklessness) {
      if (event.type === EventType.ApplyBuff && event.ability.guid === SPELLS.RECKLESSNESS.id) {
        recklessnessBuff = true;
      } else if (
        event.type === EventType.RemoveBuff &&
        event.ability.guid === SPELLS.RECKLESSNESS.id
      ) {
        recklessnessBuff = false;
      }

      if (recklessnessBuff) {
        ragePerSwingMH = unbuffedRagePerSwingMH * (1 + RECKLESSNESS_INCREASE);
        ragePerSwingOH = unbuffedRagePerSwingOH * (1 + RECKLESSNESS_INCREASE);
      }
    }

    if (HasSource(event) && event.sourceID === selectedCombatant.id) {
      // auto-attack
      if (event.type === EventType.Cast && event.ability.guid === SPELLS.MELEE.id) {
        const rage = _getRage(event);

        const generated = rage == null ? 0 : Math.max(rage?.amount - lastRageCount, 0);
        if (rage != null) {
          maxRage = rage.max;
        }
        const isMax = Math.ceil(rage ? rage.amount : lastRageCount) === Math.ceil(maxRage);

        // Handle windfury
        const extraAttack = getWindfuryExtraAttack(event);
        if (extraAttack) {
          // This is stupid, but if last hit was
          const isOffHand = extraAttack.ability.guid === SPELLS.WINDFURY_EXTRA_ATTACK_OH.id;

          const expectedGenration = isOffHand ? ragePerSwingMH : ragePerSwingOH;

          // We're at max, we've probably wasted rage
          let rageWasted = 0;
          if (isMax) {
            rageWasted = expectedGenration - generated;
          } else {
            rageWasted = 0;
          }

          const newEvent = {
            ...extraAttack,

            type: EventType.ResourceChange,

            __fabricated: true,
            ability: {
              ...extraAttack.ability,
              // Override id to always be mainhand for better tracking
              guid: SPELLS.WINDFURY_EXTRA_ATTACK_MH.id,
            },
            resourceChange: isMax ? expectedGenration : generated,
            resourceChangeType: RESOURCE_TYPES.RAGE.id,
            otherResourceChange: 0,
            waste: rageWasted,
          };

          updatedEvents.push(newEvent as any as ResourceChangeEvent);
        } else {
          // If we're not at max rage, we've generated the full amount, and we can use the
          // full amount to figure out if MH/OH
          const isOffHand =
            // If we are at max rage, we don't know how much the hit would have generated
            // If generated was 0 (probably a miss)
            isMax || generated < 1
              ? !lastHitWasOffHand
              : // If we are not at max rage, the generated value is
                generated < (ragePerSwingMH + ragePerSwingOH) / 2;

          const expectedGenration = isOffHand ? ragePerSwingOH : ragePerSwingMH;

          // We're at max, we've probably wasted rage
          let rageWastedFromAuto = 0;
          if (isMax) {
            rageWastedFromAuto = expectedGenration - generated;
          } else {
            rageWastedFromAuto = 0;
          }
          const newEvent = _coerceCastToResourceChange(
            event,
            isMax ? expectedGenration : generated,
            rageWastedFromAuto,
            RESOURCE_TYPES.RAGE,
          );
          updatedEvents.push(newEvent);

          lastHitWasOffHand = isOffHand;
        }
      }

      if ('classResources' in event) {
        const rage = event.classResources?.find((r) => r.type === RESOURCE_TYPES.RAGE.id);
        if (rage) {
          // Whatever the event, if it tells us the current rage, that helps us figure out
          // auto attack rage
          lastRageCount = rage.amount;
          maxRage = rage.max;
        }
      }
    }
  });
  return updatedEvents;
}

function _getRage(event: AnyEvent) {
  return (
    ('classResources' in event &&
      event.classResources?.find((resource) => resource.type === RESOURCE_TYPES.RAGE.id)) ||
    undefined
  );
}

function _coerceCastToResourceChange(
  event: CastEvent,
  resourceChange: number,
  waste: number,
  resourceType: Resource,
): ResourceChangeEvent {
  const modifiableEvent = structuredClone(event) as any;
  modifiableEvent.type = EventType.ResourceChange;
  // make sure we are saying this is fake
  modifiableEvent.__fabricated = true;
  // clean up cast fields... there is probably a better way to do this like cross referencing a cast event's keys and resource change evnet
  delete modifiableEvent.resourceCost;
  delete modifiableEvent.rawResourceCost;
  delete modifiableEvent.melee;
  // add the fields we need
  modifiableEvent.resourceChange = resourceChange;
  modifiableEvent.resourceChangeType = resourceType.id;
  modifiableEvent.otherResourceChange = 0;
  modifiableEvent.waste = waste;
  modifiableEvent.targetID = event.sourceID;

  return modifiableEvent as ResourceChangeEvent;
}
