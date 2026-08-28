import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SymbioticBloomDirectClaim from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/SymbioticBloomDirectClaim';
import { PATIENT_CUSTODIAN_HOTS } from 'analysis/retail/druid/restoration/constants';

const PATIENT_CUSTODIAN_HEALING_INCREASE = 0.06;

/**
 * **Patient Custodian**
 * Hero Talent - Wildstalker
 *
 * Your heal over time effects are 6% more effective.
 *
 * Solo card uses full {@link healing}. Hero-tree {@link treeHealing} excludes amp on
 * Symbiotic Bloom ticks (those ticks are fully claimed by Thriving Growth / Implant / Twin).
 */
export default class PatientCustodian extends Analyzer {
  static dependencies = {
    symbioticBloomDirectClaim: SymbioticBloomDirectClaim,
  };

  protected symbioticBloomDirectClaim!: SymbioticBloomDirectClaim;

  healing = 0;
  overhealing = 0;
  /** Hero-tree total; skips amp on SymBloom ticks. */
  treeHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.PATIENT_CUSTODIAN_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(PATIENT_CUSTODIAN_HOTS),
      this.onHeal,
    );
  }

  private onHeal(event: HealEvent) {
    if (!event.tick) {
      return;
    }
    const amount = calculateEffectiveHealing(event, PATIENT_CUSTODIAN_HEALING_INCREASE);
    this.healing += amount;
    this.overhealing += calculateOverhealing(event, PATIENT_CUSTODIAN_HEALING_INCREASE);

    const claimed = this.symbioticBloomDirectClaim.getDirectClaimPortion(event);
    this.treeHealing += amount * (1 - claimed);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        tooltip={
          <>
            <strong>Overhealing: {formatOverhealing(this.overhealing, this.healing)}</strong>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.PATIENT_CUSTODIAN_TALENT}>
          <ItemPercentHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
