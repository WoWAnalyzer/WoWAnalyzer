import SPELLS from 'common/SPELLS/warlock';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Enemy from 'parser/core/Enemy';
import Enemies from 'parser/shared/modules/Enemies';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const CDR_PER_CAST_MS = 1500;
// Base channel duration (unreduced by haste), used as an upper bound for matching damage to casts.
const CHANNEL_DURATION_MS = 3000;

/** One enemy that was actually struck (and had its DoTs consumed) by a Dark Harvest channel. */
export interface DarkHarvestHit {
  target: Enemy;
  hadAgony: boolean;
  hadCorruption: boolean; // Corruption or Wither depending on talents
  hadUA: boolean | null; // null when Unstable Affliction is not talented
}

export interface DarkHarvestCastData {
  event: CastEvent; // the raw cast event, used by SpellUsageSubSection for timestamps
  timestamp: number;
  hits: DarkHarvestHit[]; // every enemy actually struck during the channel; empty = wasted cast
  hauntActiveOnHit: boolean; // Haunt only affects one enemy at a time, so this is per-cast not per-hit
  cdrGainedMs: number; // total theoretical CDR from UA/SoC casts in the window (numCasts * 1.5s)
  effectiveCdrMs: number; // CDR that actually reduced the cooldown
  wastedCdrMs: number; // CDR applied when DH was already off cooldown
  uaCastsInWindow: number;
  socCastsInWindow: number;
}

class DarkHarvest extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    spellUsable: SpellUsable,
  };
  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;

  witherActive = false;
  uaActive = false;
  hauntActive = false;
  hasCullTheWeak = false;
  casts: DarkHarvestCastData[] = [];

  // Running totals accumulated since the last DH cast
  private currentWindowCdrMs = 0;
  private currentWindowEffectiveCdrMs = 0;
  private currentWindowWastedCdrMs = 0;
  private currentWindowUaCasts = 0;
  private currentWindowSocCasts = 0;

  get fightStart() {
    return this.owner.fight.start_time;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DARK_HARVEST_TALENT);
    if (!this.active) {
      return;
    }

    this.witherActive = this.selectedCombatant.hasTalent(TALENTS.WITHER_TALENT);
    this.uaActive = this.selectedCombatant.hasTalent(TALENTS.UNSTABLE_AFFLICTION_TALENT);
    this.hauntActive = this.selectedCombatant.hasTalent(TALENTS.HAUNT_TALENT);
    this.hasCullTheWeak = this.selectedCombatant.hasTalent(TALENTS.CULL_THE_WEAK_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DARK_HARVEST_TALENT),
      this.onDarkHarvestCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DARK_HARVEST_DAMAGE),
      this.onDarkHarvestDamage,
    );

    if (this.hasCullTheWeak) {
      this.addEventListener(
        Events.cast
          .by(SELECTED_PLAYER)
          .spell([SPELLS.UNSTABLE_AFFLICTION, SPELLS.SEED_OF_CORRUPTION_DEBUFF]),
        this.onCdrCast,
      );
    }
  }

  // Each UA or SoC cast contributes 1.5s of CDR to the current DH window.
  onCdrCast(event: CastEvent) {
    this.currentWindowCdrMs += CDR_PER_CAST_MS;
    if (this.spellUsable.isOnCooldown(TALENTS.DARK_HARVEST_TALENT.id)) {
      const remaining = this.spellUsable.cooldownRemaining(TALENTS.DARK_HARVEST_TALENT.id);
      const effective = Math.min(CDR_PER_CAST_MS, remaining);
      this.currentWindowEffectiveCdrMs += effective;
      this.currentWindowWastedCdrMs += CDR_PER_CAST_MS - effective;
    } else {
      this.currentWindowWastedCdrMs += CDR_PER_CAST_MS;
    }
    if (event.ability.guid === SPELLS.UNSTABLE_AFFLICTION.id) {
      this.currentWindowUaCasts += 1;
    } else {
      this.currentWindowSocCasts += 1;
    }
  }

  onDarkHarvestCast(event: CastEvent) {
    this.casts.push({
      event,
      timestamp: event.timestamp,
      hits: [],
      hauntActiveOnHit: false,
      cdrGainedMs: this.currentWindowCdrMs,
      effectiveCdrMs: this.currentWindowEffectiveCdrMs,
      wastedCdrMs: this.currentWindowWastedCdrMs,
      uaCastsInWindow: this.currentWindowUaCasts,
      socCastsInWindow: this.currentWindowSocCasts,
    });

    // Reset window counters for the next cast
    this.currentWindowCdrMs = 0;
    this.currentWindowEffectiveCdrMs = 0;
    this.currentWindowWastedCdrMs = 0;
    this.currentWindowUaCasts = 0;
    this.currentWindowSocCasts = 0;
  }

  onDarkHarvestDamage(event: DamageEvent) {
    const cast = this.casts[this.casts.length - 1];
    if (!cast || event.timestamp - cast.timestamp > CHANNEL_DURATION_MS) {
      // No open channel this damage tick could belong to — shouldn't normally happen.
      return;
    }

    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }
    // The channel ticks repeatedly; only record each struck enemy once per cast.
    if (cast.hits.some((hit) => hit.target === target)) {
      return;
    }

    const ts = event.timestamp;
    const corruptionId = this.witherActive ? SPELLS.WITHER_DEBUFF.id : SPELLS.CORRUPTION_DEBUFF.id;
    cast.hits.push({
      target,
      hadAgony: target.hasBuff(SPELLS.AGONY.id, ts),
      hadCorruption: target.hasBuff(corruptionId, ts),
      hadUA: this.uaActive ? target.hasBuff(TALENTS.UNSTABLE_AFFLICTION_TALENT.id, ts) : null,
    });
    if (this.hauntActive && target.hasBuff(TALENTS.HAUNT_TALENT.id, ts)) {
      cast.hauntActiveOnHit = true;
    }
  }
}

export default DarkHarvest;
