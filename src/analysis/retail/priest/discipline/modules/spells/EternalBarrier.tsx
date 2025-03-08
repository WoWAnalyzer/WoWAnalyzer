import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import PowerWordShield from './PowerWordShield';
import { TIERS } from 'game/TIERS';

class EternalBarrier extends Analyzer {
  static dependencies = {
    powerWordShield: PowerWordShield,
  };

  protected powerWordShield!: PowerWordShield;

  constructor(options: Options) {
    super(options);

    // The math with the Vault of the Incarnates 4p bonus makes the calculation of this module innacurate.
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_PRIEST.ETERNAL_BARRIER_TALENT) &&
      !this.selectedCombatant.has4PieceByTier(TIERS.DF1);

    if (!this.active) {
      return;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <>
          <BoringSpellValueText spell={TALENTS_PRIEST.ETERNAL_BARRIER_TALENT}>
            <ItemHealingDone amount={this.powerWordShield.aegisOfWrathValue} /> <br />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default EternalBarrier;
