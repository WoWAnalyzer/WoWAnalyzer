import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  BeginChannelEvent,
  CastEvent,
  EndChannelEvent,
  EmpowerEndEvent,
  EventType,
  HealEvent,
} from 'parser/core/Events';
import makeWclUrl from 'common/makeWclUrl';

export interface HealTargetInfo {
  targetID: number;
  amount: number;
  overheal: number;
  absorbed: number;
  hpBeforePct: number;
  isMainTarget: boolean;
}

export interface CastHealData {
  heals: HealTargetInfo[];
  healAbilityId: number;
  totalEffective: number;
  totalOverheal: number;
}

const FALLBACK_BUFFER_MS = 2000;

/**
 * Collects healing target information for casts.
 *
 * First tries to walk _linkedEvents from Heal events back to their originating cast
 * (works for specs with EventLinkNormalizers). For casts without links, falls back to
 * matching heals by ability ID and timestamp proximity.
 *
 * Exposes data via `getHealDataForEvent()` for use by timeline components.
 */
class CastHealInfo extends Analyzer {
  private castHealMap = new Map<AnyEvent, HealEvent[]>();
  private empowerToChannel = new Map<EmpowerEndEvent, BeginChannelEvent>();
  private processedData = new Map<AnyEvent, CastHealData>();

  // For fallback matching
  private allHeals: HealEvent[] = [];
  private allCasts: { timelineEvent: AnyEvent; timestamp: number; abilityId: number }[] = [];
  private linkedHeals = new Set<HealEvent>();

  // Map of friendly ID to names
  private friendlyMap = new Map<number, string>();

  constructor(options: Options) {
    super(options);
    for (const f of this.owner.report.friendlies) {
      this.friendlyMap.set(f.id, f.name);
    }
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.BeginChannel.by(SELECTED_PLAYER), this.onBeginChannel);
    this.addEventListener(Events.EndChannel.by(SELECTED_PLAYER), this.onEndChannel);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onEndChannel(event: EndChannelEvent) {
    if (event.trigger?.type === EventType.EmpowerEnd) {
      this.empowerToChannel.set(event.trigger as EmpowerEndEvent, event.beginChannel);
    }
  }

  onCast(event: CastEvent) {
    const timelineEvent = this.resolveTimelineEvent(event);
    if (timelineEvent && timelineEvent !== event) {
      return;
    }
    this.allCasts.push({
      timelineEvent: event,
      timestamp: event.timestamp,
      abilityId: event.ability.guid,
    });
  }

  onBeginChannel(event: BeginChannelEvent) {
    this.allCasts.push({
      timelineEvent: event,
      timestamp: event.timestamp,
      abilityId: event.ability.guid,
    });
  }

  /**
   * Walks linked events from the heal back to find the originating cast/channel that caused it.
   * @param event The event to start the search from.
   * @param visited A set of events that have already been visited to prevent infinite loops.
   * @param depth The current depth of the search.
   * @returns The originating cast/channel event, or undefined if not found.
   */
  private findOriginatingCast(
    event: AnyEvent,
    visited = new Set<AnyEvent>(),
    depth = 0,
  ): CastEvent | EmpowerEndEvent | BeginChannelEvent | undefined {
    if (depth > 3 || visited.has(event)) {
      return undefined;
    }
    visited.add(event);

    for (const link of event._linkedEvents ?? []) {
      const linked = link.event;
      if (
        linked.type === EventType.Cast ||
        linked.type === EventType.EmpowerEnd ||
        linked.type === EventType.BeginChannel
      ) {
        if ('sourceID' in linked && linked.sourceID === this.selectedCombatant.id) {
          return linked as CastEvent | EmpowerEndEvent | BeginChannelEvent;
        }
      }
      const found = this.findOriginatingCast(linked, visited, depth + 1);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  /**
   * Resolves the appropriate timeline event to associate heals with.
   * @param cast The cast event to resolve.
   * @returns The timeline event to associate heals with, or undefined if not found.
   */
  private resolveTimelineEvent(
    cast: CastEvent | EmpowerEndEvent | BeginChannelEvent,
  ): CastEvent | BeginChannelEvent | undefined {
    if (cast.type === EventType.EmpowerEnd) {
      return this.empowerToChannel.get(cast as EmpowerEndEvent);
    }
    if (cast.type === EventType.Cast && (cast as CastEvent).channel) {
      return (cast as CastEvent).channel!.beginChannel;
    }
    return cast as CastEvent | BeginChannelEvent;
  }

  /**
   * Adds a heal to the map of heals associated with a cast/channel event.
   * @param timelineEvent The cast/channel event to associate the heal with.
   * @param heal The heal event to add.
   * @returns void
   */
  private addHealToMap(timelineEvent: AnyEvent, heal: HealEvent) {
    if (!this.friendlyMap.has(heal.targetID)) {
      return;
    }
    if (!this.castHealMap.has(timelineEvent)) {
      this.castHealMap.set(timelineEvent, []);
    }
    const heals = this.castHealMap.get(timelineEvent)!;
    if (!heals.includes(heal)) {
      heals.push(heal);
    }
  }

  onHeal(event: HealEvent) {
    this.allHeals.push(event);

    const cast = this.findOriginatingCast(event);
    if (!cast) {
      return;
    }

    const timelineEvent = this.resolveTimelineEvent(cast);
    if (!timelineEvent) {
      return;
    }

    this.addHealToMap(timelineEvent, event);
    this.linkedHeals.add(event);
  }

  onFightEnd() {
    // Fallback: for heals without links, match by ability ID + timestamp proximity.
    // Pre-group heals by ability ID for efficient lookup
    const healsByAbility = new Map<number, HealEvent[]>();
    for (const heal of this.allHeals) {
      if (this.linkedHeals.has(heal)) {
        continue;
      }
      const id = heal.ability.guid;
      if (!healsByAbility.has(id)) {
        healsByAbility.set(id, []);
      }
      healsByAbility.get(id)!.push(heal);
    }

    // Group casts by ability ID
    const castsByAbility = new Map<number, typeof this.allCasts>();
    for (const cast of this.allCasts) {
      if (!castsByAbility.has(cast.abilityId)) {
        castsByAbility.set(cast.abilityId, []);
      }
      castsByAbility.get(cast.abilityId)!.push(cast);
    }

    const claimedHeals = new Set<HealEvent>();

    for (const [abilityId, casts] of castsByAbility) {
      const abilityHeals = healsByAbility.get(abilityId);
      if (!abilityHeals || abilityHeals.length === 0) {
        continue;
      }

      let healIdx = 0;
      for (let i = 0; i < casts.length; i++) {
        const cast = casts[i];
        const nextCastTimestamp =
          i + 1 < casts.length ? casts[i + 1].timestamp : cast.timestamp + FALLBACK_BUFFER_MS;
        const windowEnd = Math.min(nextCastTimestamp, cast.timestamp + FALLBACK_BUFFER_MS);

        while (healIdx < abilityHeals.length && abilityHeals[healIdx].timestamp < cast.timestamp) {
          healIdx++;
        }

        for (let j = healIdx; j < abilityHeals.length; j++) {
          const heal = abilityHeals[j];
          if (heal.timestamp > windowEnd) {
            break;
          }
          if (!claimedHeals.has(heal)) {
            this.addHealToMap(cast.timelineEvent, heal);
            claimedHeals.add(heal);
          }
        }
      }
    }

    // Build processed data
    for (const [cast, heals] of this.castHealMap) {
      const mainTargetID = 'targetID' in cast ? (cast as CastEvent).targetID : undefined;

      const byTarget = new Map<number, HealEvent>();
      for (const heal of heals) {
        const existing = byTarget.get(heal.targetID);
        const effective = heal.amount + (heal.absorbed ?? 0);
        const existingEffective = existing ? existing.amount + (existing.absorbed ?? 0) : 0;
        if (!existing || effective > existingEffective) {
          byTarget.set(heal.targetID, heal);
        }
      }

      const uniqueHeals = [...byTarget.values()];
      const healInfos: HealTargetInfo[] = uniqueHeals.map((heal) => ({
        targetID: heal.targetID,
        amount: heal.amount,
        overheal: heal.overheal ?? 0,
        absorbed: heal.absorbed ?? 0,
        hpBeforePct: heal.maxHitPoints > 0 ? (heal.hitPoints - heal.amount) / heal.maxHitPoints : 0,
        isMainTarget: mainTargetID != null && heal.targetID === mainTargetID,
      }));

      healInfos.sort((a, b) => (a.isMainTarget ? -1 : b.isMainTarget ? 1 : 0));

      const totalEffective = healInfos.reduce((sum, h) => sum + h.amount + h.absorbed, 0);
      const totalOverheal = healInfos.reduce((sum, h) => sum + h.overheal, 0);

      const healAbilityId = uniqueHeals[0].ability.guid;
      this.processedData.set(cast, {
        heals: healInfos,
        healAbilityId,
        totalEffective,
        totalOverheal,
      });
    }

    // Release temporary data
    this.allHeals = [];
    this.allCasts = [];
    this.linkedHeals.clear();
    this.castHealMap.clear();
    this.empowerToChannel.clear();
  }

  /**
   * Retrieves processed heal data for a given cast/channel event.
   * @param event The cast/channel event to retrieve heal data for.
   * @returns An object containing heal information for the event, or undefined if no data is available.
   */
  getHealDataForEvent(event: AnyEvent): CastHealData | undefined {
    return this.processedData.get(event);
  }

  /**
   * Retrieves the name of a target based on its ID.
   * @param targetID The ID of the target.
   * @returns The name of the target, or 'Unknown' if not found.
   */
  getTargetName(targetID: number): string {
    return this.friendlyMap.get(targetID) ?? 'Unknown';
  }

  /**
   * Generates a Warcraft Logs URL for a specific heal event.
   * @param timestamp The timestamp of the heal event.
   * @param abilityId The ID of the ability used for the heal.
   * @returns A URL string pointing to the heal event in Warcraft Logs.
   */
  getWclUrl(timestamp: number, abilityId: number): string {
    const report = this.owner.report;
    const fight = this.owner.fight;
    const window = 2000;
    return makeWclUrl(report.code, {
      fight: fight.id,
      type: 'healing',
      source: this.owner.player.id,
      start: timestamp - window,
      end: timestamp + window,
      ability: abilityId,
    });
  }
}

export default CastHealInfo;
