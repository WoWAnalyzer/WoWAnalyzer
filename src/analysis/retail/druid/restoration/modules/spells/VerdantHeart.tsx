import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import { getSourceBloom } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import Lifebloom from 'analysis/retail/druid/restoration/modules/spells/Lifebloom';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { formatDuration, formatPercentage } from 'common/format';
import { SpellLink } from 'interface';

const VERDANT_HEART_HEALING_INCREASE = 0.2;

/**
 * **Verdant Heart**
 * Spec Talent
 *
 * Frenzied Regeneration and Barkskin increase all healing received by 20%.
 *
 * The two buffs stack additively (40% when both are up). Frenzied Regeneration's own
 * healing is not increased by the 20% from Frenzied Regeneration itself, but still
 * receives Barkskin's 20% when both are active.
 *
 * Card main value = own HPS contribution (self-heal amp + Everbloom splash from
 * self-Lifebloom blooms). External healing received is tooltip-only.
 */
export default class VerdantHeart extends Analyzer {
  static dependencies = {
    lifebloom: Lifebloom,
  };

  protected lifebloom!: Lifebloom;

  private hasFrenziedRegen = false;

  /** Full talent value (self + external + everbloom splash) */
  healing = 0;
  overhealing = 0;
  /** Amp on healing you deal to yourself */
  selfHealing = 0;
  selfOverhealing = 0;
  /** Amp on healing received from sources other than yourself */
  externalHealing = 0;
  externalOverhealing = 0;
  /** Everbloom splash to others from Verdant Heart-amplified self-Lifebloom blooms */
  everbloomSplashHealing = 0;
  everbloomSplashOverhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.VERDANT_HEART_TALENT);
    this.hasFrenziedRegen = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.FRENZIED_REGENERATION_TALENT,
    );

    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EVERBLOOM_SPLASH_HEAL),
      this.onEverbloomSplash,
    );
  }

  private onHeal(event: HealEvent) {
    const isFrenziedRegenHeal = event.ability.guid === SPELLS.FRENZIED_REGENERATION.id;
    const increase = this.healingIncreaseAt(event.timestamp, isFrenziedRegenHeal);
    if (increase <= 0) {
      return;
    }

    const effective = calculateEffectiveHealing(event, increase);
    const overheal = calculateOverhealing(event, increase);

    this.healing += effective;
    this.overhealing += overheal;

    if (event.sourceID !== this.selectedCombatant.id) {
      this.externalHealing += effective;
      this.externalOverhealing += overheal;
    } else {
      this.selfHealing += effective;
      this.selfOverhealing += overheal;
    }
  }

  /**
   * Everbloom splash is a % of the Lifebloom bloom heal. When that bloom is on yourself
   * with Barkskin and/or Frenzied Regeneration up, the bloom (and therefore the splash)
   * is larger. Attribute that cascade for heals to other targets only: splash on yourself
   * is already counted via {@link onHeal}.
   */
  private onEverbloomSplash(event: HealEvent) {
    if (event.targetID === this.selectedCombatant.id) {
      return;
    }

    const sourceBloom = getSourceBloom(event);
    const bloomTimestamp = sourceBloom?.timestamp ?? event.timestamp;
    if (!this.isSplashFromVerdantHeartSelfBloom(event, sourceBloom)) {
      return;
    }

    const increase = this.healingIncreaseAt(bloomTimestamp);
    if (increase <= 0) {
      return;
    }

    const effective = calculateEffectiveHealing(event, increase);
    const overheal = calculateOverhealing(event, increase);

    this.healing += effective;
    this.overhealing += overheal;
    this.everbloomSplashHealing += effective;
    this.everbloomSplashOverhealing += overheal;
  }

  private isSplashFromVerdantHeartSelfBloom(
    event: HealEvent,
    sourceBloom: HealEvent | undefined,
  ): boolean {
    if (sourceBloom) {
      return (
        sourceBloom.targetID === this.selectedCombatant.id &&
        this.healingIncreaseAt(sourceBloom.timestamp) > 0
      );
    }
    return (
      this.lifebloom.activeLifebloomTarget === this.selectedCombatant.id &&
      this.healingIncreaseAt(event.timestamp) > 0
    );
  }

  /**
   * Additive 20% per active buff. Frenzied Regeneration heals never get the FR-sourced
   * 20%, only Barkskin's 20% if Barkskin is also up.
   */
  private healingIncreaseAt(timestamp: number, isFrenziedRegenHeal = false): number {
    const hasBarkskin = this.selectedCombatant.hasBuff(SPELLS.BARKSKIN.id, timestamp);
    const hasFrenziedRegen = this.selectedCombatant.hasBuff(
      SPELLS.FRENZIED_REGENERATION.id,
      timestamp,
    );

    let increase = 0;
    if (hasBarkskin) {
      increase += VERDANT_HEART_HEALING_INCREASE;
    }
    if (hasFrenziedRegen && !isFrenziedRegenHeal) {
      increase += VERDANT_HEART_HEALING_INCREASE;
    }
    return increase;
  }

  get barkskinUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BARKSKIN.id);
  }

  get barkskinUptimePercent() {
    return this.barkskinUptime / this.owner.fightDuration;
  }

  get frenziedRegenUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FRENZIED_REGENERATION.id);
  }

  get frenziedRegenUptimePercent() {
    return this.frenziedRegenUptime / this.owner.fightDuration;
  }

  /** Own HPS contribution shown on the card (excludes external healing received) */
  get ownHealing() {
    return this.selfHealing + this.everbloomSplashHealing;
  }

  get ownOverhealing() {
    return this.selfOverhealing + this.everbloomSplashOverhealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Own HPS contribution (self-heal amp + Everbloom splash). External healing received is
            listed separately and is not in the main value.
            {this.hasFrenziedRegen && (
              <>
                {' '}
                <SpellLink spell={SPELLS.FRENZIED_REGENERATION} />
                &apos;s own healing is not increased by its Verdant Heart amp, but still receives{' '}
                <SpellLink spell={SPELLS.BARKSKIN} />
                &apos;s 20% when both are up.
              </>
            )}
            <ul>
              <li>
                Self-heal amp: <strong>{this.owner.formatItemHealingDone(this.selfHealing)}</strong>
              </li>
              {this.everbloomSplashHealing > 0 && (
                <li>
                  Everbloom splash to others (from self-Lifebloom blooms):{' '}
                  <strong>{this.owner.formatItemHealingDone(this.everbloomSplashHealing)}</strong>
                </li>
              )}
              {this.externalHealing > 0 && (
                <li>
                  Healing received from others (not in main value):{' '}
                  <strong>{this.owner.formatItemHealingDone(this.externalHealing)}</strong>
                </li>
              )}
              <li>
                All healing increased:{' '}
                <strong>{this.owner.formatItemHealingDone(this.healing)}</strong>
              </li>
            </ul>
            <SpellLink spell={SPELLS.BARKSKIN} /> uptime:{' '}
            <strong>{formatDuration(this.barkskinUptime)}</strong> (
            <strong>{formatPercentage(this.barkskinUptimePercent, 1)}%</strong>)
            {this.hasFrenziedRegen && (
              <>
                <br />
                <SpellLink spell={SPELLS.FRENZIED_REGENERATION} /> uptime:{' '}
                <strong>{formatDuration(this.frenziedRegenUptime)}</strong> (
                <strong>{formatPercentage(this.frenziedRegenUptimePercent, 1)}%</strong>)
              </>
            )}
            <br />
            <strong>Overhealing: {formatOverhealing(this.ownOverhealing, this.ownHealing)}</strong>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.VERDANT_HEART_TALENT}>
          <ItemPercentHealingDone amount={this.ownHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
