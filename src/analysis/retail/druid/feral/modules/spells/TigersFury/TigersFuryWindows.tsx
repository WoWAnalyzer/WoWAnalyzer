import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  RefreshBuffEvent,
  RefreshDebuffEvent,
} from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import EnergyTracker from 'analysis/retail/druid/feral/modules/core/energy/EnergyTracker';
import ComboPointTracker from 'analysis/retail/druid/feral/modules/core/combopoints/ComboPointTracker';
import {
  getTigersFuryDamageBonus,
  getTigersFuryDuration,
  TIGERS_FURY_BOOSTED,
} from 'analysis/retail/druid/feral/constants';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';
import TigersFuryWindowsSection from './TigersFuryWindowsSection';

const MELEE_SPELL_ID = 1;

/** DoT spells whose ticks carry the TF damage bonus only when the *snapshot* was taken under TF. */
const TF_SNAPSHOT_DEBUFFS = [SPELLS.RIP, SPELLS.RAKE_BLEED, SPELLS.MOONFIRE_FERAL];

/**
 * Per-window breakdown of casts inside each Tiger's Fury, modeled on Warcraft Logs' ability
 * window view. Auto-attacks are filtered out; Convoke-triggered casts are tagged so they can
 * be distinguished from manual rotation choices.
 *
 * Each window also reports the damage attributable specifically to TF's damage bonus (the bonus
 * portion of TIGERS_FURY_BOOSTED hits that land in the window). Direct hits count when the player
 * has the TF buff up; snapshotted DoT ticks count when their last application was made under TF,
 * mirroring CarnivorousInstinct.
 */
class TigersFuryWindows extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
    comboPointTracker: ComboPointTracker,
  };

  protected energyTracker!: EnergyTracker;
  protected comboPointTracker!: ComboPointTracker;

  windows: TfWindow[] = [];
  /** Full TF damage bonus, including Carnivorous Instinct rank. Constant per fight. */
  private tfDamageBonus = 0;

  /** Per spell ID, the targets whose current snapshot of that DoT was taken under TF.
   *  Pre-populated for every spell in TF_SNAPSHOT_DEBUFFS so .get() never returns undefined
   *  inside the listener (which is filtered to those same spells). */
  private tfSnapshottedTargets: Map<number, Set<string>> = new Map(
    TF_SNAPSHOT_DEBUFFS.map((spell) => [spell.id, new Set<string>()]),
  );

  constructor(options: Options) {
    super(options);

    this.tfDamageBonus = getTigersFuryDamageBonus(this.selectedCombatant);

    // applybuff (and refreshbuff for back-to-back recasts) fires before TF's energize, so reading
    // EnergyTracker.current here gives the pre-cast value. The cast event is too late.
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TIGERS_FURY),
      this.onTfBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TIGERS_FURY),
      this.onTfBuff,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onAnyCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onAnyDamage);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TIGERS_FURY_BOOSTED),
      this.onBoostedDamage,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(TF_SNAPSHOT_DEBUFFS),
      this.onTfSnapshotApply,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(TF_SNAPSHOT_DEBUFFS),
      this.onTfSnapshotApply,
    );
  }

  onTfBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.windows.push({
      castTimestamp: event.timestamp,
      durationMs: getTigersFuryDuration(this.selectedCombatant),
      energyAtStart: this.energyTracker.current,
      cpsAtStart: this.comboPointTracker.current,
      casts: [],
      tfBonusDamage: 0,
      totalDamage: 0,
    });
  }

  onAnyCast(event: CastEvent) {
    const window = this.currentWindow(event.timestamp);
    if (!window) {
      return;
    }
    // melee auto-attacks would spam the sequence
    if (event.ability.guid === MELEE_SPELL_ID) {
      return;
    }
    const fromConvoke =
      event.ability.guid !== SPELLS.CONVOKE_SPIRITS.id && isConvoking(this.selectedCombatant);
    window.casts.push({
      offsetMs: event.timestamp - window.castTimestamp,
      spellId: event.ability.guid,
      spellName: event.ability.name,
      fromConvoke,
    });
  }

  onAnyDamage(event: DamageEvent) {
    const window = this.currentWindow(event.timestamp);
    if (!window) {
      return;
    }
    window.totalDamage += (event.amount ?? 0) + (event.absorbed ?? 0);
  }

  onBoostedDamage(event: DamageEvent) {
    if (!this.damageBenefitsFromTf(event)) {
      return;
    }
    const window = this.currentWindow(event.timestamp);
    if (!window) {
      return;
    }
    window.tfBonusDamage += calculateEffectiveDamage(event, this.tfDamageBonus);
  }

  /** Mirrors CarnivorousInstinct: direct hits check the live buff, DoT ticks check the snapshot. */
  private damageBenefitsFromTf(event: DamageEvent): boolean {
    const set = this.tfSnapshottedTargets.get(event.ability.guid);
    if (set) {
      return set.has(encodeEventTargetString(event) || '');
    }
    return this.selectedCombatant.hasBuff(SPELLS.TIGERS_FURY.id);
  }

  onTfSnapshotApply(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    const set = this.tfSnapshottedTargets.get(event.ability.guid);
    if (!set) {
      return; // shouldn't happen — listener is filtered to TF_SNAPSHOT_DEBUFFS
    }
    const target = encodeEventTargetString(event) || '';
    if (this.selectedCombatant.hasBuff(SPELLS.TIGERS_FURY.id)) {
      set.add(target);
    } else {
      set.delete(target);
    }
  }

  private currentWindow(timestamp: number): TfWindow | undefined {
    const window = this.windows[this.windows.length - 1];
    if (!window || timestamp > window.castTimestamp + window.durationMs) {
      return undefined;
    }
    return window;
  }

  get guideSubsection(): JSX.Element {
    return <TigersFuryWindowsSection windows={this.windows} owner={this.owner} />;
  }
}

export interface WindowCast {
  offsetMs: number;
  spellId: number;
  spellName: string;
  fromConvoke: boolean;
}

export interface TfWindow {
  castTimestamp: number;
  durationMs: number;
  energyAtStart: number;
  cpsAtStart: number;
  casts: WindowCast[];
  /** Damage attributable to TF's damage bonus for boosted hits landing in this window. */
  tfBonusDamage: number;
  /** Raw player damage (any spell) that landed inside this window. */
  totalDamage: number;
}

export default TigersFuryWindows;
