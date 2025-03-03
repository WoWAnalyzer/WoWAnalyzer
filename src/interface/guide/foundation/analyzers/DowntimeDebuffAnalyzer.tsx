import { findByBossId } from 'game/raids';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  FightEndEvent,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';

export default class DowntimeDebuffAnalyzer extends Analyzer {
  constructor(options: Options) {
    super(options);

    const encounterConfig = findByBossId(this.owner.fight.boss);

    const debuffs =
      encounterConfig?.fight.timeline?.debuffs?.filter(
        ({ type }) => type === undefined || type === 'debuff',
      ) ?? [];
    const buffs =
      encounterConfig?.fight.timeline?.debuffs?.filter(({ type }) => type === 'buff') ?? [];

    if (debuffs.length === 0 && buffs.length === 0) {
      this.active = false;
    }

    this.addEventListener(Events.applydebuff.to(SELECTED_PLAYER).spell(debuffs), this.onApply);
    this.addEventListener(Events.removedebuff.to(SELECTED_PLAYER).spell(debuffs), this.onRemove);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(buffs), this.onApply);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(buffs), this.onRemove);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private pendingDebuffs: Map<number, PendingDebuff[]> = new Map();
  private segments: Array<{ start: number; end: number; abilityId: number }> = [];

  onApply(event: ApplyBuffEvent | ApplyDebuffEvent): void {
    if (!this.pendingDebuffs.has(event.ability.guid)) {
      this.pendingDebuffs.set(event.ability.guid, []);
    }
    this.pendingDebuffs.get(event.ability.guid)!.push({
      sourceID: event.sourceID,
      sourceInstance: event.sourceInstance,
      timestamp: event.timestamp,
    });
  }

  onRemove(event: RemoveBuffEvent | RemoveDebuffEvent): void {
    const pending = this.pendingDebuffs.get(event.ability.guid) ?? [];
    const startTime = pending.find(
      (debuff) =>
        debuff.sourceID === event.sourceID && debuff.sourceInstance === event.sourceInstance,
    )?.timestamp;

    // if we found a start event, remove it from the list.
    if (startTime) {
      this.pendingDebuffs.set(
        event.ability.guid,
        pending.filter(
          (debuff) =>
            debuff.sourceID !== event.sourceID || debuff.sourceInstance !== event.sourceInstance,
        ),
      );
    }

    this.segments.push({
      start: startTime ?? this.owner.fight.start_time,
      end: event.timestamp,
      abilityId: event.ability.guid,
    });
  }

  onFightEnd(event: FightEndEvent): void {
    for (const [abilityId, pendingDebuffs] of this.pendingDebuffs) {
      for (const pending of pendingDebuffs) {
        this.segments.push({
          start: pending.timestamp,
          end: event.timestamp,
          abilityId,
        });
      }
    }
  }

  get debuffSegments() {
    return this.segments;
  }
}

interface PendingDebuff {
  sourceID?: number;
  sourceInstance?: number;
  timestamp: number;
}
