import Analyzer, { Options } from 'parser/core/Analyzer';
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

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.GROVE_GUARDIANS_TALENT);
    this.hasWildSynthesis = this.selectedCombatant.hasTalent(TALENTS_DRUID.WILD_SYNTHESIS_TALENT);
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_DRUID.GROVE_GUARDIANS_TALENT} />
        </b>{' '}
        is an off-GCD heal that interacts minimally with the rest of your kit. Use it whenever extra
        throughput is needed, but also it's very efficient so you should avoid overcapping on
        charges.
      </p>
    );

    const data = <CastEfficiencyPanel spell={TALENTS_DRUID.GROVE_GUARDIANS_TALENT} useThresholds />;

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  get groveGuardiansHealing() {
    return (
      this.deps.abilityTracker.getAbility(SPELLS.GROVE_GUARDIANS_SWIFTMEND.id).healingEffective +
      this.deps.abilityTracker.getAbility(SPELLS.GROVE_GUARDIANS_NOURISH.id).healingEffective
    );
  }

  get wildSynthesisHealing() {
    return this.deps.abilityTracker.getAbility(SPELLS.GROVE_GUARDIANS_WILD_GROWTH.id)
      .healingEffective;
  }

  get totalHealing() {
    return this.groveGuardiansHealing + this.wildSynthesisHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          this.hasWildSynthesis ? (
            <>
              This is the sum of the direct healing from the base Grove Guardians (Swiftmend +
              Nourish) and the extra spell added by Wild Synthesis (Wild Growth).
              <ul>
                <li>
                  <SpellLink spell={TALENTS_DRUID.GROVE_GUARDIANS_TALENT} />:{' '}
                  <strong>{this.owner.formatItemHealingDone(this.groveGuardiansHealing)}</strong>
                </li>
                <li>
                  <SpellLink spell={TALENTS_DRUID.WILD_SYNTHESIS_TALENT} />:{' '}
                  <strong>{this.owner.formatItemHealingDone(this.wildSynthesisHealing)}</strong>
                </li>
              </ul>
            </>
          ) : undefined
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
