import getRage from 'analysis/retail/warrior/shared/utils/getRage';
import { formatDuration } from 'common/format';
import { BadColor } from 'interface/guide';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { AbilityEvent, AnyEvent, EventType, ResourceChangeEvent } from 'parser/core/Events';

const LAST_EVENTS_TO_KEEP = 12;

/**
 * Set to tru to print out all events and the rage changes that occur. Can be
 * helpful to look into when rage mismatches. If false, only prints Rage mismatches
 */
const PRINT_ALL = false;

/**
 * Debugger that keeps track of rage and prints an error whenever rage between two logged
 * events does not match any resource changes that have occurred.
 *
 * If we recieve a logged event reporting that rage is at 80, and then later recieve an event
 * that reports that rage is at 90, but we have not seen any resourceChange events that would
 * account for this, we will print an error.
 */
class RageCountDebugger extends Analyzer {
  constructor(options: Options) {
    super(options);

    // Kepe track of rage
    let expectedRage: number | undefined = undefined;

    const lastEvents: AnyEvent[] = [];

    this.addEventListener(Events.any, (event: AnyEvent) => {
      if (event.type === EventType.SpendResource) {
        // This is a fabricated event from the base ResourceTracker, which is not useful for us
        return;
      }

      lastEvents.push(event);
      if (lastEvents.length > LAST_EVENTS_TO_KEEP) {
        lastEvents.shift();
      }

      const rage = getRage(event, this.selectedCombatant);

      let warning = false;
      const parts: string[] = [];
      if ('resourceChange' in event) {
        parts.push(`Resource Change: ${event.resourceChange}`);
        if ('waste' in event && event.waste !== 0) {
          parts.push(`Waste: ${event.waste}`);
        }
        if (expectedRage != null) {
          expectedRage += event.resourceChange - (event as any).waste || 0;
        }
      }

      if (expectedRage != null && rage?.amount != null) {
        if (rage.amount === expectedRage) {
          // This doesn't really work in the debug UI.
          // this.addDebugAnnotation(event, {
          //   summary: `Rage correct: ${rage.amount}`,
          //   color: 'green',
          // });
        } else {
          parts.push(`Rage mismatch! Expected: ${expectedRage}`);
          warning = true;

          this.addDebugAnnotation(event, {
            summary: `Rage mismatch! Expected: ${expectedRage}, got ${rage.amount}`,
            color: BadColor,
            details: (
              <div>
                <h4>Last {lastEvents.length} events</h4>
                <table className="table table-condensed">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Ability</th>
                      <th>Spent</th>
                      <th>Resourcechange</th>
                      <th>Rage count</th>
                    </tr>
                    {lastEvents.map((event, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            {formatDuration(event.timestamp - options.owner.fight.start_time, 3)}
                          </td>
                          <td>{event.type}</td>
                          <td>
                            {(event as AbilityEvent<any>).ability?.name}{' '}
                            {(event as AbilityEvent<any>).ability?.guid}
                          </td>
                          <td>{getRage(event, this.selectedCombatant)?.cost ?? ''}</td>
                          <td>{(event as ResourceChangeEvent).resourceChange ?? ''}</td>
                          <td>{getRage(event, this.selectedCombatant)?.amount ?? ''}</td>
                        </tr>
                      );
                    })}
                  </thead>
                </table>
              </div>
            ),
          });
        }
      }

      if (rage != null && rage.amount != null) {
        parts.push(`Current Rage: ${rage.amount}`);
        expectedRage = rage.amount;
      }

      if (rage != null && rage.cost != null) {
        parts.push(`Cost: ${rage.cost}`);
        if (expectedRage != null && rage.cost > 0) {
          expectedRage -= rage.cost;
        }
      }

      if (warning || PRINT_ALL) {
        const message = [
          `${formatDuration(event.timestamp - options.owner.fight.start_time, 3)}: ${event.type}(${(event as any)?.ability?.name} ${(event as any)?.ability?.guid})`,
          ...parts,
        ].join(', ');

        if (warning) {
          console.warn(message);
        } else {
          console.log(message);
        }
      }
    });
  }
}

export default RageCountDebugger;
