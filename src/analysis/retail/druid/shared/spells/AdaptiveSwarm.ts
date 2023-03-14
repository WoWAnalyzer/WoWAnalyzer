import SPELLS from 'common/SPELLS';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { SpellInfo } from 'parser/core/EventFilter';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Combatants from 'parser/shared/modules/Combatants';
import Enemies from 'parser/shared/modules/Enemies';
import { TALENTS_DRUID as TALENTS } from 'common/TALENTS/druid';

const FERAL_PERIODIC_BOOST = 0.25; // the amount Adaptive Swarm boosts periodic effects for Feral
const RESTO_PERIODIC_BOOST = 0.2; // the amount Adaptive Swarm boosts periodic effects for Resto

const PERIODIC_HEALS: SpellInfo[] = [
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
  SPELLS.REGROWTH, // adaptive swarm also boosts the direct healing, so no need for 'tick' differentiation
  SPELLS.WILD_GROWTH,
  SPELLS.CULTIVATION,
  SPELLS.SPRING_BLOSSOMS,
  SPELLS.CENARION_WARD_HEAL,
  SPELLS.FRENZIED_REGENERATION,
  SPELLS.LIFEBLOOM_HOT_HEAL,
  SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL,
  SPELLS.TRANQUILITY_HEAL,
  SPELLS.EFFLORESCENCE_HEAL,
  SPELLS.RENEWING_BLOOM,
  SPELLS.GROVE_TENDING,
  // deliberately doesn't include Adaptive Swarm itself to avoid double count
];

// A very wide definition of 'periodic damage', but these are the actual data-mined values...
// Some of these IDs were clearly copy-pasted and don't proc actual damage, omitted for now
/*
  Apply Aura (6) | Modify Damage Taken% from Caster's Spells (271)
  Base Value: 25 | Scaled Value: 25 | PvP Coefficient: 1.00000 | Target: Unknown(25)
  Affected Spells:
    Entangling Roots (339), Rip (1079), Rake (1822), Starfall (50286), Mass Entanglement (102359),
    Thrash (106830), Moonfire (155625), Rake (155722), Moonfire (164812), Sunfire (164815),
    Starfall (191034), Starfall (191037), Thrash (192090), Stellar Flare (202347),
    Shooting Stars (202497), Fury of Elune (202770), Overgrowth (203651), Fury of Elune (211545),
    Brambles (213709), Feral Frenzy (274837), Feral Frenzy (274838), Primal Wrath (285381), Fury of Elune (365640)
 */
const PERIODIC_DAMAGE: SpellInfo[] = [
  SPELLS.ENTANGLING_ROOTS,
  SPELLS.RIP,
  SPELLS.RAKE, // adaptive swarm also boosts the direct damage, so no need for 'tick' differentiation
  TALENTS.MASS_ENTANGLEMENT_TALENT,
  SPELLS.THRASH_FERAL,
  SPELLS.MOONFIRE_FERAL,
  SPELLS.MOONFIRE_DEBUFF,
  SPELLS.SUNFIRE,
  SPELLS.STARFALL,
  SPELLS.THRASH_BEAR_DOT,
  TALENTS.STELLAR_FLARE_TALENT,
  SPELLS.SHOOTING_STARS,
  SPELLS.FURY_OF_ELUNE_DAMAGE,
  SPELLS.BRAMBLES_DAMAGE,
  TALENTS.FERAL_FRENZY_TALENT,
  SPELLS.FERAL_FRENZY_DEBUFF,
  TALENTS.PRIMAL_WRATH_TALENT,
  SPELLS.FURY_OF_ELUNE_DAMAGE_4P,
  // deliberately doesn't include Adaptive Swarm itself to avoid double count
];

/**
 * This module performs calculations for Adaptive Swarm, but does not
 * display any of it. Spec specific modules should take care of display.
 *
 * **Adaptive Swarm**
 * Talent - (Feral / Restoration)
 *
 * Command a swarm that heals (157.5% of Spell power) or deals (150% of Spell power) Shadow damage
 * over 12 sec to a target, and increases the effectiveness of your periodic effects on them by 25%.
 * Upon expiration, jumps to a target within 25 yards, alternating between friend and foe up to 3 times.
 */
class AdaptiveSwarm extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
    enemies: Enemies,
  };

  protected abilityTracker!: AbilityTracker;
  protected combatants!: Combatants;
  protected enemies!: Enemies;

  // Strength of the boost to periodic effects
  _periodicBoost: number;

  // A tally of the healing attributable to Adaptive Swarm's boost on periodic effects,
  // including any additional boost from Evolved Swarm. While it does buff itself,
  // we don't count that because it's already covered by the 'direct healing' category
  _periodicBoostHealingAttribution: number = 0;

  // A tally of the damage attributable to Adaptive Swarm's boost on periodic effects,
  // including any additional boost from Evolved Swarm. While it does buff itself,
  // we don't count that because it's already covered by the 'direct damage' category
  _periodicBoostDamageAttribution: number = 0;

  constructor(options: Options) {
    super(options);

    // TODO update if Guardian gets it too
    this.active = this.selectedCombatant.hasTalent(TALENTS.ADAPTIVE_SWARM_TALENT);

    this._periodicBoost =
      this.selectedCombatant.specId === SPECS.RESTORATION_DRUID.id
        ? RESTO_PERIODIC_BOOST
        : FERAL_PERIODIC_BOOST;

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(PERIODIC_HEALS),
      this.onPeriodicHeal,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(PERIODIC_DAMAGE),
      this.onPeriodicDamage,
    );
  }

  onPeriodicHeal(event: HealEvent) {
    const target = this.combatants.getEntity(event);
    if (
      target === null ||
      !target.hasBuff(
        SPELLS.ADAPTIVE_SWARM_HEAL.id,
        this.owner.currentTimestamp,
        0,
        0,
        this.selectedCombatant.id,
      )
    ) {
      return;
    }

    // if we got this far, our adaptive swarm is on the heal target
    this._periodicBoostHealingAttribution += calculateEffectiveHealing(event, this._periodicBoost);
  }

  onPeriodicDamage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (
      target === null ||
      !target.hasBuff(
        SPELLS.ADAPTIVE_SWARM_DAMAGE.id,
        this.owner.currentTimestamp,
        0,
        0,
        this.selectedCombatant.id,
      )
    ) {
      return;
    }

    // if we got this far, our adaptive swarm is on the damage target
    this._periodicBoostDamageAttribution += calculateEffectiveDamage(event, this._periodicBoost);
  }

  /** The total healing done directly by Adaptive Swarm (this includes the boost to itself) */
  get directHealing(): number {
    return this.abilityTracker.getAbility(SPELLS.ADAPTIVE_SWARM_HEAL.id).healingEffective;
  }

  /** The total healing done due to Adaptive Swarm's boost to other periodic effects */
  get boostedHealing(): number {
    return this._periodicBoostHealingAttribution;
  }

  /** The sum total healing due to Adaptive Swarm's direct and boost components */
  get totalHealing(): number {
    return this.directHealing + this.boostedHealing;
  }

  /** The total damage done directly by Adaptive Swarm (this includes the boost to itself) */
  get directDamage(): number {
    return this.abilityTracker.getAbility(SPELLS.ADAPTIVE_SWARM_DAMAGE.id).damageEffective;
  }

  /** The total damage done due to Adaptive Swarm's boost to other periodic effects */
  get boostedDamage(): number {
    return this._periodicBoostDamageAttribution;
  }

  /** The sum total damage due to Adaptive Swarm's direct and boost components */
  get totalDamage(): number {
    return this.directDamage + this.boostedDamage;
  }

  /** The total number of times the player cast Adaptive Swarm */
  get casts(): number {
    return this.abilityTracker.getAbility(SPELLS.ADAPTIVE_SWARM.id).casts;
  }

  /** The total ms of uptime for the player's Adaptive Swarm healing buff (HoT) */
  get buffUptime(): number {
    return this.combatants.getBuffUptime(SPELLS.ADAPTIVE_SWARM_HEAL.id);
  }

  /** The average ms of uptime for the player's Adaptive Swarm healing buff (HoT) per cast */
  get buffTimePerCast(): number {
    return this.casts === 0 ? 0 : this.buffUptime / this.casts;
  }

  /** The total ms of uptime for the player's Adaptive Swarm damage debuff (DoT) */
  get debuffUptime(): number {
    return this.enemies.getBuffUptime(SPELLS.ADAPTIVE_SWARM_DAMAGE.id);
  }

  /** Percent uptime for the player's Adaptive Swarm damage debuff (DoT) */
  get debuffUptimePercent(): number {
    return this.debuffUptime / this.owner.fightDuration;
  }

  /** The average ms of uptime for the player's Adaptive Swarm damage debuff (DoT) per cast */
  get debuffTimePerCast(): number {
    return this.casts === 0 ? 0 : this.debuffUptime / this.casts;
  }
}

export default AdaptiveSwarm;
