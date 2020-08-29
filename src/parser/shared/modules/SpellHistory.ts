import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import Channeling from 'parser/shared/modules/Channeling';
import Events, {
  ApplyBuffEvent,
  BeginCastEvent,
  BeginChannelEvent,
  CastEvent,
  EndChannelEvent,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
} from 'parser/core/Events';

import SpellUsable from './SpellUsable';

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
    [spellId: number]: Array<
      | BeginCastEvent
      | CastEvent
      | BeginChannelEvent
      | EndChannelEvent
      | ApplyBuffEvent
      | RemoveBuffEvent
      | UpdateSpellUsableEvent
    >;
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

  constructor(options: any) {
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

  private append(
    event:
      & BeginCastEvent
      & CastEvent
      & BeginChannelEvent
      & EndChannelEvent
      & ApplyBuffEvent
      & RemoveBuffEvent
      & UpdateSpellUsableEvent,
  ) {
    const spellId = event.ability.guid;
    const history = this.getAbility(spellId);
    if (history && event.timestamp > this.owner.fight.start_time) {
      //don't save prephase events in history
      history.push(event);
    }
  }
}

export default SpellHistory;
