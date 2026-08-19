import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { FightEndEvent, UpdateSpellUsableEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import Everbloom from 'analysis/retail/druid/restoration/modules/spells/Everbloom';
import GroveGuardians from 'analysis/retail/druid/restoration/modules/spells/GroveGuardians';
import PowerOfTheArchdruid from 'analysis/retail/druid/restoration/modules/spells/PowerOfTheArchdruid';
import Reforestation from 'analysis/retail/druid/restoration/modules/spells/Reforestation';
import SoulOfTheForest from 'analysis/retail/druid/restoration/modules/spells/SoulOfTheForest';
import Swiftmend from 'analysis/retail/druid/restoration/modules/spells/Swiftmend';
import TreeOfLife from 'analysis/retail/druid/restoration/modules/spells/TreeOfLife';
import VerdantInfusion from 'analysis/retail/druid/restoration/modules/spells/VerdantInfusion';

/**
 * **Prosperity**
 * Spec Talent
 *
 * Swiftmend now has 2 charges.
 *
 * Time at exactly 1 charge is still recharging the 2nd. Without Prosperity you'd be sitting
 * at max charges then. Sum that duration / recharge time for extra casts, then take a
 * proportional share of the hardcast Swiftmend healing package.
 */
class Prosperity extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    swiftmend: Swiftmend,
    soulOfTheForest: SoulOfTheForest,
    powerOfTheArchdruid: PowerOfTheArchdruid,
    everbloom: Everbloom,
    verdantInfusion: VerdantInfusion,
    groveGuardians: GroveGuardians,
    reforestation: Reforestation,
    treeOfLife: TreeOfLife,
  };

  protected abilityTracker!: AbilityTracker;
  protected swiftmend!: Swiftmend;
  protected soulOfTheForest!: SoulOfTheForest;
  protected powerOfTheArchdruid!: PowerOfTheArchdruid;
  protected everbloom!: Everbloom;
  protected verdantInfusion!: VerdantInfusion;
  protected groveGuardians!: GroveGuardians;
  protected reforestation!: Reforestation;
  protected treeOfLife!: TreeOfLife;

  /** Wall-clock ms spent at exactly 1 Swiftmend charge (2nd recharging) */
  private timeAtOneChargeMs = 0;
  /** Baseline full recharge duration (ms), Early Spring adjusted */
  private readonly fullCooldownMs: number;
  private lastTimestamp: number;
  /** Charges available after the last UpdateSpellUsable (2 at pull) */
  private chargesAvailable = 2;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.PROSPERITY_TALENT);

    this.fullCooldownMs =
      (15 - this.selectedCombatant.getTalentRank(TALENTS_DRUID.EARLY_SPRING_TALENT)) * 1000;
    this.lastTimestamp = this.owner.fight.start_time;

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND),
      this.onSwiftmendUsable,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private accumulate(timestamp: number) {
    const clamped = Math.min(timestamp, this.owner.fight.end_time);
    if (clamped > this.lastTimestamp && this.chargesAvailable === 1) {
      this.timeAtOneChargeMs += clamped - this.lastTimestamp;
    }
    this.lastTimestamp = Math.max(this.lastTimestamp, clamped);
  }

  private onSwiftmendUsable(event: UpdateSpellUsableEvent) {
    this.accumulate(event.timestamp);
    this.chargesAvailable = event.chargesAvailable;
  }

  private onFightEnd(event: FightEndEvent) {
    this.accumulate(event.timestamp);
  }

  /** Estimated extra Swiftmend casts from recharge while holding 1 charge */
  get extraCasts(): number {
    return this.fullCooldownMs > 0 ? this.timeAtOneChargeMs / this.fullCooldownMs : 0;
  }

  get hardcastSwiftmendCasts(): number {
    return this.abilityTracker.getAbility(SPELLS.SWIFTMEND.id).casts;
  }

  /** Fraction of hardcast Swiftmends attributed to Prosperity's extra charge */
  get prosperityCastFraction(): number {
    const casts = this.hardcastSwiftmendCasts;
    if (casts <= 0 || this.extraCasts <= 0) {
      return 0;
    }
    // Cap at 1 in case of tracker edge cases
    return Math.min(1, this.extraCasts / casts);
  }

  /** Share of GG healing/overhealing attributed to Swiftmend summons (vs Wild Growth) */
  private get groveGuardiansSwiftmendShare(): number {
    const smCasts = this.hardcastSwiftmendCasts;
    const wgCasts = this.abilityTracker.getAbility(SPELLS.WILD_GROWTH.id).casts;
    const totalSummonSources = smCasts + wgCasts;
    return totalSummonSources > 0 ? smCasts / totalSummonSources : 0;
  }

  /** Hardcast SotF use fraction (excludes Convoke) */
  private get soulOfTheForestHardcastFraction(): number {
    if (!this.soulOfTheForest.active || this.soulOfTheForest.totalUses === 0) {
      return 0;
    }
    const hardcastUses =
      this.soulOfTheForest.rejuvHardcastUses + this.soulOfTheForest.regrowthHardcastUses;
    return hardcastUses / this.soulOfTheForest.totalUses;
  }

  /** Hardcast PotA proc fraction (excludes Convoke) */
  private get powerOfTheArchdruidHardcastFraction(): number {
    if (!this.powerOfTheArchdruid.active || this.powerOfTheArchdruid.procs === 0) {
      return 0;
    }
    return this.powerOfTheArchdruid.totalHardcastProcs / this.powerOfTheArchdruid.procs;
  }

  /** Direct Swiftmend hardcast healing */
  get directHealing(): number {
    return this.swiftmend.hardcastSwiftmendHealing;
  }

  get directOverhealing(): number {
    return this.swiftmend.hardcastSwiftmendOverhealing;
  }

  /** Verdant Infusion value from Swiftmend casts (estimated; no overheal tracked) */
  get verdantInfusionHealing(): number {
    if (!this.verdantInfusion.active) {
      return 0;
    }
    return this.verdantInfusion.totalEstimatedHealing;
  }

  /**
   * SotF healing from hardcast-consumed procs only (Convoke SotF is unrelated to Prosperity).
   */
  get soulOfTheForestHealing(): number {
    return this.soulOfTheForest.totalHealing * this.soulOfTheForestHardcastFraction;
  }

  get soulOfTheForestOverhealing(): number {
    return this.soulOfTheForest.totalOverhealing * this.soulOfTheForestHardcastFraction;
  }

  /** PotA healing from hardcast SotF consumptions */
  get powerOfTheArchdruidHealing(): number {
    return this.powerOfTheArchdruid.totalHealing * this.powerOfTheArchdruidHardcastFraction;
  }

  get powerOfTheArchdruidOverhealing(): number {
    return this.powerOfTheArchdruid.totalOverhealing * this.powerOfTheArchdruidHardcastFraction;
  }

  /** Everbloom Blooming Frenzy splash healing (not Photosynthesis / natural expiry) */
  private get everbloomFrenzySplashHealing(): number {
    return this.everbloom.active ? this.everbloom.everbloomBloomSplashHealing : 0;
  }

  /** Everbloom Blooming Frenzy healing triggered by Swiftmend, including Verdancy */
  get everbloomFrenzyHealing(): number {
    return this.everbloom.active ? this.everbloom.rank3Healing : 0;
  }

  get everbloomFrenzyOverhealing(): number {
    if (!this.everbloom.active) {
      return 0;
    }
    const frenzySplashOverhealing =
      this.everbloom.splashHealing > 0
        ? this.everbloom.splashOverhealing *
          (this.everbloomFrenzySplashHealing / this.everbloom.splashHealing)
        : 0;
    return (
      this.everbloom.everbloomBloomOverhealing +
      this.everbloom.verdancyOverhealing +
      frenzySplashOverhealing
    );
  }

  /**
   * Grove Guardians healing from Swiftmend summons (vs Wild Growth), before Prosperity fraction.
   */
  get groveGuardiansHealing(): number {
    if (!this.groveGuardians.active) {
      return 0;
    }
    return this.groveGuardians.totalHardcastHealing * this.groveGuardiansSwiftmendShare;
  }

  get groveGuardiansOverhealing(): number {
    if (!this.groveGuardians.active) {
      return 0;
    }
    return this.groveGuardians.totalHardcastOverhealing * this.groveGuardiansSwiftmendShare;
  }

  /** Reforestation ToL healing (procs every 4 Swiftmend casts) */
  get reforestationHealing(): number {
    if (!this.reforestation.active) {
      return 0;
    }
    return this.treeOfLife._getTotalHealing(this.treeOfLife.reforestation);
  }

  get reforestationOverhealing(): number {
    if (!this.reforestation.active) {
      return 0;
    }
    return this.treeOfLife._getTotalOverhealing(this.treeOfLife.reforestation);
  }

  /** Total healing package tied to hardcast Swiftmend casts */
  get swiftmendPackageHealing(): number {
    return (
      this.directHealing +
      this.verdantInfusionHealing +
      this.soulOfTheForestHealing +
      this.powerOfTheArchdruidHealing +
      this.everbloomFrenzyHealing +
      this.groveGuardiansHealing +
      this.reforestationHealing
    );
  }

  get swiftmendPackageOverhealing(): number {
    return (
      this.directOverhealing +
      this.soulOfTheForestOverhealing +
      this.powerOfTheArchdruidOverhealing +
      this.everbloomFrenzyOverhealing +
      this.groveGuardiansOverhealing +
      this.reforestationOverhealing
    );
  }

  /** Estimated healing attributable to Prosperity's extra Swiftmend casts */
  get estimatedHealing(): number {
    return this.swiftmendPackageHealing * this.prosperityCastFraction;
  }

  statistic() {
    const extraCasts = this.extraCasts;
    const fraction = this.prosperityCastFraction;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Time spent at exactly 1 <SpellLink spell={SPELLS.SWIFTMEND} /> charge (while the 2nd
            recharges) is recharge you could not bank with a 1-charge Swiftmend. That duration (
            {formatDuration(this.timeAtOneChargeMs)}) ÷ recharge time ≈ extra casts. Healing is a
            proportional share of the hardcast Swiftmend package:
            <ul>
              <li>
                Extra casts: <strong>{extraCasts.toFixed(1)}</strong> of{' '}
                <strong>{this.hardcastSwiftmendCasts}</strong> Swiftmend casts (
                {(fraction * 100).toFixed(0)}%)
              </li>
              <li>
                Direct Swiftmend:{' '}
                <strong>{this.owner.formatItemHealingDone(this.directHealing * fraction)}</strong>
              </li>
              {this.verdantInfusion.active && (
                <li>
                  <SpellLink spell={TALENTS_DRUID.VERDANT_INFUSION_TALENT} />:{' '}
                  <strong>
                    {this.owner.formatItemHealingDone(this.verdantInfusionHealing * fraction)}
                  </strong>
                </li>
              )}
              {this.soulOfTheForest.active && (
                <li>
                  <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} />:{' '}
                  <strong>
                    {this.owner.formatItemHealingDone(this.soulOfTheForestHealing * fraction)}
                  </strong>
                </li>
              )}
              {this.powerOfTheArchdruid.active && (
                <li>
                  <SpellLink spell={TALENTS_DRUID.POWER_OF_THE_ARCHDRUID_TALENT} />:{' '}
                  <strong>
                    {this.owner.formatItemHealingDone(this.powerOfTheArchdruidHealing * fraction)}
                  </strong>
                </li>
              )}
              {this.everbloomFrenzyHealing > 0 && (
                <li>
                  <SpellLink spell={TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT} /> Blooming
                  Frenzy:{' '}
                  <strong>
                    {this.owner.formatItemHealingDone(this.everbloomFrenzyHealing * fraction)}
                  </strong>
                </li>
              )}
              {this.groveGuardians.active && (
                <li>
                  <SpellLink spell={TALENTS_DRUID.GROVE_GUARDIANS_TALENT} /> from extra Swiftmends:{' '}
                  <strong>
                    {this.owner.formatItemHealingDone(this.groveGuardiansHealing * fraction)}
                  </strong>
                </li>
              )}
              {this.reforestation.active && (
                <li>
                  <SpellLink spell={TALENTS_DRUID.REFORESTATION_TALENT} />:{' '}
                  <strong>
                    {this.owner.formatItemHealingDone(this.reforestationHealing * fraction)}
                  </strong>
                </li>
              )}
            </ul>
            Total package healing: <strong>{formatNumber(this.swiftmendPackageHealing)}</strong>
            <br />
            <strong>
              Overhealing:{' '}
              {formatOverhealing(this.swiftmendPackageOverhealing, this.swiftmendPackageHealing)}
            </strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.PROSPERITY_TALENT}>
          <ItemPercentHealingDone amount={this.estimatedHealing} approximate />
          <br />
          <small>
            ≈{extraCasts.toFixed(1)} extra <SpellLink spell={SPELLS.SWIFTMEND} />
            {extraCasts === 1 ? '' : 's'}
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Prosperity;
