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

export default abstract class SplinteredElements extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  protected haste!: Haste;
  protected hasteGain: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.isActive();
    if (!this.active) {
      return;
    }

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
    const castEvent = GetRelatedEvent<CastEvent>(event, SPLINTERED_ELEMENTS_LINK);
    if (!castEvent) {
      console.error(
        'Event link error - Primordial Wave is missing a link to a related cast. This could be a bug or the buff timed out.',
      );
      return;
    }
    const damageEvents = GetRelatedEvents(
      castEvent,
      SPLINTERED_ELEMENTS_LINK,
      (e) => e.type === EventType.Damage,
    );
    if (!damageEvents) {
      console.error(
        `Event link error - ${castEvent.ability.name} is missing related damage events`,
      );
      return;
    }
    this.hasteGain = this.getGainedHaste(damageEvents.length);
    this.haste._applyHasteGain(event, this.hasteGain);
  }

  /**
   * @param hitCount number of linked damage events related to the cast of primordial wave
   * @returns the haste percentage gained by the splintered elements buff
   */
  abstract getGainedHaste(hitCount: number): number;

  /**
   * Returns whether the module should be active or not
   */
  abstract isActive(): boolean;

  onRemoveSplinteredElements(event: RemoveBuffEvent) {
    this.haste._applyHasteLoss(event, this.hasteGain);
  }
}
