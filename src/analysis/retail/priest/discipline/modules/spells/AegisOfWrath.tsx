import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import PowerWordShield from './PowerWordShield';

class AegisOfWrath extends Analyzer {
  static dependencies = {
    powerWordShield: PowerWordShield,
  };

  protected powerWordShield!: PowerWordShield;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.AEGIS_OF_WRATH_TALENT);

    if (!this.active) {
      return;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            This value is calculated from the healing contributed from the last 3 seconds of the
            applied <SpellLink id={SPELLS.ATONEMENT_BUFF.id} />.
          </>
        }
      >
        <>
          <BoringSpellValueText spellId={TALENTS_PRIEST.AEGIS_OF_WRATH_TALENT.id}>
            <ItemHealingDone amount={this.powerWordShield.aegisValue} /> <br />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default AegisOfWrath;
