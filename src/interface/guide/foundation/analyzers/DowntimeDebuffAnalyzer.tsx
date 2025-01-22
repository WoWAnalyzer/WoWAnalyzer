import { Uptime } from 'parser/ui/UptimeBar';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, FightEndEvent, RemoveDebuffEvent } from 'parser/core/Events';

const MAX_DEBUFF_TIME = 20000;
const MIN_DEBUFF_TIME = 6000;

/**
 * Track short-duration debuffs from hostile sources that might be relevant for downtime. Emphasis on *might be.*
 *
 * This is mostly for display. Probably shouldn't use it for analysis directly.
 */

export class DowntimeDebuffAnalyzer extends Analyzer {
  private timelines: Map<number, Uptime[]> = new Map();
  private activeDebuffs: Map<number, ApplyDebuffEvent> = new Map();

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.applydebuff.to(SELECTED_PLAYER), this.onApply);
    this.addEventListener(Events.removedebuff.to(SELECTED_PLAYER), this.onRemove);
    this.addEventListener(Events.fightend, this.finalize);
  }

  public get debuffTimelines(): Map<number, Uptime[]> {
    return this.timelines;
  }

  private onApply(event: ApplyDebuffEvent) {
    if (event.sourceIsFriendly) {
      // don't track friendly debuffs
      return;
    }

    this.activeDebuffs.set(event.ability.guid, event);
  }

  private onRemove(event: RemoveDebuffEvent) {
    if (event.sourceIsFriendly) {
      return;
    }
    if (!this.activeDebuffs.has(event.ability.guid)) {
      // we haven't seen this debuff. consider it for pre-fight application
      this.maybePushDebuff(event.ability.guid, this.owner.fight.start_time, event.timestamp);
      return;
    }

    const application = this.activeDebuffs.get(event.ability.guid)!;
    this.activeDebuffs.delete(event.ability.guid);

    this.maybePushDebuff(event.ability.guid, application.timestamp, event.timestamp);
  }

  private finalize(event: FightEndEvent) {
    for (const [abilityId, application] of this.activeDebuffs) {
      this.maybePushDebuff(abilityId, application.timestamp, event.timestamp);
    }

    this.activeDebuffs = new Map();
  }

  private maybePushDebuff(abilityId: number, applicationTime: number, removalTime: number): void {
    const duration = removalTime - applicationTime;
    if (duration >= MAX_DEBUFF_TIME || duration < MIN_DEBUFF_TIME) {
      return;
    }

    if (!this.timelines.has(abilityId)) {
      this.timelines.set(abilityId, []);
    }

    this.timelines.get(abilityId)!.push({
      start: applicationTime,
      end: removalTime,
    });
  }
}
