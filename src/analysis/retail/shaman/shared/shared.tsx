import {
  CastEvent,
  BeginCastEvent,
  BeginChannelEvent,
  GlobalCooldownEvent,
  EventType,
  AnyEvent,
} from 'parser/core/Events';

export function getGlobalCooldown(
  event: CastEvent | BeginCastEvent | BeginChannelEvent,
): GlobalCooldownEvent | undefined {
  if (event.type === EventType.BeginCast) {
    return event.castEvent?.globalCooldown;
  } else {
    return event.globalCooldown;
  }
}

export function shouldHaveGlobalCooldown(
  event: AnyEvent,
): event is BeginCastEvent | BeginChannelEvent | BeginCastEvent {
  return (
    event.type === EventType.BeginCast ||
    event.type === EventType.BeginChannel ||
    event.type === EventType.Cast
  );
}
