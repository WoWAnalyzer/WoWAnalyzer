import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { SHIFTING_POWER_MS_REDUCTION_PER_TICK, SHIFTING_POWER_REDUCTION_SPELLS } from './constants';

const debug = false;
class ShiftingPower extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  spellReductions: { [key: number]: number } = {};

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SHIFTING_POWER_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_POWER_TICK),
      this.onShiftingPowerTick,
    );
  }

  onShiftingPowerTick(event: CastEvent) {
    SHIFTING_POWER_REDUCTION_SPELLS.forEach((spell) => {
      if (this.spellUsable.isOnCooldown(spell.id)) {
        debug && this.log('Reduced ' + spell.name + ' by ' + SHIFTING_POWER_MS_REDUCTION_PER_TICK);
        const reduction = this.spellUsable.reduceCooldown(
          spell.id,
          SHIFTING_POWER_MS_REDUCTION_PER_TICK,
        );
        this.spellReductions[spell.id] = this.spellReductions[spell.id]
          ? reduction + this.spellReductions[spell.id]
          : reduction;
      }
    });
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spellId={TALENTS.SHIFTING_POWER_TALENT.id}>
          <>
            <small>Cooldown Reduction by Spell</small>
            <br />
            <table className="table-condensed">
              <tbody>
                {Object.entries(this.spellReductions).map((spell, index) => (
                  <tr key={index} style={{ fontSize: 16 }}>
                    <td>
                      <SpellLink id={Number(spell[0])} />
                    </td>
                    <td>{formatNumber(spell[1] / 1000)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ShiftingPower;
