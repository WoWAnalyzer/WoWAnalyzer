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
import Events, { HealEvent, SummonEvent, CastEvent } from 'parser/core/Events';
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
  /** Total healing done by hardcast GG's nourish */
  hardcastNourishHealing = 0;
  /** Total healing done by GGs summoned by Cenarius Guidance (all spells) */
  cgHealing = 0;

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
        .spell([
          SPELLS.GROVE_GUARDIANS_SWIFTMEND,
          SPELLS.GROVE_GUARDIANS_NOURISH,
        ]),
      this.onGGHeal,
    );
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.GROVE_GUARDIANS_SUMMON),
      this.onGGSummon,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.CONVOKE_SPIRITS, SPELLS.SWIFTMEND, SPELLS.WILD_GROWTH]),
      this.onCast,
    )
  }

  onCast(event: CastEvent) {
    console.log("GG Cast event: ", event);
  }

  swiftmendCasts = 0;
  onGGHeal(event: HealEvent) {
    const healAmount = event.amount + (event.absorbed || 0);
    // if we have tree of life + CG + this heal is not from a hardcast GG summon, attribute to CG healing
    // need to check hasTolCenariusGuidance since GG summoned by convoke will be missed by the hardcast check
    if (event.sourceInstance && !this.hardcastInstances.has(event.sourceInstance)) {
      this.cgHealing += healAmount;
    } else if (event.ability.guid === SPELLS.GROVE_GUARDIANS_SWIFTMEND.id) {
      this.hardcastSwiftmendHealing += healAmount;
      this.swiftmendCasts += 1;
      console.log(this.swiftmendCasts);
    } else if (event.ability.guid === SPELLS.GROVE_GUARDIANS_NOURISH.id) {
      this.hardcastNourishHealing += healAmount;
    }
  }

  onGGSummon(event: SummonEvent) {
    if (isFromHardcast(event) && event.targetInstance !== undefined) {
      console.log("GG from hardcast: ", event);
      this.hardcastInstances.add(event.targetInstance);
    } else {
      console.log("GG Summoned with no link: ", event);
    }
  }

  get totalHardcastHealing() {
    return (
      this.hardcastSwiftmendHealing + this.hardcastNourishHealing
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            This is the sum of the direct healing from the base Grove Guardians (Swiftmend +
            Nourish)
            {this.hasTolCenariusGuidance && (
              <>
                {' '}
                This value does <strong>not</strong> include healing from Grove Guardians summoned
                by <SpellLink spell={TALENTS_DRUID.CENARIUS_GUIDANCE_TALENT} /> - this is only the
                number from Grove Guadians summoned from wild growth and swiftmend casts.
              </>
            )}
            <ul>
              <li>
                <SpellLink spell={SPELLS.GROVE_GUARDIANS_SWIFTMEND} />:{' '}
                <strong>{this.owner.formatItemHealingDone(this.hardcastSwiftmendHealing)}</strong>
              </li>
              <li>
                <SpellLink spell={SPELLS.GROVE_GUARDIANS_NOURISH} />:{' '}
                <strong>{this.owner.formatItemHealingDone(this.hardcastNourishHealing)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.GROVE_GUARDIANS_TALENT}>
          <ItemPercentHealingDone amount={this.totalHardcastHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
