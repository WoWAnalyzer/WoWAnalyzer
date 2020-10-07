import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { When } from 'parser/core/ParseResults';
import { formatNumber, formatPercentage } from 'common/format';

import SpellLink from 'common/SpellLink';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import Voidform from './Voidform';

class VoidformAverageStacks extends Analyzer {
  static dependencies = {
    voidform: Voidform,
  };
  protected voidform!: Voidform;

  constructor(options: any) {
    super(options);
    this.active = true;
  }

  suggestions(when: When) {
    when(this.voidform.averageVoidformStacks).isLessThan(21.5)
      .addSuggestion((suggest, actual, recommended) => suggest(
          <>
            Your <SpellLink id={SPELLS.VOIDFORM.id} /> stacks can be improved. Try to maximize the uptime by using <SpellLink id={SPELLS.VOID_BOLT.id} />, <SpellLink id={SPELLS.MIND_BLAST.id} />, and <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> on cooldown.<br /><br />

            Managing your <SpellLink id={SPELLS.VOIDFORM.id} />s is a large part of playing shadow. The recommended way is to try to keep your <SpellLink id={SPELLS.VOIDFORM.id} /> cycles to around 20 seconds each, meaning you will have access to <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> every other <SpellLink id={SPELLS.VOIDFORM.id} />.<br /><br />

            <SpellLink id={SPELLS.DISPERSION.id} /> can be used to synchronize your cooldowns back in order or in case of an emergency if you are about to fall out of <SpellLink id={SPELLS.VOIDFORM.id} /> and you have a <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> active. This should be used as a last resort as long as you will not need to use Dispersion defensively before it comes back up.
          </>,
        )
          .icon(SPELLS.VOIDFORM_BUFF.icon)
          .actual(`${formatNumber(actual)} average Voidform stacks.`)
          .recommended(`>${formatNumber(recommended)} stacks is recommended.`)
          .regular(recommended).major(recommended - 5));
  }

  statistic() {
    const { voidforms } = this.voidform;
    if (!voidforms || voidforms.length === 0) {
      return null;
    }

    const lastVoidformWasExcluded = voidforms[voidforms.length - 1].excluded;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(0)}
        size="flexible"
        tooltip={`The uptime and average stacks of your voidforms.${lastVoidformWasExcluded ? 'The last voidform of the fight was excluded since it skewed the average' : ''}. Time spent in dispersion (${Math.round(this.selectedCombatant.getBuffUptime(SPELLS.DISPERSION.id) / 1000)} seconds) is excluded from your uptime.`}
        dropdown={
          <table className="table table-condensed">
          <thead>
            <tr>
              <th>#</th>
              <th>Stacks</th>
            </tr>
          </thead>
          <tbody>
            {
              voidforms
                .map((voidform, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{voidform.stacks.length}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        }
      >
        <BoringSpellValueText spell={SPELLS.VOIDFORM}>
          <>
          {formatPercentage(this.voidform.uptime)}% <small>Uptime</small><br />
          {formatNumber(this.voidform.averageVoidformStacks)} <small>Average stacks</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VoidformAverageStacks;
