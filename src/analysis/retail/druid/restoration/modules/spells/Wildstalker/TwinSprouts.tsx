import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';
import Combatants from 'parser/shared/modules/Combatants';
import Lifebloom from 'analysis/retail/druid/restoration/modules/spells/Lifebloom';
import Mastery from 'analysis/retail/druid/restoration/modules/core/Mastery';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'analysis/retail/druid/restoration/constants';
import { isFromTwinSprouts } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { formatNumber } from 'common/format';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import SpellLink from 'interface/SpellLink';
import SymbioticBloomDirectClaim from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/SymbioticBloomDirectClaim';

const BASE_BLOOM_DURATION_MS = 6_000;
const RESILIENT_FLOURISHING_EXTRA_MS = 2_000;
const VIGOROUS_CREEPERS_HEALING_INCREASE = 0.2;

interface BloomInstance {
  targetId: number;
  start: number;
  end: number;
}

/**
 * **Twin Sprouts**
 * Hero Talent - Wildstalker
 *
 * When Bloodseeker Vines or Symbiotic Blooms grow, 30% chance another of the same type
 * grows on a nearby target.
 *
 * Linked via FROM_TWIN_SPROUTS. Same attribution as Implant (direct ticks, mastery, nested VC).
 * Vine procs aren't counted here.
 */
export default class TwinSprouts extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    lifebloom: Lifebloom,
    mastery: Mastery,
    symbioticBloomDirectClaim: SymbioticBloomDirectClaim,
  };

  protected combatants!: Combatants;
  protected lifebloom!: Lifebloom;
  protected mastery!: Mastery;
  protected symbioticBloomDirectClaim!: SymbioticBloomDirectClaim;

  private bloomDurationMs: number;
  private hasVigorousCreepers: boolean;

  private twinBlooms: BloomInstance[] = [];

  directHealing = 0;
  directOverhealing = 0;
  masteryHealing = 0;
  vigorousCreepersHealing = 0;
  vigorousCreepersOverhealing = 0;
  everbloomHealing = 0;
  bloomsApplied = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.TWIN_SPROUTS_TALENT);
    this.hasVigorousCreepers = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.VIGOROUS_CREEPERS_TALENT,
    );
    this.bloomDurationMs =
      BASE_BLOOM_DURATION_MS +
      (this.selectedCombatant.hasTalent(TALENTS_DRUID.RESILIENT_FLOURISHING_TALENT)
        ? RESILIENT_FLOURISHING_EXTRA_MS
        : 0);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER),
      this.onSymbioticBloomApply,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER),
      this.onSymbioticBloomApply,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  private onSymbioticBloomApply(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    if (!isFromTwinSprouts(event)) {
      return;
    }

    this.twinBlooms.push({
      targetId: event.targetID,
      start: event.timestamp,
      end: event.timestamp + this.bloomDurationMs,
    });
    this.bloomsApplied += 1;
  }

  getActiveBloomStacks(targetId: number, timestamp: number): number {
    return this.twinBlooms.filter(
      (bloom) => bloom.targetId === targetId && bloom.start <= timestamp && timestamp < bloom.end,
    ).length;
  }

  /** @deprecated use {@link getActiveBloomStacks} */
  private getTwinStacks(targetId: number, timestamp: number): number {
    return this.getActiveBloomStacks(targetId, timestamp);
  }

  /**
   * Fraction of this Symbiotic Bloom heal event counted as Twin Sprouts direct healing
   * (0 if not a SymBloom heal or no Twin stacks on the target).
   */
  getDirectClaimPortion(event: HealEvent): number {
    if (event.ability.guid !== SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER.id) {
      return 0;
    }

    const target = this.combatants.getEntity(event);
    if (!target) {
      return 0;
    }

    const twinStacks = this.getTwinStacks(target.id, event.timestamp);
    if (twinStacks <= 0) {
      return 0;
    }

    const totalStacks = target.getBuffStacks(
      SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER.id,
      event.timestamp,
      0,
      0,
      this.selectedCombatant.id,
    );
    if (totalStacks <= 0) {
      return 0;
    }

    return Math.min(twinStacks, totalStacks) / totalStacks;
  }

  private onHeal(event: HealEvent) {
    if (event.ability.guid === SPELLS.EVERBLOOM_SPLASH_HEAL.id) {
      this.handleEverbloomSplash(event);
      return;
    }

    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }

    const twinStacks = this.getTwinStacks(target.id, event.timestamp);
    if (twinStacks <= 0) {
      return;
    }

    if (event.ability.guid === SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER.id) {
      const totalStacks = target.getBuffStacks(
        SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER.id,
        event.timestamp,
        0,
        0,
        this.selectedCombatant.id,
      );
      if (totalStacks <= 0) {
        return;
      }
      const portion = Math.min(twinStacks, totalStacks) / totalStacks;
      const effective = event.amount + (event.absorbed || 0);
      this.directHealing += effective * portion;
      this.directOverhealing += (event.overheal || 0) * portion;
      return;
    }

    if (!this.symbioticBloomDirectClaim.isMasteryOwner('twin', target.id, event.timestamp)) {
      return;
    }

    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid)) {
      return;
    }

    const decomposed = this.mastery.decomposeHeal(event);
    if (decomposed) {
      this.masteryHealing += decomposed.oneStack;
    }

    if (this.hasVigorousCreepers) {
      this.vigorousCreepersHealing += calculateEffectiveHealing(
        event,
        VIGOROUS_CREEPERS_HEALING_INCREASE,
      );
      this.vigorousCreepersOverhealing += calculateOverhealing(
        event,
        VIGOROUS_CREEPERS_HEALING_INCREASE,
      );
    }
  }

  private handleEverbloomSplash(event: HealEvent) {
    if (!this.hasVigorousCreepers) {
      return;
    }

    const lbTargetId = this.lifebloom.activeLifebloomTarget;
    if (
      lbTargetId === undefined ||
      !this.symbioticBloomDirectClaim.isMasteryOwner('twin', lbTargetId, event.timestamp)
    ) {
      return;
    }

    const amount = calculateEffectiveHealing(event, VIGOROUS_CREEPERS_HEALING_INCREASE);
    this.vigorousCreepersHealing += amount;
    this.vigorousCreepersOverhealing += calculateOverhealing(
      event,
      VIGOROUS_CREEPERS_HEALING_INCREASE,
    );
    this.everbloomHealing += amount;
  }

  get totalHealing() {
    return this.directHealing + this.masteryHealing + this.vigorousCreepersHealing;
  }

  /** Direct SymBloom + mastery only (VC is counted on Vigorous Creepers). */
  get treeTotalHealing() {
    return this.directHealing + this.masteryHealing;
  }

  get reportedOverhealing() {
    return this.directOverhealing + this.vigorousCreepersOverhealing;
  }

  get reportedOverhealingEffectiveBase() {
    return this.directHealing + this.vigorousCreepersHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        tooltip={
          <>
            Healing from <SpellLink spell={TALENTS_DRUID.TWIN_SPROUTS_TALENT} />
            -procced <SpellLink spell={SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER} /> (blooms that grew on
            a nearby target as another bloom was applied):
            <ul>
              <li>
                Direct HoT healing: <strong>{formatNumber(this.directHealing)}</strong>
              </li>
              <li>
                Mastery benefit: <strong>{formatNumber(this.masteryHealing)}</strong> (while Twin
                Sprouts owns the oldest active Symbiotic Bloom stack on the target)
              </li>
              {this.hasVigorousCreepers && (
                <li>
                  <SpellLink spell={TALENTS_DRUID.VIGOROUS_CREEPERS_TALENT} /> amp:{' '}
                  <strong>{formatNumber(this.vigorousCreepersHealing)}</strong>
                  {this.everbloomHealing > 0 && (
                    <>
                      {' '}
                      (includes <strong>{formatNumber(this.everbloomHealing)}</strong> from
                      Everbloom splash)
                    </>
                  )}
                </li>
              )}
            </ul>
            Procced blooms attributed: <strong>{this.bloomsApplied}</strong>
            <br />
            The combat log does not explicitly identify Twin Sprouts procs. This statistic links a
            new bloom to another recently applied bloom by timing and may overcount if an unrelated
            bloom grows at the same time.
            <br />
            Bloodseeker Vine procs are not included (healing only).
            <br />
            <strong>
              Overhealing:{' '}
              {formatOverhealing(this.reportedOverhealing, this.reportedOverhealingEffectiveBase)}
            </strong>{' '}
            (direct + Vigorous Creepers only)
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.TWIN_SPROUTS_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
