import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Spell from 'common/SPELLS/Spell';
import SPELLS from 'common/SPELLS';
import Events, {
  ApplyDebuffEvent,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Combatant from 'parser/core/Combatant';
import { SubUptimes } from '../core/UptimeBarSubStatistic';
import { mergeTimePeriods } from 'parser/core/mergeTimePeriods';

/** Buffer in ms to use when determining if a buff was present when a DoT was applied */
const BUFF_DROP_BUFFER = 60;

export const TIGERS_FURY_SPEC: SnapshotSpec = {
  spell: SPELLS.TIGERS_FURY,
  isActive: (c) => true,
  isPresent: (c, timestamp) => c.hasBuff(SPELLS.TIGERS_FURY.id, timestamp, BUFF_DROP_BUFFER),
  displayColor: '#ff9955',
};

export const PROWL_SPEC: SnapshotSpec = {
  spell: SPELLS.PROWL,
  isActive: (c) => true,
  isPresent: (c, timestamp) =>
    c.hasBuff(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id) ||
    c.hasBuff(SPELLS.PROWL.id, timestamp, BUFF_DROP_BUFFER) ||
    c.hasBuff(SPELLS.PROWL_INCARNATION.id, timestamp, BUFF_DROP_BUFFER) ||
    c.hasBuff(SPELLS.SHADOWMELD.id, timestamp, BUFF_DROP_BUFFER),
  displayColor: '#5555ff',
};

export const BLOODTALONS_SPEC: SnapshotSpec = {
  spell: SPELLS.BLOODTALONS_TALENT,
  isActive: (c) => c.hasTalent(SPELLS.BLOODTALONS_TALENT),
  isPresent: (c, timestamp) => c.hasBuff(SPELLS.BLOODTALONS_BUFF.id, timestamp, BUFF_DROP_BUFFER),
  displayColor: '#dd0022',
};

class Snapshots2 extends Analyzer {
  spell: Spell;
  debuff: Spell;
  applicableSnapshots: SnapshotSpec[];
  snapshotsByTarget: { [key: string]: SnapshotUptime[] } = {};

  constructor(spell: Spell, debuff: Spell, applicableSnapshots: SnapshotSpec[], options: Options) {
    super(options);
    this.spell = spell;
    this.debuff = debuff;
    this.applicableSnapshots = applicableSnapshots.filter((as) =>
      as.isActive(this.selectedCombatant),
    );

    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(debuff), this.onApplyDot);
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(debuff),
      this.onRefreshDot,
    );
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(debuff), this.onRemoveDot);
  }

  onApplyDot(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.snapshotsByTarget[targetString]) {
      this.snapshotsByTarget[targetString] = [];
    }
    this.snapshotsByTarget[targetString].push({
      start: event.timestamp,
      snapshots: this._getActiveSnapshotNames(event.timestamp),
    });
  }

  onRemoveDot(event: RemoveDebuffEvent | RefreshDebuffEvent) {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.snapshotsByTarget[targetString]) {
      console.warn(event.type + ' on target when we have no record of an applydebuff', event);
      this.snapshotsByTarget[targetString] = [];
    }
    const uptimeHistory = this.snapshotsByTarget[targetString];
    if (uptimeHistory.length > 0) {
      uptimeHistory[uptimeHistory.length - 1].end = event.timestamp;
    }
  }

  onRefreshDot(event: RefreshDebuffEvent) {
    this.onRemoveDot(event);
    // TODO compare old and new
    this.onApplyDot(event);
  }

  _getActiveSnapshotNames(timestamp: number): string[] {
    return this.applicableSnapshots
      .filter((as) => as.isPresent(this.selectedCombatant, timestamp))
      .map((as) => as.spell.name);
  }

  get snapshotUptimes(): SubUptimes[] {
    return this.applicableSnapshots.map((as) => this._getSnapshotUptimesForBuff(as));
  }

  _getSnapshotUptimesForBuff(spec: SnapshotSpec): SubUptimes {
    const combinedUptimes = mergeTimePeriods(
      Object.values(this.snapshotsByTarget)
        .flatMap((uptimes) => uptimes)
        .filter((uptime) => uptime.snapshots.includes(spec.spell.name)),
      this.owner.currentTimestamp,
    );
    return {
      uptimes: combinedUptimes,
      color: spec.displayColor,
      spell: spec.spell,
    };
  }
}

type SnapshotSpec = {
  spell: Spell;
  isActive: (c: Combatant) => boolean;
  isPresent: (c: Combatant, timestamp: number) => boolean;
  displayColor: string;
};

type SnapshotUptime = {
  /** Timestamp when this debuff was applied or refreshed */
  start: number;
  /** Timestamp when this debuff was removed, or undefined if it's still active */
  end?: number;
  /** Snapshot spell names applicable to this DoT application */
  snapshots: string[];
  // TODO power wasDowngrade, wasEarlyRefresh
};

export default Snapshots2;
