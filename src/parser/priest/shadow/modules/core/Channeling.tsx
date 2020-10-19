import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';
import Events, { ApplyDebuffEvent, CastEvent } from 'parser/core/Events';
import Ability from 'parser/core/modules/Ability';
import { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import EventHistory from 'parser/shared/modules/EventHistory';

/**
 * Mind Flay, Mind Sear and Void Torrent don't reveal in the combatlog when channeling begins and ends, this fabricates the required events so that ABC can handle it properly.
 * It also accounts for Dark Thought procs which allow Mind Blast to be cast instantly while channeling Mind Flay or Mind Sear
 */
const CHANNEL_ABILITIES = [ // This used where checks are done for all channeled spriest abilities
  SPELLS.MIND_FLAY,
  SPELLS.MIND_SEAR,
  SPELLS.VOID_TORRENT_TALENT,
];

class Channeling extends CoreChanneling {
  static dependencies = {
    ...CoreChanneling.dependencies,
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(CHANNEL_ABILITIES), this.onApplyDebuff);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(CHANNEL_ABILITIES), this.onCast);
  }

  onCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.VOID_TORRENT_TALENT.id) {
      this.beginChannel(event);
      return;
    }
    if (event.ability.guid === SPELLS.MIND_FLAY.id || event.ability.guid === SPELLS.MIND_SEAR.id) {
      // Completely ignore this with regards to channeling since we use `applydebuff` to track channel start, and this cast-event can occur as ticks too
      return;
    }
    super.onCast(event);
  }

  // We can't use the `cast`-event for Mind Flay/Sear as this event can occur in the log during channel as ticks too
  onApplyDebuff(event: ApplyDebuffEvent) {
    if (event.ability.guid === SPELLS.MIND_FLAY.id || event.ability.guid === SPELLS.MIND_SEAR.id) {
      this.beginChannel(event);
    }
  }

  cancelChannel(event: CastEvent, ability: Ability) {
    if (CHANNEL_ABILITIES.some(ability => this.isChannelingSpell(ability.id))) {
      if (event.ability.guid === SPELLS.MIND_BLAST.id && this.eventHistory.last(1, 100, Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST))) { // Check if they're casting mind blast and it was instant
        // Dark thought proc used
        return;
      }

      // If a channeling spell is "canceled" it was actually just ended, so if it looks canceled then instead just mark it as ended
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }
}

export default Channeling;
