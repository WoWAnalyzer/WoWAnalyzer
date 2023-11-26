import { ApplyDebuffEvent } from 'parser/core/Events';

export default interface SepsisDebuff {
  applyEvent: ApplyDebuffEvent;
  timeRemainingOnRemoval: number;
  start: number;
  end?: number;
}
