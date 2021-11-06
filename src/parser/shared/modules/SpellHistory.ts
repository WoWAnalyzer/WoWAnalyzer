import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  BeginCastEvent,
  BeginChannelEvent,
  CastEvent,
  EndChannelEvent,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Channeling from 'parser/shared/modules/Channeling';

import SpellUsable from './SpellUsable';

type SpellHistoryEvent =
  | BeginCastEvent
  | CastEvent
  | BeginChannelEvent
  | EndChannelEvent
  | ApplyBuffEvent
  | RemoveBuffEvent
  | UpdateSpellUsableEvent;

class SpellHistory extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
    abilityTracker: AbilityTracker,
    channeling: Channeling,
  };
  // necessary for the UpdateSpellUsable event
  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;
  protected abilityTracker!: AbilityTracker;
  // necessary for the channeling events
  protected channeling!: Channeling;

  public historyBySpellId: {
    [spellId: number]: SpellHistoryEvent[];
  } = {
    // This contains the raw event to have all information one might ever need and so that we don't construct additional objects that take their own memory.
    // [spellId]: [
    //   {type: EventType.Cast, timestamp, ...},
    //   {type: EventType.UpdateSpellUsable, trigger: EventType.BeginCooldown', timestamp, ...},
    //   {type: EventType.ApplyBuff, timestamp, ...},
    //   {type: EventType.RemoveBuff, timestamp, ...},
    //   {type: EventType.UpdateSpellUsable, trigger: EventType.EndCooldown', timestamp, ...},
    //   ...
    // ]
  };

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.begincast.by(SELECTED_PLAYER), this.append);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.append);
    this.addEventListener(Events.BeginChannel.by(SELECTED_PLAYER), this.append);
    this.addEventListener(Events.EndChannel.by(SELECTED_PLAYER), this.append);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.append);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER), this.append);
    this.addEventListener(Events.UpdateSpellUsable.by(SELECTED_PLAYER), this.append);
  }

  private getAbility(spellId: number) {
    if (!this.historyBySpellId[spellId]) {
      this.historyBySpellId[spellId] = [];
    }
    return this.historyBySpellId[spellId];
  }

  private append(event: SpellHistoryEvent) {
    const spellId = event.ability.guid;
    const history = this.getAbility(spellId);
    if (history) {
      history.push(event);
    }
  }
}

export default SpellHistory;
