import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import { formatPercentage } from 'common/format';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';

/**
 * Inoculating Extract -
 * Use: Inject 5 stacks of Mutating Antibodies into a friendly target for 30 sec. your direct heals on
 * that ally will consume a Mutating Antibody to restore an additional 3135 health. (1 Min, 30 Sec
 * Cooldown).
 */

const MINOR = 0.95;
const AVERAGE = 0.9;
const MAJOR = 0.8;


class InoculatingExtract extends Analyzer{
  static dependencies = {
    abilities: Abilities,
  };

  healing = 0;
  charges = 0;
  uses = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.INOCULATING_EXTRACT.id);

    if(this.active){
      this.abilities.add({
        spell: SPELLS.MUTATING_ANTIBODIES_INOCULATION,
        name: ITEMS.INOCULATING_EXTRACT.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  on_byPlayer_heal(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.MUTATING_ANTIBODY.id){
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.charges += 1;
    }
  }

  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.MUTATING_ANTIBODIES_INOCULATION.id){
      this.uses += 1;
    }
  }


  item(){
    return{
      item: ITEMS.INOCULATING_EXTRACT,
      result: (
        <React.Fragment>
          <dfn data-tip={`Used <b>${this.uses}</b> times, consuming <b>${this.charges}</b> charges.`}>
            <ItemHealingDone amount={this.healing} />
          </dfn>
        </React.Fragment>
      ),
    };
  }

  suggestions(when){
    const chargeEff = this.charges / (this.uses * 5);
    when(chargeEff).isLessThan(MINOR)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <React.Fragment>
            You had wasted charges from your <ItemLink id={ITEMS.INOCULATING_EXTRACT.id} />.
            Make sure that every buff placed on a target is consumed.
          </React.Fragment>
        ).icon(ITEMS.INOCULATING_EXTRACT.icon)
          .actual(`${formatPercentage(actual)}% charges used.`)
          .recommended(` ${formatPercentage(recommended)}% is recommended`)
          .regular(AVERAGE).major(MAJOR);
      });
  }

}


export default InoculatingExtract;
