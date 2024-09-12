import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Module';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { SPLINTERED_ELEMENTS_LINK } from 'analysis/retail/shaman/shared/constants';
import Haste from 'parser/shared/modules/Haste';
import { EnhancementEventLinks } from '../../enhancement/constants';

export default class SplinteredElements extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  protected haste!: Haste;
  protected hasteGain: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SPLINTERED_ELEMENTS_BUFF),
      this.onApplySplinteredElements,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SPLINTERED_ELEMENTS_BUFF),
      this.onRemoveSplinteredElements,
    );
  }

  onApplySplinteredElements(event: ApplyBuffEvent) {
    this.hasteGain = 0;
    // primordial wave boosted cast
    const castEvent = GetRelatedEvent<CastEvent>(event, SPLINTERED_ELEMENTS_LINK);
    if (!castEvent) {
      console.error(
        'Event link error - Primordial Wave is missing a link to a related cast. This could be a bug or the buff timed out.',
      );
      return;
    }
    const damageEvents = GetRelatedEvents(
      castEvent,
      EnhancementEventLinks.LIGHTNING_BOLT_LINK,
      (e) => e.type === EventType.Damage,
    );
    if (!damageEvents) {
      console.error(
        `Event link error - ${castEvent.ability.name} is missing related damage events`,
      );
      return;
    }
    this.hasteGain = (20 + Math.max(damageEvents.length - 2, 0) * 4) / 100;
    this.haste._applyHasteGain(event, this.hasteGain);
  }

  onRemoveSplinteredElements(event: RemoveBuffEvent) {
    this.haste._applyHasteLoss(event, this.hasteGain);
  }
}
