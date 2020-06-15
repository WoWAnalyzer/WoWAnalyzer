import { EventType } from 'parser/core/Events';

/**
 * Returns the current stacks on a given event
 * @param event
 */
export function currentStacks(event: any) {
  switch (event.type) {
    case EventType.RemoveBuff || EventType.RemoveDebuff:
      return 0;
    case EventType.ApplyBuff || EventType.ApplyDebuff:
      return 1;
    case EventType.ApplyBuffStack || EventType.RemoveBuffStack || EventType.ApplyDebuffStack || EventType.RemoveDebuffStack:
      return event.stack;
    default:
      return null;
  }
}
