import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import Channeling from 'parser/shared/modules/Channeling';
import Events, {
  EventType,
  ApplyBuffEvent,
  BeginCastEvent,
  BeginChannelEvent,
  CastEvent,
  EndChannelEvent,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
} from 'parser/core/Events';

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
    channeling: Channeling,
  };
  // necessary for the UpdateSpellUsable event
  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;
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
    this.addEventListener<EventType.BeginCast, BeginCastEvent>(Events.begincast.by(SELECTED_PLAYER), this.append);
    this.addEventListener<EventType.Cast, CastEvent>(Events.cast.by(SELECTED_PLAYER), this.append);
    this.addEventListener<EventType.BeginChannel, BeginChannelEvent>(Events.BeginChannel.by(SELECTED_PLAYER), this.append);
    this.addEventListener<EventType.EndChannel, EndChannelEvent>(Events.EndChannel.by(SELECTED_PLAYER), this.append);
    this.addEventListener<EventType.ApplyBuff, ApplyBuffEvent>(Events.applybuff.by(SELECTED_PLAYER), this.append);
    this.addEventListener<EventType.RemoveBuff, RemoveBuffEvent>(Events.removebuff.by(SELECTED_PLAYER), this.append);
    this.addEventListener<EventType.UpdateSpellUsable, UpdateSpellUsableEvent>(Events.UpdateSpellUsable.by(SELECTED_PLAYER), this.append);
  }

  private getAbility(spellId: number) {
    const ability = this.abilities.getAbility(spellId);
    if (!ability) {
      // We're only interested in abilities in Abilities since that's the only place we'll show the spell history, besides we only really want to track *casts* and the best source of info for that is Abilities.
      return null;
    }

    const primarySpellUd = ability.primarySpell.id;
    if (!this.historyBySpellId[primarySpellUd]) {
      this.historyBySpellId[primarySpellUd] = [];
    }
    return this.historyBySpellId[primarySpellUd];
  }

  private append(event: SpellHistoryEvent) {
    const spellId = event.ability.guid;
    const history = this.getAbility(spellId);
    if (history && event.timestamp > this.owner.fight.start_time) {
      //don't save prephase events in history
      history.push(event);
    }
  }
}

export default SpellHistory;
