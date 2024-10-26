import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { SpellInfo } from 'parser/core/EventFilter';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Combatants from 'parser/shared/modules/Combatants';
import Enemies from 'parser/shared/modules/Enemies';
import { TALENTS_DRUID, TALENTS_DRUID as TALENTS } from 'common/TALENTS/druid';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber, formatPercentage } from 'common/format';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import { SpellLink } from 'interface';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

const PERIODIC_BOOST = 0.25;

const PERIODIC_HEALS: SpellInfo[] = [
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
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

const PERIODIC_DAMAGE: SpellInfo[] = [
  SPELLS.RIP,
  SPELLS.RAKE, // adaptive swarm also boosts the direct damage, so no need for 'tick' differentiation
  SPELLS.THRASH_FERAL, // even thrashes direct is "bleed damage"
  SPELLS.THRASH_FERAL_BLEED,
  SPELLS.MOONFIRE_FERAL,
  SPELLS.MOONFIRE_DEBUFF,
  SPELLS.SUNFIRE,
  SPELLS.THRASH_BEAR_DOT,
  TALENTS.FERAL_FRENZY_TALENT,
  SPELLS.FERAL_FRENZY_DEBUFF,
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

    this.active = this.selectedCombatant.hasTalent(TALENTS.ADAPTIVE_SWARM_TALENT);

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
    this._periodicBoostHealingAttribution += calculateEffectiveHealing(event, PERIODIC_BOOST);
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
    this._periodicBoostDamageAttribution += calculateEffectiveDamage(event, PERIODIC_BOOST);
  }

  /** The total healing done directly by Adaptive Swarm (this includes the boost to itself) */
  get directHealing(): number {
    return this.abilityTracker.getAbilityHealing(SPELLS.ADAPTIVE_SWARM_HEAL.id);
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
    return this.abilityTracker.getAbilityDamage(SPELLS.ADAPTIVE_SWARM_DAMAGE.id);
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

  get damageUptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.ADAPTIVE_SWARM_DAMAGE.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.debuffUptimePercent,
      isLessThan: {
        minor: 0.65,
        average: 0.5,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(0)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the sum of the direct damage from Adaptive Swarm and the damage enabled by its
            boost to periodic effects. The DoT had an uptime of{' '}
            <strong>{formatPercentage(this.debuffUptime / this.owner.fightDuration, 0)}%</strong>.
            <ul>
              <li>
                Direct: <strong>{this.owner.formatItemDamageDone(this.directDamage)}</strong>
              </li>
              <li>
                Boost: <strong>{this.owner.formatItemDamageDone(this.boostedDamage)}</strong>
              </li>
            </ul>
            In addition, Adaptive Swarm did{' '}
            <strong>{formatNumber(this.owner.getPerSecond(this.totalHealing))} HPS</strong> over the
            encounter with a HoT uptime of{' '}
            <strong>{formatPercentage(this.buffUptime / this.owner.fightDuration, 0)}%</strong>.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.ADAPTIVE_SWARM}>
          <ItemPercentDamageDone amount={this.totalDamage} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.ADAPTIVE_SWARM],
        uptimes: this.damageUptimeHistory,
      },
      [],
      SubPercentageStyle.RELATIVE,
    );
  }

  get guideSubsection(): JSX.Element {
    const hasUs = this.selectedCombatant.hasTalent(TALENTS_DRUID.UNBRIDLED_SWARM_TALENT);
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS_DRUID.ADAPTIVE_SWARM_TALENT} />
          </strong>{' '}
          is a 'bouncy' DoT / HoT that boosts your periodic effects on the target. Focus on
          maximizing the DoTs uptime by casting on enemy targets only.
        </p>
        <p>
          {hasUs ? (
            <>
              With <SpellLink spell={TALENTS_DRUID.UNBRIDLED_SWARM_TALENT} /> and multiple
              consistent enemy targets, it should be possible to maintain high uptime on multiple
              targets. This talent's value diminishes considerably in single target encounters.
            </>
          ) : (
            <>
              Without <SpellLink spell={TALENTS_DRUID.UNBRIDLED_SWARM_TALENT} />, you'll only be
              able to maintain one Swarm at a time. Refresh on your primary target as soon as the
              previous Swarm falls, and you should be able to maintain 60+% uptime.
            </>
          )}
        </p>
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <strong>Adaptive Swarm uptime</strong>
          {this.subStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default AdaptiveSwarm;
