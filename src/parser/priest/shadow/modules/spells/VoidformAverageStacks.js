import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

import { formatNumber } from 'common/format';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import ExpandableStatisticBox from 'interface/others/ExpandableStatisticBox';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import Voidform from './Voidform';

class VoidformAverageStacks extends Analyzer {
  static dependencies = {
    voidform: Voidform,
  };

  constructor(...args) {
    super(...args);
    this.active = true;
  }

  suggestions(when) {
    when(this.voidform.averageVoidformStacks).isLessThan(21.5)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <>
            Your <SpellLink id={SPELLS.VOIDFORM.id} /> stacks can be improved. Try to maximize the uptime by using <SpellLink id={SPELLS.VOID_BOLT.id} />, <SpellLink id={SPELLS.MIND_BLAST.id} />, and <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> on cooldown.<br /><br />

            Managing your <SpellLink id={SPELLS.VOIDFORM.id} />s is a large part of playing shadow. The recommended way is to try to keep your <SpellLink id={SPELLS.VOIDFORM.id} /> cycles to around 20 seconds each, meaning you will have access to <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> every other <SpellLink id={SPELLS.VOIDFORM.id} />.<br /><br />

            <SpellLink id={SPELLS.DISPERSION.id} /> can be used to synchronize your cooldowns back in order or in case of an emergency if you are about to fall out of <SpellLink id={SPELLS.VOIDFORM.id} /> and you have a <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> active. This should be used as a last resort as long as you will not need to use Dispersion defensively before it comes back up.
          </>
        )
          .icon(SPELLS.VOIDFORM_BUFF.icon)
          .actual(`${formatNumber(actual)} average Voidform stacks.`)
          .recommended(`>${formatNumber(recommended)} stacks is recommended.`)
          .regular(recommended).major(recommended - 5);
      });
  }

  statistic() {
    const { voidforms } = this.voidform;
    if (!voidforms || voidforms.length === 0) {
      return null;
    }

    const lastVoidformWasExcluded = voidforms[voidforms.length - 1].excluded;

    return (
      <ExpandableStatisticBox
        position={STATISTIC_ORDER.CORE(0)}
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
                    <th scope="row">{index + 1}</th>
                    <td>{voidform.stacks.length}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }
}

export default VoidformAverageStacks;
