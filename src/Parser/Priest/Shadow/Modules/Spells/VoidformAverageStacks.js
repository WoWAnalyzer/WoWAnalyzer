import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

import { formatNumber } from 'common/format';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

import Voidform from './Voidform';


class VoidformAverageStacks extends Analyzer {
  static dependencies = {
    voidform: Voidform,
  };

  on_initialized() {
    this.active = true;
  }

  suggestions(when) {
    when(this.voidform.averageVoidformStacks).isLessThan(50)
			.addSuggestion((suggest, actual, recommended) => {
  return suggest(<span>Your <SpellLink id={SPELLS.VOIDFORM.id} /> stacks can be improved. Try to maximize the uptime by using <SpellLink id={SPELLS.VOID_TORRENT.id} />, <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> at optimal stacks.

				<br /><br />
				Managing your <SpellLink id={SPELLS.VOIDFORM.id} />s is a large part of playing shadow. The recommended way is to try to keep your <SpellLink id={SPELLS.VOIDFORM.id} /> cycles to around 60 seconds each, meaning you will have access to 1 <SpellLink id={SPELLS.VOID_TORRENT.id} /> & 1 <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> each <SpellLink id={SPELLS.VOIDFORM.id} />.
				<br /><br />
				A good practice is to use <SpellLink id={SPELLS.VOID_TORRENT.id} /> shortly after entering <SpellLink id={SPELLS.VOIDFORM.id} />. <br />
				At around 28-33 <SpellLink id={SPELLS.VOIDFORM.id} /> stacks, use <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} />.

				<br /><br />
    <SpellLink id={SPELLS.DISPERSION.id} /> can be used to synchronize your cooldowns back in order or in case of an emergency if you are about to fall out of <SpellLink id={SPELLS.VOIDFORM.id} /> and you have a <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> active.
				</span>)
			.icon(SPELLS.VOIDFORM_BUFF.icon)
			.actual(`${formatNumber(actual)} average Voidform stacks.`)
			.recommended(`>${formatNumber(recommended)} stacks is recommended.`)
			.regular(recommended).major(recommended - 5);
});
  }

  statistic() {
    const { voidforms } = this.voidform;
    if (!voidforms || voidforms.length === 0) return null;

    const lastVoidformWasExcluded = voidforms[voidforms.length - 1].excluded;

    return (<ExpandableStatisticBox
      icon={<SpellIcon id={SPELLS.VOIDFORM.id} />}
      value={`${formatNumber(this.voidform.averageVoidformStacks)} stacks`}
      label={(<dfn data-tip={`The average stacks of your voidforms.${lastVoidformWasExcluded ? 'The last voidform of the fight was excluded since it skewed the average.' : ''}`}>Average voidform</dfn>)}
    >
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
                  <th scope="row">{ index + 1 }</th>
                  <td>{ voidform.stacks.length}</td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </ExpandableStatisticBox>);
  }

  statisticOrder = STATISTIC_ORDER.CORE(0);
}

export default VoidformAverageStacks;
