import SPELLS from 'common/SPELLS/hunter';
import TALENTS from 'common/TALENTS/hunter';
import { PL_HOGSTRIDER_DAMAGE } from '../constants';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  DamageEvent,
  CastEvent,
} from 'parser/core/Events';
import { SV_MB_CLEAVE } from '../normalizers/HunterEventLinkNormalizers';
import SpellLink from 'interface/SpellLink';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { GetRelatedEvents } from 'parser/core/Events';
import { SpellUse, ChecklistUsageInfo } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import SpellUsageSubSection from 'parser/core/SpellUsage/SpellUsageSubSection';
import Enemies from 'parser/shared/modules/Enemies';

/**
 * While in combat, every 25(SV) or 30(BM) seconds, your next Kill Command summons the aid of a beast.
 *
 * Each beast performs a different action.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/qmTx6JhgLAk1HRGV?fight=9&type=damage-done&source=34
 */

// ───────────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────────

type BeastKind = 'WYVERN' | 'BEAR' | 'BOAR';

interface WyvernSegment {
  startTs: number;
  endTs: number;
  endedBy: 'refresh' | 'remove';
}

interface BearData {
  totalRendDamage: number;
  rendTargets: Set<number>;
  windowEndTs: number; // spawnTs + 12_000
}

interface BoarCharge {
  startTs: number; // first damage line of the charge
  totalDamage: number; // raw sum of damage within this charge's 1.5s cluster
  hitTargets: Set<number>;
  lastLineTs: number;
}

interface BoarData {
  windowStartTs: number; // removal of HOWL_BOAR
  windowEndTs: number; // open until next BOAR spawn, 3 Hog removes, or fight end
  initialTargetId?: number;
  initialTargetName?: string;
  initialTargetHpPct?: number;
  charges: BoarCharge[];
  totalChargeDamage: number;
  hogAppliesCount: number;
  hogRemovesCount: number;
  cleaveDamage: number;
  cleaveTargets: Set<number>;
}

interface HowlSpawn {
  index: number;
  kind: BeastKind;
  event: RemoveBuffEvent; // anchor/clickable box
  startedAtTs: number;
  bear?: BearData;
  boar?: BoarData;
}

// ───────────────────────────────────────────────────────────────────────────────
// Constants
// ───────────────────────────────────────────────────────────────────────────────

const CHARGE_CLUSTER_MS = 1500; // capture window per charge
const BEAR_WINDOW_MS = 12_000; // bear’s full effect within 12s of spawn
const OPEN_UNTIL_FAR_FUTURE = 9e15; // effectively “infinity”
const KC_HISTORY_MAX = 50; // guard against unbounded growth

// ───────────────────────────────────────────────────────────────────────────────
// Analyzer
// ───────────────────────────────────────────────────────────────────────────────

export default class HowlOfThePackleaderGuide extends Analyzer.withDependencies({
  enemies: Enemies,
}) {
  protected enemies!: Enemies;

  private spawns: HowlSpawn[] = [];
  private spawnIndex = 0;

  private isSurvival = false;

  // Wyvern tracking (global, not tied to spawns)
  private wyvernCurrentStartTs: number | null = null;
  private wyvernSegments: WyvernSegment[] = [];

  // Boar tracking (keep handle to the current open boar window)
  private currentBoarSpawn: HowlSpawn | null = null;

  // KC history to resolve boar’s intended target at spawn time
  private kcHistory: { ts: number; targetId?: number; targetName?: string }[] = [];

  private uses: SpellUse[] = [];

  constructor(options: Options) {
    super(options);

    this.active =
      !!this.selectedCombatant &&
      (this.selectedCombatant.hasTalent(TALENTS.COORDINATED_ASSAULT_TALENT) ||
        this.selectedCombatant.hasTalent(TALENTS.BESTIAL_WRATH_TALENT));
    if (!this.active) return;

    this.isSurvival = this.selectedCombatant.hasTalent(TALENTS.COORDINATED_ASSAULT_TALENT);

    if (this.isSurvival) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.KILL_COMMAND_SURVIVAL_TALENT),
        (e: CastEvent) => {
          const enemy = this.enemies.getEntity(e);
          this.kcHistory.push({ ts: e.timestamp, targetId: e.targetID, targetName: enemy?.name });
          if (this.kcHistory.length > KC_HISTORY_MAX) this.kcHistory.shift();
        },
      );
    } else {
      // Handle BM KC if the constant exists in the TALENTS map
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT),
        (e: CastEvent) => {
          const enemy = this.enemies.getEntity(e);
          this.kcHistory.push({ ts: e.timestamp, targetId: e.targetID, targetName: enemy?.name });
          if (this.kcHistory.length > KC_HISTORY_MAX) this.kcHistory.shift();
        },
      );
    }

    // Beast is spawned on removal of the Howl buff.
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOWL_OF_THE_PACKLEADER_WYVERN),
      (e: RemoveBuffEvent) => this.startSpawn('WYVERN', e),
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOWL_OF_THE_PACKLEADER_BEAR),
      (e: RemoveBuffEvent) => this.startSpawn('BEAR', e),
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOWL_OF_THE_PACKLEADER_BOAR),
      (e: RemoveBuffEvent) => this.startSpawn('BOAR', e),
    );

    // ── Wyvern buff uptime: start on APPLY, segment on REFRESH, close on REMOVE
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WYVERNS_CRY),
      (e: ApplyBuffEvent) => {
        if (this.wyvernCurrentStartTs != null) {
          this.wyvernSegments.push({
            startTs: this.wyvernCurrentStartTs,
            endTs: e.timestamp,
            endedBy: 'refresh',
          });
        }
        this.wyvernCurrentStartTs = e.timestamp;
      },
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.WYVERNS_CRY),
      (e: RefreshBuffEvent) => {
        if (this.wyvernCurrentStartTs != null) {
          this.wyvernSegments.push({
            startTs: this.wyvernCurrentStartTs,
            endTs: e.timestamp,
            endedBy: 'refresh',
          });
          this.wyvernCurrentStartTs = e.timestamp;
        }
      },
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.WYVERNS_CRY),
      (e: RemoveBuffEvent) => {
        if (this.wyvernCurrentStartTs != null) {
          this.wyvernSegments.push({
            startTs: this.wyvernCurrentStartTs,
            endTs: e.timestamp,
            endedBy: 'remove',
          });
          this.wyvernCurrentStartTs = null;
        }
      },
    );

    // ── Bear: capture from PET or PLAYER (logs can vary)
    const onBearRend = (e: DamageEvent) => {
      const bearSpawn = this.findBearWindowForTs(e.timestamp);
      if (!bearSpawn) return;
      const bearData = this.ensureBear(bearSpawn);
      bearData.totalRendDamage += e.amount + (e.absorbed || 0);
      if (e.targetID != null) bearData.rendTargets.add(e.targetID as number);
    };
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.BEAR_REND_FLESH),
      onBearRend,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BEAR_REND_FLESH),
      onBearRend,
    );

    // ── Boar charge damage lines
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(PL_HOGSTRIDER_DAMAGE),
      (e: DamageEvent) => this.onBoarChargeDamage(e),
    );

    // Hogstrider applies/removes inside boar window (used for parity with charges)
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HOGSTRIDER_BUFF),
      (e: ApplyBuffEvent) => {
        const boarSpawn = this.currentBoarSpawn;
        if (!boarSpawn || !boarSpawn.boar) return;
        const boarData = boarSpawn.boar;
        if (e.timestamp < boarData.windowStartTs || e.timestamp > boarData.windowEndTs) return;
        boarData.hogAppliesCount += 1;
      },
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOGSTRIDER_BUFF),
      (e: RemoveBuffEvent) => {
        const boarSpawn = this.currentBoarSpawn;
        if (!boarSpawn || !boarSpawn.boar) return;
        const boarData = boarSpawn.boar;
        if (e.timestamp < boarData.windowStartTs || e.timestamp > boarData.windowEndTs) return;

        boarData.hogRemovesCount += 1;

        // Pull MB lines linked to this Hogstrider remove (within ~1.5s) to derive cleave stats
        const linked = (GetRelatedEvents(e, SV_MB_CLEAVE) || []) as DamageEvent[];
        if (linked.length > 0) {
          const primary = linked[0];
          const primaryDmg = primary.amount + (primary.absorbed || 0);
          const totalDmg = linked.reduce((s, ev) => s + ev.amount + (ev.absorbed || 0), 0);
          const cleaveDmg = Math.max(0, totalDmg - primaryDmg);
          boarData.cleaveDamage += cleaveDmg;
          for (let i = 1; i < linked.length; i++) {
            const t = linked[i].targetID;
            if (t != null && t !== primary.targetID) boarData.cleaveTargets.add(t as number);
          }
        }

        if (boarData.hogRemovesCount >= 3) {
          boarData.windowEndTs = Math.min(boarData.windowEndTs, e.timestamp);
        }
      },
    );

    this.addEventListener(Events.fightend, this.finalize);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Spawns
  // ─────────────────────────────────────────────────────────────────────────────

  private startSpawn(kind: BeastKind, removeEvent: RemoveBuffEvent) {
    // If a new BOAR spawns, close the previous boar window at this timestamp
    if (kind === 'BOAR' && this.currentBoarSpawn && this.currentBoarSpawn.boar) {
      this.currentBoarSpawn.boar.windowEndTs = Math.min(
        this.currentBoarSpawn.boar.windowEndTs,
        removeEvent.timestamp,
      );
    }

    // Most recent KC within 1s of the Howl removal
    const kc = this.findKCBefore(removeEvent.timestamp, 1000);

    const newSpawn: HowlSpawn = {
      index: ++this.spawnIndex,
      kind,
      event: removeEvent,
      startedAtTs: removeEvent.timestamp,
      bear:
        kind === 'BEAR'
          ? {
              totalRendDamage: 0,
              rendTargets: new Set(),
              windowEndTs: removeEvent.timestamp + BEAR_WINDOW_MS,
            }
          : undefined,
      boar:
        kind === 'BOAR'
          ? {
              windowStartTs: removeEvent.timestamp,
              windowEndTs: OPEN_UNTIL_FAR_FUTURE,
              initialTargetId: kc?.targetId ?? undefined,
              initialTargetName: kc?.targetName ?? undefined,
              initialTargetHpPct: undefined,
              charges: [],
              totalChargeDamage: 0,
              hogAppliesCount: 0,
              hogRemovesCount: 0,
              cleaveDamage: 0,
              cleaveTargets: new Set(),
            }
          : undefined,
    };

    this.spawns.push(newSpawn);
    if (kind === 'BOAR') this.currentBoarSpawn = newSpawn;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private ensureBear(spawn: HowlSpawn): BearData {
    if (!spawn.bear) {
      spawn.bear = {
        totalRendDamage: 0,
        rendTargets: new Set(),
        windowEndTs: spawn.startedAtTs + BEAR_WINDOW_MS,
      };
    }
    return spawn.bear;
  }

  private ensureBoar(spawn: HowlSpawn): BoarData {
    if (!spawn.boar) {
      const kc = this.findKCBefore(spawn.startedAtTs, 1000);
      spawn.boar = {
        windowStartTs: spawn.startedAtTs,
        windowEndTs: OPEN_UNTIL_FAR_FUTURE,
        initialTargetId: kc?.targetId ?? undefined,
        initialTargetName: kc?.targetName ?? undefined,
        initialTargetHpPct: undefined,
        charges: [],
        totalChargeDamage: 0,
        hogAppliesCount: 0,
        hogRemovesCount: 0,
        cleaveDamage: 0,
        cleaveTargets: new Set(),
      };
    }
    return spawn.boar;
  }

  private findBearWindowForTs(ts: number): HowlSpawn | null {
    for (let i = this.spawns.length - 1; i >= 0; i--) {
      const spawn = this.spawns[i];
      if (spawn.kind !== 'BEAR' || !spawn.bear) continue;
      if (ts >= spawn.startedAtTs && ts <= spawn.bear.windowEndTs) return spawn;
    }
    return null;
  }

  private findKCBefore(ts: number, lookbackMs: number) {
    for (let i = this.kcHistory.length - 1; i >= 0; i--) {
      const k = this.kcHistory[i];
      if (k.ts <= ts && ts - k.ts <= lookbackMs) return k;
      if (k.ts < ts - lookbackMs) break;
    }
    return undefined;
  }

  // Find the Wyvern segment that started after (or at) this spawn and before the next WYVERN spawn
  private wyvernSegmentForSpawn(spawn: HowlSpawn): WyvernSegment | undefined {
    const spawnIdx = this.spawns.indexOf(spawn);
    let nextWyvernTs = Number.POSITIVE_INFINITY;
    for (let i = spawnIdx + 1; i < this.spawns.length; i++) {
      if (this.spawns[i].kind === 'WYVERN') {
        nextWyvernTs = this.spawns[i].startedAtTs;
        break;
      }
    }
    return this.wyvernSegments.find(
      (seg) => seg.startTs >= spawn.startedAtTs && seg.startTs < nextWyvernTs,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Boar charge handling — group into 1.5s clusters; window ends on next spawn, 3 removes, or fight end
  // ─────────────────────────────────────────────────────────────────────────────

  private onBoarChargeDamage = (e: DamageEvent) => {
    const boarSpawn = this.currentBoarSpawn;
    if (!boarSpawn || !boarSpawn.boar) return;
    const boarData = boarSpawn.boar;

    if (e.timestamp < boarData.windowStartTs || e.timestamp > boarData.windowEndTs + 1500) return;

    const dmg = e.amount + (e.absorbed || 0);

    if (boarData.initialTargetHpPct == null) {
      const hp = e.hitPoints;
      const max = e.maxHitPoints;
      if (typeof hp === 'number' && typeof max === 'number' && max > 0) {
        boarData.initialTargetHpPct = Math.max(0, Math.min(100, (hp / max) * 100));
      }
    }

    const last = boarData.charges[boarData.charges.length - 1];

    if (!last || e.timestamp > last.startTs + CHARGE_CLUSTER_MS) {
      boarData.charges.push({
        startTs: e.timestamp,
        totalDamage: dmg,
        hitTargets: new Set(e.targetID != null ? [e.targetID as number] : []),
        lastLineTs: e.timestamp,
      });
    } else {
      last.totalDamage += dmg;
      if (e.targetID != null) last.hitTargets.add(e.targetID as number);
      last.lastLineTs = e.timestamp;
    }

    boarData.totalChargeDamage += dmg;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Presentation (bars by kind: WYVERN=Perfect, BEAR=Good, BOAR=Ok)
  // ─────────────────────────────────────────────────────────────────────────────

  private perfForKind(kind: BeastKind): QualitativePerformance {
    if (kind === 'WYVERN') return QualitativePerformance.Perfect;
    if (kind === 'BEAR') return QualitativePerformance.Good;
    return QualitativePerformance.Ok;
  }

  private wyvernItems(spawn: HowlSpawn): ChecklistUsageInfo[] {
    const seg = this.wyvernSegmentForSpawn(spawn);
    if (!seg) {
      return [
        {
          check: 'wyvern-none',
          timestamp: spawn.startedAtTs,
          performance: this.perfForKind('WYVERN'),
          summary: <>Wyvern&#39;s Cry: no uptime recorded for this spawn</>,
          details: <div key="wyv-none">No apply detected after this spawn.</div>,
        },
      ];
    }

    const durS = (seg.endTs - seg.startTs) / 1000;
    const items: ChecklistUsageInfo[] = [
      {
        check: 'wyvern-uptime',
        timestamp: seg.startTs,
        performance: this.perfForKind('WYVERN'),
        summary: <>Wyvern&#39;s Cry uptime: {durS.toFixed(1)}s</>,
        details: (
          <div key="wyv-uptime">
            From {((seg.startTs - this.owner.fight.start_time) / 1000).toFixed(3)}s to{' '}
            {((seg.endTs - this.owner.fight.start_time) / 1000).toFixed(3)}s
          </div>
        ),
      },
    ];

    if (seg.endedBy === 'refresh') {
      items.push({
        check: 'wyvern-refreshed',
        timestamp: seg.endTs,
        performance: this.perfForKind('WYVERN'),
        summary: (
          <>Buff refreshed @ {((seg.endTs - this.owner.fight.start_time) / 1000).toFixed(3)}s</>
        ),
        details: <div key="wyv-ref">Wyvern&#39;s Cry was extended (new apply while active).</div>,
      });
    }

    return items;
  }

  private formatDamage(num: number) {
    if (num === null || num === undefined) return '0';
    if (Math.abs(num) >= 1.0e9) return (num / 1.0e9).toFixed(1) + 'B';
    if (Math.abs(num) >= 1.0e6) return (num / 1.0e6).toFixed(1) + 'M';
    if (Math.abs(num) >= 1.0e3) return (num / 1.0e3).toFixed(1) + 'K';
    return num.toString();
  }

  private bearItems(spawn: HowlSpawn): ChecklistUsageInfo[] {
    const bearData = this.ensureBear(spawn);
    return [
      {
        check: 'bear-rend-damage',
        timestamp: spawn.startedAtTs,
        performance: this.perfForKind('BEAR'),
        summary: (
          <>
            Bear Rend Flesh dmg: <ItemDamageDone amount={bearData.totalRendDamage} />
          </>
        ),
        details: (
          <div key="bear-dmg">
            Sum of raw <SpellLink spell={SPELLS.BEAR_REND_FLESH} /> damage within ~12s of spawn
            (window closed at{' '}
            {((bearData.windowEndTs - this.owner.fight.start_time) / 1000).toFixed(3)}s).
          </div>
        ),
      },
      {
        check: 'bear-rend-targets',
        timestamp: spawn.startedAtTs,
        performance: this.perfForKind('BEAR'),
        summary: <>Rend Flesh targets: {bearData.rendTargets.size}</>,
        details: <div key="bear-targets">Unique targets afflicted by Rend Flesh.</div>,
      },
    ];
  }

  private boarItems(spawn: HowlSpawn): ChecklistUsageInfo[] {
    const boarData = this.ensureBoar(spawn);
    const chargesExecuted = Math.min(3, boarData.charges.length);
    const hogParity = boarData.hogRemovesCount === chargesExecuted;

    const items: ChecklistUsageInfo[] = [];

    if (boarData.initialTargetId != null || boarData.initialTargetName) {
      items.push({
        check: 'boar-intended-target',
        timestamp: spawn.startedAtTs,
        performance: this.perfForKind('BOAR'),
        summary: <>Target: {boarData.initialTargetName ?? `ID ${boarData.initialTargetId}`}</>,
        details: (
          <div key="boar-target">
            Target: {boarData.initialTargetName ?? `ID ${boarData.initialTargetId}`}
          </div>
        ),
      });
    }

    if (boarData.initialTargetHpPct != null) {
      items.push({
        check: 'boar-initial-hp',
        timestamp: spawn.startedAtTs,
        performance: this.perfForKind('BOAR'),
        summary: <>Initial target HP: {boarData.initialTargetHpPct.toFixed(1)}%</>,
        details: (
          <div key="boar-hp">
            Target {boarData.initialTargetHpPct.toFixed(1)}% HP. The boar stops dealing damage if
            this target dies, so avoid spawning on low-HP targets unless the fight is ending.
          </div>
        ),
      });
    }

    items.push({
      check: 'boar-charge-damage',
      timestamp: spawn.startedAtTs,
      performance: this.perfForKind('BOAR'),
      summary: <>Boar Charge dmg: {this.formatDamage(boarData.totalChargeDamage)}</>,
      details: (
        <div key="boar-dmg">
          <SpellLink spell={SPELLS.PL_HOGSTRIDER_DAMAGE_1} /> dealt{' '}
          {this.formatDamage(boarData.totalChargeDamage)} total.
        </div>
      ),
    });

    if (this.isSurvival) {
      items.push({
        check: 'boar-cleave',
        timestamp: spawn.startedAtTs,
        performance: this.perfForKind('BOAR'),
        summary: (
          <>
            Cleave targets hit: {boarData.cleaveTargets.size}
            <br />
            {boarData.cleaveTargets.size > 0
              ? `Cleave dmg: ${this.formatDamage(boarData.cleaveDamage)}`
              : ''}
          </>
        ),
        details: (
          <div key="boar-cleave-details">
            In 2+ target situations, consume <SpellLink spell={SPELLS.HOGSTRIDER_BUFF} /> between
            charges for Survival to maximize cleave value.
          </div>
        ),
      });
    }

    items.push({
      check: 'boar-hog-parity',
      timestamp: spawn.startedAtTs,
      performance: this.perfForKind('BOAR'),
      summary: (
        <>
          Hogstrider consumed: {boarData.hogRemovesCount}/{chargesExecuted}{' '}
          {hogParity ? 'Perfect' : 'Missed consumption'}
        </>
      ),
      details: (
        <div key="boar-hog">
          {chargesExecuted === 3
            ? `${boarData.hogRemovesCount} cleaved casts out of ${chargesExecuted}. Your boar hit all 3 charges.`
            : 'Your boar missed a charge. Avoid targeting low-HP foes.'}
        </div>
      ),
    });

    return items;
  }

  private toChecklist(spawn: HowlSpawn): ChecklistUsageInfo[] {
    if (spawn.kind === 'WYVERN') return this.wyvernItems(spawn);
    if (spawn.kind === 'BEAR') return this.bearItems(spawn);
    return this.boarItems(spawn);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Finalize
  // ─────────────────────────────────────────────────────────────────────────────

  private finalize = () => {
    // If Wyvern’s Cry still active at fight end, close it as a remove
    if (this.wyvernCurrentStartTs != null) {
      this.wyvernSegments.push({
        startTs: this.wyvernCurrentStartTs,
        endTs: this.owner.currentTimestamp,
        endedBy: 'remove',
      });
      this.wyvernCurrentStartTs = null;
    }

    // Close any open boar window at fight end
    if (this.currentBoarSpawn && this.currentBoarSpawn.boar) {
      const boarData = this.currentBoarSpawn.boar;
      if (boarData.windowEndTs === OPEN_UNTIL_FAR_FUTURE) {
        boarData.windowEndTs = this.owner.currentTimestamp;
      }
    }

    // Build clickable boxes
    this.uses = this.spawns.map((spawn) => ({
      event: spawn.event,
      performance: this.perfForKind(spawn.kind), // WYVERN=Perfect, BEAR=Good, BOAR=Ok
      checklistItems: this.toChecklist(spawn),
      performanceExplanation: '',
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Guide subsection
  // ─────────────────────────────────────────────────────────────────────────────

  get guideSubsection(): JSX.Element | null {
    if (!this.active) return null;

    const explanation = (
      <>
        <p>
          <SpellLink spell={SPELLS.HOWL_OF_THE_PACKLEADER_BUFF} /> Each box is one spawn, anchored
          to the <b>removal</b> of its Howl–&lt;Beast&gt; buff.
          <br />
          <br />
          <b>Wyvern</b>: <SpellLink spell={SPELLS.WYVERNS_CRY} /> applies a % damage buff.
          <br />
          <b>Bear</b>: Summons a bear that applies <SpellLink spell={SPELLS.BEAR_REND_FLESH} />. Aim
          to maximize the number of targets hit when spawning a bear.
          <br />
          <b>Boar</b>: A boar charges your target with a ~3s delay before charging again for a total
          of 3 charges. Each charge deals damage and applies{' '}
          <SpellLink spell={SPELLS.HOGSTRIDER_BUFF} />. In AoE/Cleave for Survival, consume
          Hogstrider before the next charge.
        </p>
      </>
    );

    return (
      <SpellUsageSubSection
        title="Howl of the Pack Leader"
        explanation={explanation}
        uses={this.uses}
        castBreakdownSmallText="- Colored bars: Wyvern (Perfect), Bear (Good), Boar (Ok). Click for per-spawn details."
        noCastsTexts={{
          noCastsOverride: (
            <>
              No spawns detected for <SpellLink spell={SPELLS.HOWL_OF_THE_PACKLEADER_BUFF} />.
            </>
          ),
        }}
      />
    );
  }
}
