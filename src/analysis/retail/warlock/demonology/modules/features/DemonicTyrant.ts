import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  FightEndEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import SoulShardTracker from 'analysis/retail/warlock/shared/resources/SoulShardTracker';

const DREADSTALKERS_DURATION = 12000;
const GRIMOIRE_DURATION = 20000;
const DOOMGUARD_DURATION = 12000;
export const TYRANT_WINDOW_MS = 25000; //adds 5 seconds to the end to account for Apex window
const DEMONIC_POWER_SPELL_ID = 1276788;

export default class DemonicTyrant extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
    spellUsable: SpellUsable,
  };
  protected soulShardTracker!: SoulShardTracker;
  protected spellUsable!: SpellUsable;

  tyrantData: TyrantCastData[] = [];
  currentTyrant: TyrantCastData | null = null;

  lastDreadstalkersCast = 0;
  lastGrimoireCast = 0;
  lastDoomguardCast = 0;
  demonicCoreStacks = 0;
  // Last known shard count from SoulShardTracker while inside a Tyrant window.
  latestShardsInWindow = 0;
  // Tracks gains (in shards) after Tyrant cast to retroactively compute shardsOnCast from the first window spender.
  private gainsBeforeFirstWindowSpend = 0;
  private pendingRetroactiveShardsOnCast = false;

  constructor(options: Options) {
    super(options);

    // Tyrant cast
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DEMONIC_TYRANT),
      this.onTyrantCast,
    );

    // Hand of Gul'dan and Ruination (Diabolist) — both count as shard spender casts
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.HAND_OF_GULDAN_CAST, SPELLS.RUINATION_CAST]),
      this.onSpenderCast,
    );

    // Dreadstalkers cast
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CALL_DREADSTALKERS),
      this.onDreadstalkersCast,
    );

    // Grimoire: Imp Lord / Fel Ravager cast tracking
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.GRIMOIRE_IMP_LORD_TALENT),
      this.onGrimoireCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.GRIMOIRE_FEL_RAVAGER_TALENT),
      this.onGrimoireCast,
    );

    // Doomguard cast tracking
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SUMMON_DOOMGUARD_TALENT),
      this.onDoomguardCast,
    );

    // Demonic Core stack tracking
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF),
      this.onDemonicCoreApply,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF),
      this.onDemonicCoreApplyStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF),
      this.onDemonicCoreRemove,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CORE_BUFF),
      this.onDemonicCoreRemoveStack,
    );

    // Track shard gains — use to(SELECTED_PLAYER) since energize events target the player, not sourced by them.
    this.addEventListener(Events.resourcechange.to(SELECTED_PLAYER), this.onShardGain);

    // Track shard costs for all player casts during the window
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onAnyPlayerCast);

    // Finalize last window at fight end
    this.addEventListener(Events.fightend, this.onFightEnd);

    // Demonic Power stack tracking (not filtered to SELECTED_PLAYER — Tyrant is a pet)
    this.addEventListener(Events.applybuff, this.onDemonicPower);
    this.addEventListener(Events.applybuffstack, this.onDemonicPower);
  }

  onTyrantCast(event: CastEvent) {
    const timeSinceDreadstalkers = event.timestamp - this.lastDreadstalkersCast;

    const dreadstalkersActive = timeSinceDreadstalkers <= DREADSTALKERS_DURATION;
    const dreadstalkersTooEarly =
      dreadstalkersActive && timeSinceDreadstalkers > DREADSTALKERS_DURATION / 2;

    const shardsOnCast = this.soulShardTracker.current;
    const demonicCoresOnCast = this.demonicCoreStacks;

    // Resolve which Grimoire talent the player has and whether it was cast before this Tyrant.
    const grimoireTalent = this.selectedCombatant.hasTalent(TALENTS.GRIMOIRE_IMP_LORD_TALENT)
      ? TALENTS.GRIMOIRE_IMP_LORD_TALENT
      : this.selectedCombatant.hasTalent(TALENTS.GRIMOIRE_FEL_RAVAGER_TALENT)
        ? TALENTS.GRIMOIRE_FEL_RAVAGER_TALENT
        : null;
    const grimoireAvailable = grimoireTalent
      ? this.spellUsable.isAvailable(grimoireTalent.id)
      : null;
    const grimoireCast =
      grimoireAvailable != null
        ? this.lastGrimoireCast !== 0 &&
          event.timestamp - this.lastGrimoireCast <= GRIMOIRE_DURATION
        : null;

    // Check if Doomguard was cast recently enough to still be active during this Tyrant window.
    const doomguardAvailable = this.selectedCombatant.hasTalent(TALENTS.SUMMON_DOOMGUARD_TALENT)
      ? this.spellUsable.isAvailable(TALENTS.SUMMON_DOOMGUARD_TALENT.id)
      : null;
    const doomguardCast =
      doomguardAvailable != null
        ? this.lastDoomguardCast !== 0 &&
          event.timestamp - this.lastDoomguardCast <= DOOMGUARD_DURATION
        : null;

    // Close the previous window before opening a new one.
    this.tryFinalizeWindow(event.timestamp);
    this.latestShardsInWindow = this.soulShardTracker.current;
    this.gainsBeforeFirstWindowSpend = 0;
    // Only needed before the first ever spend — after that the tracker has accurate absolute state.
    this.pendingRetroactiveShardsOnCast = this.soulShardTracker.spent === 0;

    const tyrant: TyrantCastData = {
      cast: event.timestamp,
      handOfGuldanCasts: 0,
      maxDemonicPowerStacks: 0,
      dreadstalkersActive,
      dreadstalkersTooEarly,
      shardsOnCast,
      demonicCoresOnCast,
      grimoireAvailable,
      grimoireCast,
      doomguardAvailable,
      doomguardCast,
      shardsAtWindowEnd: null,
      fightEndedDuringWindow: false,
      actualWindowDurationMs: TYRANT_WINDOW_MS,
      dreadstalkersCastDuringWindow: false,
      grimoireCastDuringWindow: false,
    };

    this.tyrantData.push(tyrant);
    this.currentTyrant = tyrant;
  }

  onSpenderCast(event: CastEvent) {
    if (!this.currentTyrant) return;

    this.tryFinalizeWindow(event.timestamp);

    if (event.timestamp > this.currentTyrant.cast + TYRANT_WINDOW_MS) return;

    // Retroactively set shardsOnCast: first spender's pre-spend amount minus gains since Tyrant cast.
    if (this.pendingRetroactiveShardsOnCast) {
      const resource = this.soulShardTracker.getResource(event);
      if (resource !== undefined) {
        this.currentTyrant.shardsOnCast = Math.max(
          0,
          Math.round(resource.amount - this.gainsBeforeFirstWindowSpend),
        );
      }
      this.pendingRetroactiveShardsOnCast = false;
    }

    this.currentTyrant.handOfGuldanCasts += 1;
  }

  // Snapshots the shard count at window end once the window has expired.
  tryFinalizeWindow(timestamp: number) {
    if (!this.currentTyrant) return;
    if (this.currentTyrant.shardsAtWindowEnd !== null) return;
    if (timestamp > this.currentTyrant.cast + TYRANT_WINDOW_MS) {
      this.currentTyrant.shardsAtWindowEnd = Math.round(Math.max(0, this.latestShardsInWindow));
    }
  }

  // Closes the active window early and flags it if the fight ends before the window naturally expires.
  onFightEnd(event: FightEndEvent) {
    if (!this.currentTyrant) return;
    if (this.currentTyrant.shardsAtWindowEnd === null) {
      this.currentTyrant.shardsAtWindowEnd = Math.round(Math.max(0, this.latestShardsInWindow));
    }
    if (event.timestamp < this.currentTyrant.cast + TYRANT_WINDOW_MS) {
      this.currentTyrant.fightEndedDuringWindow = true;
      this.currentTyrant.actualWindowDurationMs = event.timestamp - this.currentTyrant.cast;
    }
  }

  onDreadstalkersCast(event: CastEvent) {
    this.lastDreadstalkersCast = event.timestamp;
    if (
      this.currentTyrant &&
      event.timestamp > this.currentTyrant.cast &&
      event.timestamp <= this.currentTyrant.cast + TYRANT_WINDOW_MS
    ) {
      this.currentTyrant.dreadstalkersCastDuringWindow = true;
    }
  }

  // Records last Grimoire cast timestamp and flags if it fell inside the Tyrant window.
  onGrimoireCast(event: CastEvent) {
    this.lastGrimoireCast = event.timestamp;
    if (
      this.currentTyrant &&
      event.timestamp > this.currentTyrant.cast &&
      event.timestamp <= this.currentTyrant.cast + TYRANT_WINDOW_MS
    ) {
      this.currentTyrant.grimoireCastDuringWindow = true;
    }
  }

  // Records last Doomguard cast timestamp for pre-Tyrant alignment checks.
  onDoomguardCast(event: CastEvent) {
    this.lastDoomguardCast = event.timestamp;
  }

  onShardGain(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.SOUL_SHARDS.id) return;
    if (!this.currentTyrant) return;
    if (event.timestamp > this.currentTyrant.cast + TYRANT_WINDOW_MS) return;

    // Accumulate effective gains (÷10 from ×10 log units) until the first window spender.
    if (this.pendingRetroactiveShardsOnCast) {
      const lastUpdate = this.soulShardTracker.resourceUpdates.at(-1);
      if (lastUpdate?.type === 'gain') {
        this.gainsBeforeFirstWindowSpend += (lastUpdate.change ?? 0) / 10;
      }
    }

    this.latestShardsInWindow = this.soulShardTracker.current;
  }

  onAnyPlayerCast(event: CastEvent) {
    if (!this.currentTyrant) return;
    if (event.timestamp > this.currentTyrant.cast + TYRANT_WINDOW_MS) return;
    this.latestShardsInWindow = this.soulShardTracker.current;
  }

  onDemonicCoreApply(_event: ApplyBuffEvent) {
    this.demonicCoreStacks = 1;
  }

  onDemonicCoreApplyStack(event: ApplyBuffStackEvent) {
    this.demonicCoreStacks = event.stack;
  }

  onDemonicCoreRemove(_event: RemoveBuffEvent) {
    this.demonicCoreStacks = 0;
  }

  onDemonicCoreRemoveStack(event: RemoveBuffStackEvent) {
    this.demonicCoreStacks = event.stack;
  }

  // Tracks the peak Demonic Power stack count reached during the Tyrant window (listens to all sources, not just SELECTED_PLAYER).
  onDemonicPower(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    if (!this.currentTyrant) return;

    if (event.timestamp > this.currentTyrant.cast + TYRANT_WINDOW_MS) return;

    if (event.ability?.guid !== DEMONIC_POWER_SPELL_ID) return;

    let stacks = 1;

    if ('stack' in event) {
      stacks = (event as ApplyBuffStackEvent).stack ?? 1;
    }

    if (stacks > this.currentTyrant.maxDemonicPowerStacks) {
      this.currentTyrant.maxDemonicPowerStacks = stacks;
    }
  }
}

export interface TyrantCastData {
  cast: number;
  handOfGuldanCasts: number;
  maxDemonicPowerStacks: number;
  dreadstalkersActive: boolean;
  dreadstalkersTooEarly: boolean;
  shardsOnCast: number;
  demonicCoresOnCast: number;
  /** null if neither Grimoire: Imp Lord nor Grimoire: Fel Ravager is talented */
  grimoireAvailable: boolean | null;
  /** null if neither Grimoire: Imp Lord nor Grimoire: Fel Ravager is talented */
  grimoireCast: boolean | null;
  /** null if not talented */
  doomguardAvailable: boolean | null;
  /** null if not talented */
  doomguardCast: boolean | null;
  shardsAtWindowEnd: number | null;
  fightEndedDuringWindow: boolean;
  /** Actual window duration in ms — shorter than TYRANT_WINDOW_MS if the fight ended early */
  actualWindowDurationMs: number;
  dreadstalkersCastDuringWindow: boolean;
  grimoireCastDuringWindow: boolean;
}
