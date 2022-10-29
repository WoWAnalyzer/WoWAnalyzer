import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import * as SPELLS from '../../SPELLS';
import Events, { RemoveBuffEvent, ResourceChangeEvent } from 'parser/core/Events';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Combatants from 'parser/shared/modules/Combatants';

interface RaptureEvent {
  resourceChangeEvents: ResourceChangeEvent[];
  shieldEvents: RemoveBuffEvent[];
}

const RaptureTable = ({ raptureEvents, combatants }: { raptureEvents: { [key: number]: RaptureEvent }, combatants: Combatants }) => {
  return <table className="table table-condensed" style={{ backgroundColor: '#161513' }}>
    <thead>
      <tr>
        <th>
          Rapture #
        </th>
        <th>
          Targets
        </th>
      </tr>
    </thead>
    <tbody>
      {Object.values(raptureEvents).map((raptureEvent: RaptureEvent, raptureIndex) => {
        return <tr key={`rap-${raptureIndex}`}>
          <td>{raptureIndex}</td>
          <td>
            {raptureEvent.shieldEvents.map((shieldEvent: RemoveBuffEvent, shieldIndex) => {
              return <div key={`shld-${raptureIndex}-${shieldIndex}`}>{combatants.players[shieldEvent.targetID].name}</div>;
            })}
          </td>
        </tr>;
      })}
    </tbody>
  </table>;
};

class Rapture extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  private shieldPopEvents: RemoveBuffEvent[] = [];
  private raptureEvents: { [key: number]: RaptureEvent } = {};
  private manaFromRapture = 0;
  private raptureTotalCount = 0;

  // Rapture can only proc once every 12 seconds, but more than one Rapture can proc at a time.
  // Priests should be trying to get multiple shields to pop at the same time whenever possible.
  // This function returns the total number of procs (no more than one per 12 seconds)
  get raptureProcCount() {
    return Object.keys(this.raptureEvents).length;
  }

  get multiHits() {
    return Object.values(this.raptureEvents).reduce((hits: number, evt: RaptureEvent) => {
      return evt.shieldEvents.length > 1 ? hits + 1 : hits;
    }, 0);
  }

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell({ id: SPELLS.RAPTURE_PERSONAL_MANA_REGEN }),
      this.onRapturePersonalRegen,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell({ id: SPELLS.POWER_WORD_SHIELD }),
      this.onPowerWordShieldBreak,
    );
  }

  onRapturePersonalRegen(event: ResourceChangeEvent) {
    this.raptureTotalCount += 1;
    this.manaFromRapture += event.resourceChange || 0;
    this.raptureEvents[event.timestamp] = this.raptureEvents[event.timestamp] || {
      resourceChangeEvents: [],
      shieldEvents: [],
    };
    this.raptureEvents[event.timestamp].resourceChangeEvents.push(event);
    const shieldEvent = this.shieldPopEvents.pop();
    if (shieldEvent) {
      this.raptureEvents[event.timestamp].shieldEvents.push(shieldEvent);
    }
  }

  onPowerWordShieldBreak(event: RemoveBuffEvent) {
    this.shieldPopEvents.push(event);
  }

  statistic() {
    if (this.raptureTotalCount === 0) {
      return null;
    }
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip="Rapture is your most important mana regenerating tool. It can only proc once every 12 seconds, but it can be triggered by multiple shields popping at the same time. Try and line up the cooldown with large AOE damage to get the most mana back."
        dropdown={<RaptureTable raptureEvents={this.raptureEvents} combatants={this.combatants} />}
      >
        <BoringSpellValueText spellId={SPELLS.RAPTURE}>
          <ItemManaGained amount={this.manaFromRapture} />
          <br />
          {this.multiHits} Multi-Hit(s)
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Rapture;

