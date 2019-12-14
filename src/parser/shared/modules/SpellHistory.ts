import Analyzer from 'parser/core/Analyzer';
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
import Abilities from '../../core/modules/Abilities';

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
    //   {type: 'cast', timestamp, ...},
    //   {type: 'updatespellusable', trigger: 'begincooldown', timestamp, ...},
    //   {type: 'applybuff', timestamp, ...},
    //   {type: 'removebuff', timestamp, ...},
    //   {type: 'updatespellusable', trigger: 'endcooldown', timestamp, ...},
    //   ...
    // ]
  };

  constructor(options: any) {
    super(options);
    this.addEventListener(Events.begincast, this.append);
    this.addEventListener(Events.cast, this.append);
    this.addEventListener(Events.BeginChannel, this.append);
    this.addEventListener(Events.EndChannel, this.append);
    this.addEventListener(Events.applybuff, this.append);
    this.addEventListener(Events.removebuff, this.append);
    this.addEventListener(Events.UpdateSpellUsable, this.append);
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
      | BeginCastEvent
      | CastEvent
      | BeginChannelEvent
      | EndChannelEvent
      | ApplyBuffEvent
      | RemoveBuffEvent
      | UpdateSpellUsableEvent,
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
