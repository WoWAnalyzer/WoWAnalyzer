import { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import SepsisDebuff from './SepsisDebuff';

export default interface SepsisBuff extends Omit<SepsisDebuff, 'applyEvent'> {
  applyEvent: ApplyBuffEvent;
  consumeCast: CastEvent | undefined;
}
