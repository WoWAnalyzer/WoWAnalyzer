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
import Events, { HealEvent, SummonEvent } from 'parser/core/Events';
import { isFromHardcast } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';

const deps = {
  abilityTracker: AbilityTracker,
};

/**
 * **Grove Guardians**
 * Spec Talent Tier 6
 *
 * Summons a Treant which will immediately cast Swiftmend on your current target, healing for X.
 * The Treant will cast Nourish on that target or a nearby ally periodically,
 * healing for X. Lasts 15 sec.
 *
 * **Wild Synthesis**
 * Spec Talent Tier 7
 *
 * Treants from Grove Guardians also cast Wild Growth immediately when summoned,
 * healing 5 allies within 40 yds for X over 7 sec.
 */
export default class GroveGuardians extends Analyzer.withDependencies(deps) {
  hasWildSynthesis: boolean;
  hasTolCenariusGuidance: boolean;

  /** Total healing done by hardcast GG's swiftmend */
  hardcastSwiftmendHealing: number = 0;
  /** Total healing done by hardcast GG's nourish */
  hardcastNourishHealing: number = 0;
  /** Total healing done by hardcast GG's wild growth */
  hardcastWildGrowthHealing: number = 0;
  /** Total healing done by GGs summoned by Cenarius Guidance (all spells) */
  cgHealing: number = 0;

  /** Set of GG instance numbers that were hardcast. If not in the set, we presume it was summoned by CG. */
  hardcastInstances: Set<number> = new Set<number>();

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.GROVE_GUARDIANS_TALENT);
    this.hasWildSynthesis = this.selectedCombatant.hasTalent(TALENTS_DRUID.WILD_SYNTHESIS_TALENT);
    this.hasTolCenariusGuidance =
      this.selectedCombatant.hasTalent(TALENTS_DRUID.CENARIUS_GUIDANCE_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER_PET)
        .spell([
          SPELLS.GROVE_GUARDIANS_SWIFTMEND,
          SPELLS.GROVE_GUARDIANS_NOURISH,
          SPELLS.GROVE_GUARDIANS_WILD_GROWTH,
        ]),
      this.onGGHeal,
    );
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(TALENTS_DRUID.GROVE_GUARDIANS_TALENT),
      this.onGGSummon,
    );
  }

  onGGHeal(event: HealEvent) {
    const healAmount = event.amount + (event.absorbed || 0);
    if (event.sourceInstance && !this.hardcastInstances.has(event.sourceInstance)) {
      this.cgHealing += healAmount;
    } else if (event.ability.guid === SPELLS.GROVE_GUARDIANS_SWIFTMEND.id) {
      this.hardcastSwiftmendHealing += healAmount;
    } else if (event.ability.guid === SPELLS.GROVE_GUARDIANS_NOURISH.id) {
      this.hardcastNourishHealing += healAmount;
    } else if (event.ability.guid === SPELLS.GROVE_GUARDIANS_WILD_GROWTH.id) {
      this.hardcastWildGrowthHealing += healAmount;
    }
  }

  onGGSummon(event: SummonEvent) {
    if (isFromHardcast(event) && event.targetInstance !== undefined) {
      this.hardcastInstances.add(event.targetInstance);
    }
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_DRUID.GROVE_GUARDIANS_TALENT} />
        </b>{' '}
        is an off-GCD heal that interacts minimally with the rest of your kit. Use it whenever extra
        throughput is needed. It's very efficient - avoid overcapping on charges.
      </p>
    );

    const data = <CastEfficiencyPanel spell={TALENTS_DRUID.GROVE_GUARDIANS_TALENT} useThresholds />;

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  get totalHardcastHealing() {
    return (
      this.hardcastSwiftmendHealing + this.hardcastNourishHealing + this.hardcastWildGrowthHealing
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
            {this.hasWildSynthesis && ' and the extra spell added by Wild Synthesis (Wild Growth).'}
            {this.hasTolCenariusGuidance && (
              <>
                {' '}
                This value does <strong>not</strong> include healing from Grove Guardians summoned
                by <SpellLink spell={TALENTS_DRUID.CENARIUS_GUIDANCE_TALENT} /> - this is only the
                hardcast number.
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
              {this.hasWildSynthesis && (
                <li>
                  <SpellLink spell={SPELLS.GROVE_GUARDIANS_WILD_GROWTH} />:{' '}
                  <strong>
                    {this.owner.formatItemHealingDone(this.hardcastWildGrowthHealing)}
                  </strong>
                </li>
              )}
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
