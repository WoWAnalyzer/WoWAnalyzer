import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * When your health is brought below 35%, you instantly heal for 10/20% of your maximum health.
 * Cannot occur more than once every 45 sec.
 *
 * Example log:
 */
class NaturesGuardian extends Analyzer {
  protected healthGained: number = 0;
  protected procCount: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.NATURES_GUARDIAN_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.NATURES_GUARDIAN_HEAL),
      this.onNaturesGuardianHeal,
    );
  }

  onNaturesGuardianHeal(event: HealEvent) {
    this.procCount += 1;
    this.healthGained += event.amount;
  }

  // TODO: add proc count to statistics
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(999)}
        size="small"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS_SHAMAN.NATURES_GUARDIAN_TALENT.id}>
          <>
            <ItemHealingDone amount={this.healthGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NaturesGuardian;
