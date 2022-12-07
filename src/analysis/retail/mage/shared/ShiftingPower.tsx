import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
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
  conduitRank: number;

  spellReductions: { [key: number]: number } = {};

  constructor(options: Options) {
    super(options);
    this.active = false;
    this.conduitRank = 0;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_POWER_TICK),
      this.onShiftingPowerTick,
    );
  }

  onShiftingPowerTick(event: CastEvent) {
    const reductionPerTick = SHIFTING_POWER_MS_REDUCTION_PER_TICK;
    SHIFTING_POWER_REDUCTION_SPELLS.forEach((spell) => {
      if (this.spellUsable.isOnCooldown(spell.id)) {
        debug && this.log('Reduced ' + spell.name + ' by ' + reductionPerTick);
        const reduction = this.spellUsable.reduceCooldown(spell.id, reductionPerTick);
        this.spellReductions[spell.id] = this.spellReductions[spell.id]
          ? reduction + this.spellReductions[spell.id]
          : reduction;
      }
    });
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.COVENANTS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.SHIFTING_POWER.id}>
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
