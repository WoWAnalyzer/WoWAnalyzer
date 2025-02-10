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

  private pendingDebuffs: Map<number, number> = new Map();
  private segments: Array<{ start: number; end: number; abilityId: number }> = [];

  onApply(event: ApplyBuffEvent | ApplyDebuffEvent): void {
    this.pendingDebuffs.set(event.ability.guid, event.timestamp);
  }
  onRemove(event: RemoveBuffEvent | RemoveDebuffEvent): void {
    const startTime = this.pendingDebuffs.get(event.ability.guid) ?? this.owner.fight.start_time;
    this.pendingDebuffs.delete(event.ability.guid);

    this.segments.push({
      start: startTime,
      end: event.timestamp,
      abilityId: event.ability.guid,
    });
  }

  onFightEnd(event: FightEndEvent): void {
    for (const [abilityId, startTime] of this.pendingDebuffs) {
      this.segments.push({
        start: startTime,
        end: event.timestamp,
        abilityId,
      });
    }
  }

  get debuffSegments() {
    return this.segments;
  }
}
