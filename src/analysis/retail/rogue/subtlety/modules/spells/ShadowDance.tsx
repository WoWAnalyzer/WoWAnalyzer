import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  ApplyBuffEvent,
  CastEvent,
  GetRelatedEvent,
  GetRelatedEvents,
  EventType,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import AlwaysBeCasting from 'analysis/retail/rogue/subtlety/modules/features/AlwaysBeCasting';
import { ThresholdStyle } from 'parser/core/ParseResults';
import EnergyTracker from 'analysis/retail/rogue/shared/EnergyTracker';
import ComboPointTracker from 'analysis/retail/rogue/shared/ComboPointTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { getHeroTree, hasAncientArts3, HeroTree } from '../../constants';

/**
 * Secret Technique coming off cooldown a moment into the window is still expected to be used, so
 * a cooldown shorter than this counts as available on entry.
 */
export const SECRET_TECHNIQUE_GRACE_MS = 2000;

/**
 * Shadow Dance and Secret Technique are usually sent by the same macro, so their events can land
 * in either order within a few milliseconds. A Secret Technique cast this close to the window
 * opening belongs to it, even though SpellUsable has already started its cooldown by then.
 */
export const SECRET_TECHNIQUE_PAIRING_BUFFER_MS = 250;

/** The finishers that can be spent inside a Shadow Dance window. */
const FINISHER_SPELL_IDS: number[] = [
  SPELLS.EVISCERATE.id,
  SPELLS.BLACK_POWDER.id,
  SPELLS.SECRET_TECHNIQUE.id,
];

export default class ShadowDance extends Analyzer.withDependencies({
  abilityTracker: AbilityTracker,
  alwaysBeCasting: AlwaysBeCasting,
  energyTracker: EnergyTracker,
  comboPointTracker: ComboPointTracker,
  spellUsable: SpellUsable,
}) {
  protected abilityTracker!: AbilityTracker;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected energyTracker!: EnergyTracker;
  protected comboPointTracker!: ComboPointTracker;
  protected spellUsable!: SpellUsable;

  // Conditional talent checks
  hasShadowBlades: boolean = this.selectedCombatant.hasTalent(TALENTS.SHADOW_BLADES_TALENT);
  heroTree: HeroTree = getHeroTree(this.selectedCombatant);
  ancientArts3Talented: boolean = hasAncientArts3(this.selectedCombatant);

  danceData: ShadowDanceData[] = [];

  /** How many Shadow Dances have been cast so far inside the current Shadow Blades window. */
  private dancesInCurrentShadowBlades = 0;

  /** Last Secret Technique cast, kept so one fired just before the window still counts as part of it. */
  private lastSecretTechnique: DanceCast | null = null;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_DANCE_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_BLADES_TALENT),
      this.onShadowBladesApplied,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  /**
   * The standard opener is Shadow Dance -> Shadow Blades: both are off-GCD and instant, so the
   * first dance of the pair is already running by the time Shadow Blades lands. A window that is
   * still open at that point therefore counts as the first dance of this Shadow Blades, otherwise
   * the dance that follows would be numbered first and the second-dance exemption would land on
   * the wrong window.
   */
  private onShadowBladesApplied(event: ApplyBuffEvent) {
    const openDance = this.currentDance(event.timestamp);

    this.dancesInCurrentShadowBlades = openDance ? 1 : 0;

    if (openDance) {
      openDance.danceIndexInShadowBlades = this.dancesInCurrentShadowBlades;
      // The window was opened a moment before Shadow Blades, so treating it as though Shadow
      // Blades was not up would misreport the pair as a cooldown misalignment.
      openDance.shadowBladesActive = true;
    }
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    const damageEvents = this.getDamageEvents(event);
    const removed = this.getRemoveTimestamp(event);
    const shadowBladesActive =
      this.hasShadowBlades &&
      this.selectedCombatant.hasBuff(TALENTS.SHADOW_BLADES_TALENT.id, event.timestamp);

    if (shadowBladesActive) {
      this.dancesInCurrentShadowBlades += 1;
    }

    const pairedSecretTechnique = this.getPairedSecretTechnique(event.timestamp);
    // Consumed: it belongs to this window and must not be attributed to the next one too.
    this.lastSecretTechnique = null;

    this.danceData.push({
      applied: event.timestamp,
      removed: removed,
      damage: damageEvents,
      totalDamage: this.calculateTotalDamage(damageEvents),
      duration: removed - event.timestamp,
      energyAtCast: this.energyTracker.current,
      comboPointsAtCast: this.comboPointTracker.current,
      // Read during the event rather than at render time: SpellUsable only describes the current
      // point in the fight, so reading it later would report the state at fight end for every
      // window.
      // Spending it right as the window opens counts as available: the cooldown SpellUsable
      // reports at this point was started by that very cast.
      secretTechniqueAvailable:
        !this.spellUsable.isOnCooldown(SPELLS.SECRET_TECHNIQUE.id) ||
        pairedSecretTechnique !== null,
      secretTechniqueCooldownRemaining: this.spellUsable.cooldownRemaining(
        SPELLS.SECRET_TECHNIQUE.id,
        event.timestamp,
      ),
      shadowBladesActive,
      danceIndexInShadowBlades: shadowBladesActive ? this.dancesInCurrentShadowBlades : 0,
      // Seeded with the paired cast so finisher ordering sees it in the right position.
      casts: pairedSecretTechnique ? [pairedSecretTechnique] : [],
    });
  }

  /**
   * A Secret Technique cast in the instant before this window opened, if any. Events from the same
   * macro can arrive in either order, so one that landed just before still belongs to the window.
   */
  private getPairedSecretTechnique(danceTimestamp: number): DanceCast | null {
    if (
      !this.lastSecretTechnique ||
      danceTimestamp - this.lastSecretTechnique.timestamp > SECRET_TECHNIQUE_PAIRING_BUFFER_MS ||
      this.lastSecretTechnique.timestamp > danceTimestamp
    ) {
      return null;
    }

    return this.lastSecretTechnique;
  }

  /**
   * Records every cast that lands inside the current Shadow Dance window, along with the two buffs
   * we care about at that exact moment. Buff state has to be sampled here — checking it later
   * would only ever see the end of the fight.
   */
  private onCast(event: CastEvent) {
    const cast: DanceCast = {
      timestamp: event.timestamp,
      spellId: event.ability.guid,
      hasDarkestNight: this.selectedCombatant.hasBuff(
        SPELLS.DARKEST_NIGHT_BUFF.id,
        event.timestamp,
      ),
      hasAncientArts:
        this.ancientArts3Talented &&
        this.selectedCombatant.hasBuff(SPELLS.ANCIENT_ARTS_BUFF.id, event.timestamp),
    };

    const dance = this.currentDance(event.timestamp);

    if (cast.spellId === SPELLS.SECRET_TECHNIQUE.id) {
      // Only worth remembering when no window is open - otherwise it already belongs to that one,
      // and holding on to it could attribute the same cast to a second window as well.
      this.lastSecretTechnique = dance ? null : cast;
    }

    if (!dance) {
      return;
    }

    dance.casts.push(cast);
  }

  private currentDance(timestamp: number): ShadowDanceData | undefined {
    const dance = this.danceData.at(-1);
    if (!dance || timestamp < dance.applied || timestamp > dance.removed) {
      return undefined;
    }
    return dance;
  }

  private getRemoveTimestamp(event: ApplyBuffEvent): number {
    const removeBuff = GetRelatedEvent(event, EventType.RemoveBuff);
    return removeBuff?.timestamp ?? this.owner.fight.end_time;
  }

  private getDamageEvents(event: ApplyBuffEvent): DamageEvent[] {
    return GetRelatedEvents(event, EventType.Damage);
  }

  private calculateTotalDamage(damageEvents: DamageEvent[]): number {
    return damageEvents.reduce((total, dmg) => total + dmg.amount + (dmg.absorb || 0), 0);
  }

  /**
   * Eviscerates cast under Darkest Night that were missing Ancient Arts.
   *
   * The last cast of a Shadow Dance is exempt: there is no room left in the window to line the two
   * buffs up, so dropping Ancient Arts there is expected rather than a mistake.
   */
  getMissedAncientArtsEviscerates(dance: ShadowDanceData): DanceCast[] {
    const lastCast = dance.casts.at(-1);

    return dance.casts.filter(
      (cast) =>
        cast.spellId === SPELLS.EVISCERATE.id &&
        cast.hasDarkestNight &&
        !cast.hasAncientArts &&
        cast !== lastCast,
    );
  }

  /**
   * Position of Secret Technique among the finishers spent in this window, 1-based, or `null` if
   * it was never cast. Only Eviscerate, Black Powder and Secret Technique count as finishers, so
   * builders in between do not push the position out.
   */
  getSecretTechniqueFinisherPosition(dance: ShadowDanceData): number | null {
    const finishers = dance.casts.filter((cast) => FINISHER_SPELL_IDS.includes(cast.spellId));
    const index = finishers.findIndex((cast) => cast.spellId === SPELLS.SECRET_TECHNIQUE.id);

    return index === -1 ? null : index + 1;
  }

  /**
   * Whether Secret Technique could realistically be spent in this window.
   *
   * Actually casting it inside the window is the strongest possible evidence and is checked first:
   * cooldown state sampled at the applybuff can be misleading, because Shadow Dance and Secret
   * Technique are macroed together and SpellUsable may have already started the cooldown from that
   * very cast by the time the buff event is handled.
   *
   * Otherwise it counts as usable when it was off cooldown on entry, or close enough to coming off
   * that it still fits in the window.
   */
  isSecretTechniqueUsable(dance: ShadowDanceData): boolean {
    if (dance.casts.some((cast) => cast.spellId === SPELLS.SECRET_TECHNIQUE.id)) {
      return true;
    }

    return (
      dance.secretTechniqueAvailable ||
      dance.secretTechniqueCooldownRemaining <= SECRET_TECHNIQUE_GRACE_MS
    );
  }

  onFightEnd() {
    this.analyzeDance();
  }

  analyzeDance = () => {
    this.danceData.forEach((d) => {
      const activeTime = this.alwaysBeCasting.getActiveTimeMillisecondsInWindow(
        d.applied,
        d.removed || this.owner.fight.end_time,
      );
      const activeTimePercent = activeTime / ((d.removed || this.owner.fight.end_time) - d.applied);
      d.activeTime = activeTimePercent;
    });
  };

  get averageDamage() {
    return this.danceTotalDamage / this.abilityTracker.getAbility(SPELLS.SHADOW_DANCE.id).casts;
  }

  get averageActiveTime() {
    const active = this.danceData.reduce((active, dance) => active + (dance.activeTime || 0), 0);
    return active / this.abilityTracker.getAbility(SPELLS.SHADOW_DANCE.id).casts;
  }

  get danceTotalDamage() {
    return this.danceData.reduce((total, dance) => total + dance.totalDamage, 0);
  }

  get shadowDanceActiveTimeThresholds() {
    return {
      actual: this.averageActiveTime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export interface DanceCast {
  timestamp: number;
  spellId: number;
  hasDarkestNight: boolean;
  hasAncientArts: boolean;
}

export interface ShadowDanceData {
  applied: number;
  removed: number;
  activeTime?: number;
  damage: DamageEvent[];
  totalDamage: number;
  duration: number;
  numberAbilitiesUsed?: number;
  energyAtCast: number;
  comboPointsAtCast: number;
  secretTechniqueAvailable: boolean;
  /** Milliseconds left on Secret Technique's cooldown when the window opened; 0 when ready. */
  secretTechniqueCooldownRemaining: number;
  shadowBladesActive: boolean;
  /** 1-based position of this dance within the current Shadow Blades window; 0 when none active. */
  danceIndexInShadowBlades: number;
  casts: DanceCast[];
}
