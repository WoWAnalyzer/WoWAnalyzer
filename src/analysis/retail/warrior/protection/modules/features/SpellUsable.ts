import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbilityEvent,
  ApplyBuffEvent,
  CastEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/warrior';

const COOLDOWN_LAG_BUFFER_MS = 250;
const THUNDER_CLAP_COOLDOWN_LAG_BUFFER_MS = 2000;
const STORM_SURGE_CDR_MULTIPLIER = 2;

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    globalCooldown: GlobalCooldown,
  };
  hasDevastator: boolean;
  lastPotentialTriggerForShieldSlam: CastEvent | null = null;
  protected globalCooldown!: GlobalCooldown;

  constructor(options: Options) {
    super(options);
    this.hasDevastator = this.selectedCombatant.hasTalent(TALENTS.DEVASTATOR_TALENT);

    // WCL exposes some Shield Slam resets as buff events instead of cooldown events
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM_RESET_BUFF),
      this.onShieldSlamReset,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM_RESET_BUFF),
      this.onShieldSlamReset,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM),
      this.onShieldSlamReset,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM),
      this.onShieldSlamReset,
    );
  }

  onShieldSlamReset(event: ApplyBuffEvent | RefreshBuffEvent) {
    // Explicit reset signals are more accurate than the Strategist fallback
    this.endCooldown(SPELLS.SHIELD_SLAM.id, event.timestamp);
    this.lastPotentialTriggerForShieldSlam = null;
  }

  onCast(event: CastEvent) {
    super.onCast(event);
    const spellId = event.ability.guid;
    if (spellId === SPELLS.MELEE.id && this.hasDevastator) {
      this.lastPotentialTriggerForShieldSlam = event;
    } else if (
      // Strategist Shield Slam resets are not directly logged. If Shield Slam is cast before
      // our tracker expected it, backdate the reset to the last spell that could have procced it
      spellId === SPELLS.DEVASTATE.id ||
      spellId === SPELLS.EXECUTE.id ||
      spellId === SPELLS.THUNDER_CLAP.id ||
      spellId === SPELLS.THUNDER_BLAST.id ||
      spellId === SPELLS.REVENGE.id
    ) {
      this.lastPotentialTriggerForShieldSlam = { ...event };
      // Reset the cooldown after the GCD of the likely proc trigger
      this.lastPotentialTriggerForShieldSlam.timestamp +=
        this.globalCooldown.getGlobalCooldownDuration(spellId);
    } else if (spellId === SPELLS.SHIELD_SLAM.id) {
      this.lastPotentialTriggerForShieldSlam = null;
    }
  }

  beginCooldown(
    cooldownTriggerEvent: AbilityEvent<any>,
    spellId = cooldownTriggerEvent.ability.guid,
  ) {
    const trackedSpellId = this.getTrackedSpellId(spellId);

    if (trackedSpellId === SPELLS.SHIELD_SLAM.id) {
      if (this.isOnCooldown(trackedSpellId) && this.lastPotentialTriggerForShieldSlam) {
        // Backdate inferred Strategist resets to the last plausible trigger
        this.endCooldown(
          trackedSpellId,
          Math.min(
            this.lastPotentialTriggerForShieldSlam.timestamp,
            cooldownTriggerEvent.timestamp,
          ),
        );
      }
    } else if (
      this.isOnCooldown(trackedSpellId) &&
      this.cooldownRemaining(trackedSpellId, cooldownTriggerEvent.timestamp) <=
        this.getCooldownLagBuffer(trackedSpellId)
    ) {
      // Treat small early casts as natural cooldown completions with loose WCL timestamps
      this.endCooldown(trackedSpellId, cooldownTriggerEvent.timestamp);
    }

    super.beginCooldown(cooldownTriggerEvent, trackedSpellId);
  }

  public isAvailable(spellId: number): boolean {
    return super.isAvailable(this.getTrackedSpellId(spellId));
  }

  public isOnCooldown(spellId: number): boolean {
    return super.isOnCooldown(this.getTrackedSpellId(spellId));
  }

  public fractionalChargesAvailable(spellId: number): number {
    return super.fractionalChargesAvailable(this.getTrackedSpellId(spellId));
  }

  public chargesAvailable(spellId: number): number {
    return super.chargesAvailable(this.getTrackedSpellId(spellId));
  }

  public chargesOnCooldown(spellId: number): number {
    return super.chargesOnCooldown(this.getTrackedSpellId(spellId));
  }

  public fullCooldownDuration(spellId: number): number {
    return super.fullCooldownDuration(this.getTrackedSpellId(spellId));
  }

  public cooldownRemaining(
    spellId: number,
    timestamp: number = this.owner.currentTimestamp,
  ): number {
    return super.cooldownRemaining(this.getTrackedSpellId(spellId), timestamp);
  }

  public endCooldown(
    spellId: number,
    timestamp: number = this.owner.currentTimestamp,
    resetCooldown = false,
    restoreAllCharges = false,
  ) {
    super.endCooldown(this.getTrackedSpellId(spellId), timestamp, resetCooldown, restoreAllCharges);
  }

  public reduceCooldown(
    spellId: number,
    reductionMs: number,
    timestamp: number = this.owner.currentTimestamp,
  ): number {
    return super.reduceCooldown(this.getTrackedSpellId(spellId), reductionMs, timestamp);
  }

  public applyCooldownRateChange(
    spellId: number | number[] | 'ALL',
    rateMultiplier: number,
    timestamp: number = this.owner.currentTimestamp,
  ) {
    super.applyCooldownRateChange(this.getTrackedSpellIds(spellId), rateMultiplier, timestamp);
  }

  public removeCooldownRateChange(
    spellId: number | number[] | 'ALL',
    rateMultiplier: number,
    timestamp: number = this.owner.currentTimestamp,
  ) {
    const trackedSpellIds = this.getTrackedSpellIds(spellId);
    const thunderClapCooldown = this._currentCooldowns[SPELLS.THUNDER_CLAP.id];
    const preserveThunderClapCooldown =
      rateMultiplier === STORM_SURGE_CDR_MULTIPLIER &&
      trackedSpellIds !== 'ALL' &&
      (trackedSpellIds === SPELLS.THUNDER_CLAP.id ||
        (Array.isArray(trackedSpellIds) && trackedSpellIds.includes(SPELLS.THUNDER_CLAP.id))) &&
      thunderClapCooldown;
    const thunderClapExpectedEnd = thunderClapCooldown?.expectedEnd;
    const thunderClapRechargeDuration = thunderClapCooldown?.currentRechargeDuration;

    // Core mod-rate removal preserves percentage progress, but Storm Surge is only a temporary boost
    super.removeCooldownRateChange(this.getTrackedSpellIds(spellId), rateMultiplier, timestamp);

    if (
      preserveThunderClapCooldown &&
      thunderClapExpectedEnd !== undefined &&
      thunderClapRechargeDuration !== undefined
    ) {
      // Storm Surge should not extend cooldowns that started while Avatar was active
      thunderClapCooldown.expectedEnd = thunderClapExpectedEnd;
      thunderClapCooldown.currentRechargeDuration = thunderClapRechargeDuration;
    }
  }

  private getTrackedSpellIds(spellId: number | number[] | 'ALL'): number | number[] | 'ALL' {
    if (spellId === 'ALL') {
      return spellId;
    }

    if (Array.isArray(spellId)) {
      return [...new Set(spellId.map((id) => this.getTrackedSpellId(id)))];
    }

    return this.getTrackedSpellId(spellId);
  }

  private getCooldownLagBuffer(spellId: number): number {
    if (spellId === SPELLS.THUNDER_CLAP.id) {
      // Thunder Clap has several proc and rate-change paths that WCL timestamps loosely
      return THUNDER_CLAP_COOLDOWN_LAG_BUFFER_MS;
    }

    return COOLDOWN_LAG_BUFFER_MS;
  }

  private getTrackedSpellId(spellId: number): number {
    if (spellId === SPELLS.THUNDER_BLAST.id) {
      // Thunder Blast spends Thunder Clap's cooldown and charges
      return SPELLS.THUNDER_CLAP.id;
    }

    return spellId;
  }
}

export default SpellUsable;
