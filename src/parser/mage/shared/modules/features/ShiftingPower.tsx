import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Channeling from 'parser/shared/modules/Channeling';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SHIFTING_POWER_MS_REDUCTION_PER_TICK, SHIFTING_POWER_REDUCTION_SPELLS } from 'parser/mage/shared/constants';
import { formatNumber } from 'common/format';

const debug = false;

class ShiftingPower extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    channeling: Channeling,
  }
  protected spellUsable!: SpellUsable;
  protected channeling!: Channeling;

  spellReductions: { [key: number]: number } =  {}

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_POWER_TICK), this.onShiftingPowerTick);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_POWER), this.onChannelStart);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_POWER), this.onChannelEnd);
  }

  onChannelStart(event: ApplyBuffEvent) {
    this.channeling.beginChannel(event);
  }

  onChannelEnd(event: RemoveBuffEvent) {
    this.channeling.endChannel(event);
  }

  onShiftingPowerTick(event: CastEvent) {
    const reductionPerTick = this.selectedCombatant.hasConduitBySpellID(SPELLS.DISCIPLINE_OF_THE_GROVE.id) ? SHIFTING_POWER_MS_REDUCTION_PER_TICK + 1000 : SHIFTING_POWER_MS_REDUCTION_PER_TICK;
    SHIFTING_POWER_REDUCTION_SPELLS.forEach(spell => {
      if (this.spellUsable.isOnCooldown(spell.id)) {
        debug && this.log('Reduced ' + spell.name + ' by ' + reductionPerTick);
        const reduction = this.spellUsable.reduceCooldown(spell.id, reductionPerTick);
        this.spellReductions[spell.id] = this.spellReductions[spell.id] ? reduction + this.spellReductions[spell.id] : reduction;
      }
    })
  }

  statistic() {
    return (
      <Statistic 
        category={STATISTIC_CATEGORY.COVENANTS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.SHIFTING_POWER}>
          <>
            <small>Cooldown Reduction by Spell</small><br />
            <table className="table-condensed">
              <tbody>
                {Object.entries(this.spellReductions).map((spell, index) => (
                  <tr key={index} style={{ fontSize: 16 }}>
                    <td><SpellLink id={Number(spell[0])} /></td>
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
