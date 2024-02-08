import EventsNormalizer from 'parser/core/EventsNormalizer';
import { Options } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import {
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import { isPresent } from 'common/typeGuards';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { ECHOES_OF_WRATH_DURATION } from 'analysis/retail/paladin/retribution/modules/dragonflight/ZealousPyreknightsArdor/constants';

const ECHOES_OF_WRATH_BUFFER = 500; // less than minimum GCD

export default class ZealousPyreknightsArdorEchoesOfWrathNormalizer extends EventsNormalizer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T31);
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];

    let echoesOfWrathActiveSince: number | null = null;
    events.forEach((event, idx: number) => {
      fixedEvents.push(event);

      // if Echoes of Wrath is still active 12s after becoming active, deactivate it
      if (this.shouldEchoesOfWrathBeRemoved(event, echoesOfWrathActiveSince)) {
        fixedEvents.push(
          this.fabricateEchoesOfWrathRemoveBuffAtTimestamp(
            echoesOfWrathActiveSince + ECHOES_OF_WRATH_DURATION,
          ),
        );
        echoesOfWrathActiveSince = null;
      }

      if (this.isWrathfulSanctionDamage(event)) {
        if (this.shouldRefreshEchoesOfWrathBuff(event, echoesOfWrathActiveSince)) {
          fixedEvents.push(this.fabricateEchoesOfWrathRefreshBuff(event));
        } else {
          fixedEvents.push(this.fabricateEchoesOfWrathApplyBuff(event));
        }
        echoesOfWrathActiveSince = event.timestamp;
      }

      if (
        (this.isFinalVerdictCast(event) || this.isDivineStormCast(event)) &&
        isPresent(echoesOfWrathActiveSince)
      ) {
        fixedEvents.push(this.fabricateEchoesOfWrathRemoveBuff(event));
        echoesOfWrathActiveSince = null;
      }
    });

    return fixedEvents;
  }

  private fabricateEchoesOfWrathApplyBuff(event: DamageEvent): ApplyBuffEvent {
    return {
      __fabricated: true,
      type: EventType.ApplyBuff,
      timestamp: event.timestamp,
      ability: {
        name: SPELLS.ECHOES_OF_WRATH.name,
        guid: SPELLS.ECHOES_OF_WRATH.id,
        abilityIcon: SPELLS.ECHOES_OF_WRATH.icon,
        type: MAGIC_SCHOOLS.ids.HOLY,
      },
      sourceID: event.sourceID,
      sourceIsFriendly: true,
      targetID: event.sourceID ?? 0,
      targetIsFriendly: true,
    };
  }

  private fabricateEchoesOfWrathRefreshBuff(event: DamageEvent): RefreshBuffEvent {
    return {
      __fabricated: true,
      type: EventType.RefreshBuff,
      timestamp: event.timestamp,
      ability: {
        name: SPELLS.ECHOES_OF_WRATH.name,
        guid: SPELLS.ECHOES_OF_WRATH.id,
        abilityIcon: SPELLS.ECHOES_OF_WRATH.icon,
        type: MAGIC_SCHOOLS.ids.HOLY,
      },
      sourceID: event.sourceID,
      sourceIsFriendly: true,
      targetID: event.sourceID ?? 0,
      targetIsFriendly: true,
    };
  }

  private fabricateEchoesOfWrathRemoveBuff(event: AnyEvent): RemoveBuffEvent {
    return {
      __fabricated: true,
      type: EventType.RemoveBuff,
      timestamp: event.timestamp,
      ability: {
        name: SPELLS.ECHOES_OF_WRATH.name,
        guid: SPELLS.ECHOES_OF_WRATH.id,
        abilityIcon: SPELLS.ECHOES_OF_WRATH.icon,
        type: MAGIC_SCHOOLS.ids.HOLY,
      },
      sourceID: this.selectedCombatant.id,
      sourceIsFriendly: true,
      targetID: this.selectedCombatant.id,
      targetIsFriendly: true,
    };
  }

  private fabricateEchoesOfWrathRemoveBuffAtTimestamp(timestamp: number): RemoveBuffEvent {
    return {
      __fabricated: true,
      type: EventType.RemoveBuff,
      timestamp,
      ability: {
        name: SPELLS.ECHOES_OF_WRATH.name,
        guid: SPELLS.ECHOES_OF_WRATH.id,
        abilityIcon: SPELLS.ECHOES_OF_WRATH.icon,
        type: MAGIC_SCHOOLS.ids.HOLY,
      },
      sourceID: this.selectedCombatant.id,
      sourceIsFriendly: true,
      targetID: this.selectedCombatant.id,
      targetIsFriendly: true,
    };
  }

  private shouldEchoesOfWrathBeRemoved(
    event: AnyEvent,
    activeSince: number | null,
  ): activeSince is number {
    return isPresent(activeSince) && event.timestamp - activeSince >= ECHOES_OF_WRATH_DURATION;
  }

  private shouldRefreshEchoesOfWrathBuff(
    event: AnyEvent,
    activeSince: number | null,
  ): activeSince is number {
    return isPresent(activeSince) && event.timestamp - activeSince >= ECHOES_OF_WRATH_BUFFER;
  }

  private isDivineStormCast(event: AnyEvent): event is CastEvent {
    return event.type === EventType.Cast && event.ability.guid === TALENTS.DIVINE_STORM_TALENT.id;
  }

  private isFinalVerdictCast(event: AnyEvent): event is CastEvent {
    return event.type === EventType.Cast && event.ability.guid === TALENTS.FINAL_VERDICT_TALENT.id;
  }

  private isWrathfulSanctionDamage(event: AnyEvent): event is DamageEvent {
    return event.type === EventType.Damage && event.ability.guid === SPELLS.WRATHFUL_SANCTION.id;
  }
}
