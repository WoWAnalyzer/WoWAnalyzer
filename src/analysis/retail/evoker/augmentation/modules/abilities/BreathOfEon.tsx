import fetchWcl from 'common/fetchWclApi';
import SPELLS from 'common/SPELLS';
import { TALENTS_MAGE, TALENTS_WARRIOR } from 'common/TALENTS';
import { WCLEventsResponse, WclOptions } from 'common/WCL_TYPES';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  BuffEvent,
  EventType,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';

/**
 * So this is my proposal for a a way to track Breath of Eons effeciency.
 *
 * Breath of Eons is Augmentations main CD and it works by replicating a %%
 * of your Ebon Might targets damage over the duration of your Breath window.
 * It is therefore important to use Breath when your Ebon Might targets are
 * inside their burst windows.
 *
 * A way to gauge how well a Breath of Eons usage was is to look at
 * when our Buff Targets used their CDs, and see if they overlap with our Breath.
 *
 * In an ideal world we would prolly prefer to look at overall damage happening
 * around the Breath window, but people can go look at WCL for that for now :^)
 *
 * The idea I have for a visual aid is to make a buff graph of sorts
 * This graph would show breath debuff uptime alongside with buffed targets
 * cooldowns.
 * Allowing the user to see how well they overlapped Breath of Eons.
 *
 * To begin with most likely just a MajorCooldown module that gives feedback
 * based on amount of CDs in Breath window.
 */

interface CooldownWindows {
  applyEvent: ApplyBuffEvent;
  removeEvent: RemoveBuffEvent | BuffEvent<any>;
}

interface BreathWindows {
  applyEvent: ApplyDebuffEvent;
  removeEvent: RemoveDebuffEvent | undefined;
}

class BreathOfEons extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  loaded = false;
  cooldownWindowEvents: BuffEvent<any>[] = [];
  breathWindows: BreathWindows[] = [];
  cooldownWindows: CooldownWindows[] = [];
  disableStatistics = false;

  constructor(options: Options) {
    super(options);
    this.active = true;

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.TEMPORAL_WOUND_DEBUFF),
      this.onDebuffApply,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.TEMPORAL_WOUND_DEBUFF),
      this.onDebuffRemove,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);

    this.load();
  }

  /**
   * The Wcl logic here is based on the AncestralVigor module from Resto Shaman
   *
   * Essentially the idea here is to grab the applybuff/removebuff of major CDs.
   * We can can then use the timestamps to see if they overlap with Breath of Eon.
   *
   * For now I kinda just grab all major CD events from any player.
   * Should prolly make a list of the playerIDs that has been affected by Ebon Might
   * at some point in the fight and only grab events from them.
   *
   * The reason why I don't just grab events from people currently Buffed by Ebon Might
   * is that then you won't always get the events you need, and then it gets kinda funk.
   */
  get filter() {
    return `(
        IN RANGE
        WHEN type='${EventType.ApplyBuff}'
          AND ability.id=${TALENTS_MAGE.COMBUSTION_TALENT.id}
          OR ability.id=${TALENTS_WARRIOR.AVATAR_SHARED_TALENT.id}
          OR type='${EventType.RemoveBuff}'
          AND ability.id=${TALENTS_MAGE.COMBUSTION_TALENT.id}
          OR ability.id=${TALENTS_WARRIOR.AVATAR_SHARED_TALENT.id}
        END
      )`;
  }

  // recursively fetch events until no nextPageTimestamp is returned
  fetchAll(pathname: string, query: WclOptions) {
    const checkAndFetch: any = async (_query: WclOptions) => {
      const json = (await fetchWcl(pathname, _query)) as WCLEventsResponse;
      const events = json.events as BuffEvent<any>[];
      this.cooldownWindowEvents.push(...events);
      if (json.nextPageTimestamp) {
        return checkAndFetch(
          Object.assign(query, {
            start: json.nextPageTimestamp,
          }),
        );
      }
      this.loaded = true;
      return null;
    };
    return checkAndFetch(query);
  }

  load() {
    // clear array to avoid duplicate entries after switching tabs and clicking it again
    this.cooldownWindowEvents = [];
    const query: WclOptions = {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: this.filter,
      timeout: 2000,
    };

    return this.fetchAll(`report/events/${this.owner.report.code}`, query).then(() => {
      this.combineEvents();
    });
  }

  onDebuffApply(event: ApplyDebuffEvent) {
    // Each enemy hit by breath gets a debuff, we only need the one.
    const latestTimestamp =
      this.breathWindows.length > 0
        ? this.breathWindows[this.breathWindows.length - 1].applyEvent.timestamp
        : 0;
    const gracePeriod = 20000;
    if (event.timestamp - latestTimestamp > gracePeriod || this.breathWindows.length === 0) {
      this.breathWindows.push({
        applyEvent: event,
        removeEvent: undefined,
      });
    }
  }

  onDebuffRemove(event: RemoveDebuffEvent) {
    // We want to make sure its the last event we push
    const lastIndex = this.breathWindows.length - 1;

    if (lastIndex >= 0) {
      const latestBreathWindow = this.breathWindows[lastIndex];
      latestBreathWindow.removeEvent = event;
    }
  }

  onFightEnd() {
    // If a breathWindow debuff didn't get removed, we need to add a fake remove event
    // I haven't actually seen this happen yet, the debuff does appear to
    // get removed on fightend, but just incase
    for (const breathWindow of this.breathWindows) {
      if (breathWindow.removeEvent === undefined) {
        breathWindow.removeEvent = {
          timestamp: this.owner.fight.end_time,
          type: EventType.RemoveDebuff,
          sourceID: breathWindow.applyEvent.sourceID,
          sourceIsFriendly: breathWindow.applyEvent.sourceIsFriendly,
          targetID: breathWindow.applyEvent.targetID,
          targetIsFriendly: breathWindow.applyEvent.targetIsFriendly,
          ability: breathWindow.applyEvent.ability,
        };
      }
    }
  }

  /**
   * Here we take the fetched cooldown window events and create a
   * new array linking the apply and remove events together for easier analysis.
   */
  combineEvents() {
    const cooldownAmount = this.cooldownWindowEvents.length;

    for (const currentEvent of this.cooldownWindowEvents) {
      let foundPair = false;
      if (currentEvent.type === EventType.ApplyBuff) {
        for (
          let x = this.cooldownWindowEvents.indexOf(currentEvent) + 1;
          x < cooldownAmount;
          x = x + 1
        ) {
          const nextEvent = this.cooldownWindowEvents[x];
          if (
            nextEvent.type === EventType.RemoveBuff &&
            nextEvent.ability.guid === currentEvent.ability.guid &&
            nextEvent.sourceID === currentEvent.sourceID
          ) {
            this.cooldownWindows.push({
              applyEvent: currentEvent,
              removeEvent: nextEvent,
            });
            foundPair = true;
            break;
          }
        }
        if (!foundPair) {
          // If we don't find a corresponding remove event, fabricate one
          // This should only happen if the fight ends before the buff is removed.
          this.cooldownWindows.push({
            applyEvent: currentEvent,
            removeEvent: {
              type: EventType.RemoveBuff,
              timestamp: this.owner.fight.end_time,
              ability: currentEvent.ability,
              sourceID: currentEvent.sourceID!,
              targetID: currentEvent.targetID,
              targetIsFriendly: currentEvent.targetIsFriendly,
              sourceIsFriendly: currentEvent.sourceIsFriendly,
            },
          });
        }
      }
    }

    this.effCalc();
  }

  /**
   * Here we basicly just run through our breath windows and check for if a
   * major CD was used inside of it, if it was we check if the player
   * was buffed by our ebon might.
   * If above is true we can count it towards good overlaps.
   */
  effCalc() {
    // Figure out if CDs and breath overlapped
    this.breathWindows.forEach((breathWindow, index) => {
      const breathStart = breathWindow.applyEvent.timestamp;
      const breathEnd = breathWindow.removeEvent?.timestamp;

      if (breathEnd) {
        this.cooldownWindows.forEach((cooldownWindow) => {
          const cooldownStart = cooldownWindow.applyEvent.timestamp;
          const cooldownEnd = cooldownWindow.removeEvent?.timestamp;

          const buffs = this.combatants.getEntity(cooldownWindow.applyEvent)?.buffs;

          const hasEbonMightBuff = buffs?.some(
            (buff) => buff.ability.guid === SPELLS.EBON_MIGHT_BUFF_EXTERNAL.id,
          );

          if (
            // Case 1: cooldownStart falls within the breathWindow range
            (cooldownStart >= breathStart && cooldownStart < breathEnd) ||
            // Case 2: cooldownEnd falls within the breathWindow range
            (cooldownEnd && cooldownEnd > breathStart && cooldownEnd <= breathEnd) ||
            // Case 3: cooldownStart is before breathStart and cooldownEnd is after breathEnd
            (cooldownStart <= breathStart && cooldownEnd && cooldownEnd >= breathEnd)
          ) {
            console.log(
              'cooldown: ' +
                cooldownWindow.applyEvent.ability.name +
                ' window overlapped with breath window ' +
                (index + 1),
            );
            if (hasEbonMightBuff) {
              console.log('ayyy lmaooo he even had Ebon Might');
            }
          }
        });
      }
    });
  }
}

export default BreathOfEons;
