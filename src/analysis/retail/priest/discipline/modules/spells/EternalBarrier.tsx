import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import PowerWordShield from './PowerWordShield';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'interface/SpellIcon';

class EternalBarrier extends Analyzer {
  static dependencies = {
    powerWordShield: PowerWordShield,
  };

  protected powerWordShield!: PowerWordShield;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.ETERNAL_BARRIER_TALENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Healing Breakdown:
            <ul>
              <li>
                <SpellIcon spell={SPELLS.POWER_WORD_SHIELD} /> Shield Strength Increase:{' '}
                {formatNumber(this.powerWordShield.eternalBarrierValue)}
              </li>
              <li>
                <SpellIcon spell={SPELLS.POWER_WORD_SHIELD} /> Extended Duration Healing:{' '}
                {formatNumber(this.powerWordShield.eternalBarrierExtensionHealing)}
              </li>
            </ul>
          </>
        }
      >
        <>
          <BoringSpellValueText spell={TALENTS_PRIEST.ETERNAL_BARRIER_TALENT}>
            <ItemHealingDone
              amount={
                this.powerWordShield.eternalBarrierValue +
                this.powerWordShield.eternalBarrierExtensionHealing
              }
            />{' '}
            <br />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default EternalBarrier;
