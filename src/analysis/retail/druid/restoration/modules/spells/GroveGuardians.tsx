import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/druid/restoration/Guide';
import { SpellLink } from 'interface';
import CastEfficiencyPanel from 'interface/guide/components/CastEfficiencyPanel';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import Events, { HealEvent, SummonEvent } from 'parser/core/Events';
import { isFromHardcast } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';

const deps = {
  abilityTracker: AbilityTracker,
};

/**
 * **Grove Guardians**
 * Spec Talent Tier 6
 *
 * Casting Swiftmend or Wild Growth summons a Treant which will immediately cast Swiftmend on your current target, healing for X.
 * The Treant will cast Nourish on that target or a nearby ally periodically,
 * healing for X. Lasts 8 sec.
 */
export default class GroveGuardians extends Analyzer.withDependencies(deps) {
  hasTolCenariusGuidance: boolean;

  /** Total healing done by hardcast GG's swiftmend */
  hardcastSwiftmendHealing = 0;
  /** Total overhealing done by hardcast GG's swiftmend */
  hardcastSwiftmendOverhealing = 0;
  /** Total healing done by hardcast GG's nourish */
  hardcastNourishHealing = 0;
  /** Total overhealing done by hardcast GG's nourish */
  hardcastNourishOverhealing = 0;
  /** Total healing done by GGs summoned by Cenarius Guidance (all spells) */
  cgHealing = 0;
  /** Total overhealing done by GGs summoned by Cenarius Guidance (all spells) */
  cgOverhealing = 0;

  /** Set of GG instance numbers that were hardcast. If not in the set, we presume it was summoned by CG. */
  /** Leaving this named hardcast even though they aren't really hardcast anymore. This represents GG summoned by WG/SM casts. */
  hardcastInstances: Set<number> = new Set<number>();

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.GROVE_GUARDIANS_TALENT);
    this.hasTolCenariusGuidance =
      this.selectedCombatant.hasTalent(TALENTS_DRUID.CENARIUS_GUIDANCE_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER_PET)
        .spell([SPELLS.GROVE_GUARDIANS_SWIFTMEND, SPELLS.GROVE_GUARDIANS_NOURISH]),
      this.onGGHeal,
    );
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.GROVE_GUARDIANS_SUMMON),
      this.onGGSummon,
    );
  }

  onGGHeal(event: HealEvent) {
    const healAmount = event.amount + (event.absorbed || 0);
    const overhealAmount = event.overheal || 0;
    // if we have tree of life + CG + this heal is not from a hardcast GG summon, attribute to CG healing
    // need to check hasTolCenariusGuidance since GG summoned by convoke will be missed by the hardcast check
    if (
      this.hasTolCenariusGuidance &&
      event.sourceInstance &&
      !this.hardcastInstances.has(event.sourceInstance)
    ) {
      this.cgHealing += healAmount;
      this.cgOverhealing += overhealAmount;
    } else if (event.ability.guid === SPELLS.GROVE_GUARDIANS_SWIFTMEND.id) {
      this.hardcastSwiftmendHealing += healAmount;
      this.hardcastSwiftmendOverhealing += overhealAmount;
    } else if (event.ability.guid === SPELLS.GROVE_GUARDIANS_NOURISH.id) {
      this.hardcastNourishHealing += healAmount;
      this.hardcastNourishOverhealing += overhealAmount;
    }
  }

  onGGSummon(event: SummonEvent) {
    if (isFromHardcast(event) && event.targetInstance !== undefined) {
      this.hardcastInstances.add(event.targetInstance);
    }
  }

  get totalHardcastHealing() {
    return this.hardcastSwiftmendHealing + this.hardcastNourishHealing;
  }

  get totalHardcastOverhealing() {
    return this.hardcastSwiftmendOverhealing + this.hardcastNourishOverhealing;
  }

  /** Full talent value including Cenarius Guidance summons (Policy A) */
  get totalHealing() {
    return this.totalHardcastHealing + this.cgHealing;
  }

  get totalOverhealing() {
    return this.totalHardcastOverhealing + this.cgOverhealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Total healing from all Grove Guardians (including those summoned by{' '}
            <SpellLink spell={TALENTS_DRUID.CENARIUS_GUIDANCE_TALENT} /> when talented).
            <ul>
              <li>
                <SpellLink spell={SPELLS.GROVE_GUARDIANS_SWIFTMEND} /> (WG/SM summons):{' '}
                <strong>{this.owner.formatItemHealingDone(this.hardcastSwiftmendHealing)}</strong>
              </li>
              <li>
                <SpellLink spell={SPELLS.GROVE_GUARDIANS_NOURISH} /> (WG/SM summons):{' '}
                <strong>{this.owner.formatItemHealingDone(this.hardcastNourishHealing)}</strong>
              </li>
              {this.hasTolCenariusGuidance && (
                <li>
                  <SpellLink spell={TALENTS_DRUID.CENARIUS_GUIDANCE_TALENT} /> summons:{' '}
                  <strong>{this.owner.formatItemHealingDone(this.cgHealing)}</strong>
                </li>
              )}
            </ul>
            <strong>
              Overhealing: {formatOverhealing(this.totalOverhealing, this.totalHealing)}
            </strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.GROVE_GUARDIANS_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
